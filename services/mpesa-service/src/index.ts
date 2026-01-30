import express, { Application, Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const db = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'fxplatform',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
});

// ============================================================================
// M-PESA CONFIGURATION
// ============================================================================

const MPESA_CONFIG = {
    consumerKey: process.env.MPESA_CONSUMER_KEY || '',
    consumerSecret: process.env.MPESA_CONSUMER_SECRET || '',
    passkey: process.env.MPESA_PASSKEY || '',
    shortCode: process.env.MPESA_BUSINESS_SHORT_CODE || '174379',
    environment: process.env.MPESA_ENVIRONMENT || 'sandbox',
};

const MPESA_BASE_URL = MPESA_CONFIG.environment === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';

// ============================================================================
// GET ACCESS TOKEN
// ============================================================================

async function getAccessToken(): Promise<string> {
    try {
        const auth = Buffer.from(
            `${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`
        ).toString('base64');

        const response = await axios.get(
            `${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
            {
                headers: {
                    Authorization: `Basic ${auth}`,
                },
            }
        );

        return response.data.access_token;
    } catch (error) {
        console.error('Error getting M-Pesa access token:', error);
        throw new Error('Failed to authenticate with M-Pesa');
    }
}

// ============================================================================
// GENERATE PASSWORD
// ============================================================================

function generatePassword(): { password: string; timestamp: string } {
    const timestamp = new Date()
        .toISOString()
        .replace(/[^0-9]/g, '')
        .slice(0, 14);

    const password = Buffer.from(
        `${MPESA_CONFIG.shortCode}${MPESA_CONFIG.passkey}${timestamp}`
    ).toString('base64');

    return { password, timestamp };
}

// ============================================================================
// INITIATE STK PUSH
// ============================================================================

interface STKPushRequest {
    phoneNumber: string;
    amount: number;
    accountReference: string;
    transactionDesc: string;
}

async function initiateStkPush(data: STKPushRequest): Promise<any> {
    try {
        const accessToken = await getAccessToken();
        const { password, timestamp } = generatePassword();

        // Format phone number (remove + and ensure it starts with 254)
        let phone = data.phoneNumber.replace(/\+/g, '');
        if (phone.startsWith('0')) {
            phone = '254' + phone.substring(1);
        }
        if (!phone.startsWith('254')) {
            phone = '254' + phone;
        }

        const requestBody = {
            BusinessShortCode: MPESA_CONFIG.shortCode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: Math.ceil(data.amount), // M-Pesa doesn't support decimals
            PartyA: phone,
            PartyB: MPESA_CONFIG.shortCode,
            PhoneNumber: phone,
            CallBackURL: `${process.env.API_BASE_URL || 'http://localhost:3001'}/webhooks/mpesa/callback`,
            AccountReference: data.accountReference,
            TransactionDesc: data.transactionDesc,
        };

        console.log('Initiating STK Push:', {
            phone,
            amount: requestBody.Amount,
            reference: data.accountReference,
        });

        const response = await axios.post(
            `${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
            requestBody,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        return response.data;
    } catch (error: any) {
        console.error('STK Push error:', error.response?.data || error.message);
        throw error;
    }
}

// ============================================================================
// ROUTES
// ============================================================================

// Initiate payment
app.post('/api/v1/mpesa/initiate', async (req: Request, res: Response) => {
    try {
        const { lockId, phoneNumber, amount } = req.body;

        if (!lockId || !phoneNumber || !amount) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
            });
        }

        // Verify lock exists and is active
        const lockResult = await db.query(
            'SELECT * FROM locks WHERE lock_id = $1 AND status = $2',
            [lockId, 'active']
        );

        if (lockResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Lock not found or not active',
            });
        }

        const lock = lockResult.rows[0];

        // Initiate STK Push
        const stkResponse = await initiateStkPush({
            phoneNumber,
            amount: parseFloat(lock.kes_required),
            accountReference: lockId,
            transactionDesc: `FX Lock Execution ${lockId.substring(0, 8)}`,
        });

        console.log('STK Push initiated:', stkResponse);

        // Store CheckoutRequestID in DB to map callback later
        await db.query(
            'UPDATE locks SET mpesa_checkout_request_id = $1 WHERE lock_id = $2',
            [stkResponse.CheckoutRequestID, lockId]
        );

        res.json({
            success: true,
            message: 'Payment request sent to your phone',
            data: {
                merchantRequestId: stkResponse.MerchantRequestID,
                checkoutRequestId: stkResponse.CheckoutRequestID,
                responseCode: stkResponse.ResponseCode,
                responseDescription: stkResponse.ResponseDescription,
            },
        });
    } catch (error: any) {
        console.error('Error initiating payment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to initiate payment',
            message: error.message,
        });
    }
});

// M-Pesa callback webhook
app.post('/webhooks/mpesa/callback', async (req: Request, res: Response) => {
    try {
        console.log('M-Pesa Callback received:', JSON.stringify(req.body, null, 2));

        const { Body } = req.body;

        if (!Body || !Body.stkCallback) {
            return res.status(200).send('OK');
        }

        const callback = Body.stkCallback;
        const resultCode = callback.ResultCode;

        if (resultCode === 0) {
            // Payment successful
            const metadata = callback.CallbackMetadata?.Item || [];

            const amount = metadata.find((item: any) => item.Name === 'Amount')?.Value;
            const mpesaReceiptNumber = metadata.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;
            const phoneNumber = metadata.find((item: any) => item.Name === 'PhoneNumber')?.Value;

            // Look up internal lockId from database using CheckoutRequestID
            const lockLookup = await db.query(
                'SELECT lock_id FROM locks WHERE mpesa_checkout_request_id = $1',
                [callback.CheckoutRequestID]
            );

            if (lockLookup.rows.length === 0) {
                console.error('Lock not found for CheckoutRequestID:', callback.CheckoutRequestID);
                return res.status(200).send('OK');
            }

            const lockId = lockLookup.rows[0].lock_id;

            console.log('Payment successful:', {
                lockId,
                amount,
                mpesaReceiptNumber,
                phoneNumber,
            });

            // Update lock status
            await db.query(
                `UPDATE locks 
         SET status = 'executed', 
             executed_at = NOW(), 
             mpesa_transaction_id = $1
         WHERE lock_id = $2`,
                [mpesaReceiptNumber, lockId]
            );

            // Create transaction record
            await db.query(
                `INSERT INTO transactions (
          lock_id, user_id, type, status, 
          kes_amount, mpesa_transaction_id, completed_at
        )
        SELECT 
          $1, user_id, 'lock_execute', 'completed',
          $2, $3, NOW()
        FROM locks WHERE lock_id = $1`,
                [lockId, amount, mpesaReceiptNumber]
            );

            // TODO: Trigger settlement process
            // - Convert KES to USDC on Binance
            // - Withdraw from Aave
            // - Deliver USD to recipient

        } else {
            // Payment failed
            console.log('Payment failed:', {
                resultCode,
                resultDesc: callback.ResultDesc,
            });
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('Error processing M-Pesa callback:', error);
        res.status(200).send('OK'); // Always return 200 to M-Pesa
    }
});

// Health check
app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        service: 'mpesa-service',
        timestamp: new Date().toISOString(),
    });
});

// ============================================================================
// START SERVER
// ============================================================================

async function startServer() {
    try {
        await db.query('SELECT NOW()');
        console.log('✅ Database connected');

        app.listen(PORT, () => {
            console.log(`🚀 M-Pesa Service running on port ${PORT}`);
            console.log(`📱 Environment: ${MPESA_CONFIG.environment}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

export default app;
