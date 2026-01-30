import { Router, Response } from 'express';
import { z } from 'zod';
import { db } from '../server';
import { authenticate, AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';
// ethers removed as it was unused in this route

const router = Router();

// Validation schemas
const createLockSchema = z.object({
    quoteId: z.string(),
    usdAmount: z.number().min(10).max(50000),
    lockType: z.enum(['instant', '7day', '30day']),
});

// ============================================================================
// CREATE LOCK
// ============================================================================
router.post('/create', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { quoteId, usdAmount, lockType } = createLockSchema.parse((req as any).body);
        const userId = req.userId;

        // Verify quote exists and is valid
        const quote = await redisClient.get(quoteId);
        if (!quote) {
            return res.status(400).json({
                success: false,
                error: 'Invalid or expired quote',
                message: 'Please request a new quote',
            });
        }

        const quoteData = JSON.parse(quote);

        // Verify user's KYC status
        const userResult = await db.query(
            'SELECT kyc_status FROM users WHERE user_id = $1',
            [userId]
        );

        if (userResult.rows[0]?.kyc_status !== 'verified') {
            return res.status(403).json({
                success: false,
                error: 'KYC verification required',
                message: 'Please complete KYC verification before creating locks',
            });
        }

        // Check user's active locks count
        const activeLocksResult = await db.query(
            `SELECT COUNT(*) as count FROM locks 
       WHERE user_id = $1 AND status = 'active'`,
            [userId]
        );

        const activeLocks = parseInt(activeLocksResult.rows[0].count);
        if (activeLocks >= 10) {
            return res.status(400).json({
                success: false,
                error: 'Too many active locks',
                message: 'Maximum 10 active locks allowed per user',
            });
        }

        // Calculate expiry
        const lockDurations = {
            instant: 2 * 60 * 60 * 1000, // 2 hours
            '7day': 7 * 24 * 60 * 60 * 1000,
            '30day': 30 * 24 * 60 * 60 * 1000,
        };

        const expiresAt = new Date(Date.now() + lockDurations[lockType as keyof typeof lockDurations]);

        // Create lock in database
        const result = await db.query(
            `INSERT INTO locks (
        user_id, usd_amount, kes_required, locked_rate, 
        lock_type, status, expires_at, quote_id, 
        bank_rate, savings_amount
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING lock_id, created_at`,
            [
                userId,
                usdAmount,
                quoteData.kesRequired,
                quoteData.quotedRate,
                lockType,
                'pending', // Will be 'active' after blockchain confirmation
                expiresAt,
                quoteId,
                131.0, // Bank rate
                quoteData.savings.vsBank,
            ]
        );

        const lock = result.rows[0];

        // TODO: Call smart contract to create lock on-chain
        // This would be done by the lock-manager service
        // For now, we'll mark it as active immediately

        await db.query(
            'UPDATE locks SET status = $1 WHERE lock_id = $2',
            ['active', lock.lock_id]
        );

        logger.info(`Lock created: ${lock.lock_id} by user ${userId}`);

        res.status(201).json({
            success: true,
            data: {
                lockId: lock.lock_id,
                usdAmount,
                kesRequired: quoteData.kesRequired,
                lockedRate: quoteData.quotedRate,
                lockType,
                status: 'active',
                createdAt: lock.created_at,
                expiresAt,
                savings: quoteData.savings,
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.errors,
            });
        }

        logger.error('Error creating lock:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to create lock',
        });
    }
});

// ============================================================================
// GET LOCK DETAILS
// ============================================================================
router.get('/:lockId', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { lockId } = req.params;
        const userId = req.userId;

        const result = await db.query(
            `SELECT 
        l.*,
        EXTRACT(EPOCH FROM (l.expires_at - NOW())) / 3600 as hours_remaining
       FROM locks l
       WHERE l.lock_id = $1 AND l.user_id = $2`,
            [lockId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Lock not found',
            });
        }

        const lock = result.rows[0];

        res.json({
            success: true,
            data: {
                lockId: lock.lock_id,
                usdAmount: parseFloat(lock.usd_amount),
                kesRequired: parseFloat(lock.kes_required),
                lockedRate: parseFloat(lock.locked_rate),
                lockType: lock.lock_type,
                status: lock.status,
                createdAt: lock.created_at,
                expiresAt: lock.expires_at,
                executedAt: lock.executed_at,
                hoursRemaining: Math.max(0, parseFloat(lock.hours_remaining)),
                savings: {
                    amount: parseFloat(lock.savings_amount),
                    vsBank: 131.0,
                },
                mpesaTransactionId: lock.mpesa_transaction_id,
            },
        });
    } catch (error) {
        logger.error('Error fetching lock:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});

// ============================================================================
// GET USER'S LOCKS
// ============================================================================
router.get('/user/:userId', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req.params;

        // Verify user can only access their own locks
        if (userId !== req.userId) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden',
                message: 'You can only access your own locks',
            });
        }

        const { status, limit = 50, offset = 0 } = req.query;

        let query = `
      SELECT 
        l.*,
        EXTRACT(EPOCH FROM (l.expires_at - NOW())) / 3600 as hours_remaining
      FROM locks l
      WHERE l.user_id = $1
    `;

        const params: any[] = [userId];

        if (status) {
            query += ` AND l.status = $${params.length + 1}`;
            params.push(status);
        }

        query += ` ORDER BY l.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await db.query(query, params);

        res.json({
            success: true,
            data: {
                locks: result.rows.map((lock: any) => ({
                    lockId: lock.lock_id,
                    usdAmount: parseFloat(lock.usd_amount),
                    kesRequired: parseFloat(lock.kes_required),
                    lockedRate: parseFloat(lock.locked_rate),
                    lockType: lock.lock_type,
                    status: lock.status,
                    createdAt: lock.created_at,
                    expiresAt: lock.expires_at,
                    executedAt: lock.executed_at,
                    hoursRemaining: Math.max(0, parseFloat(lock.hours_remaining || 0)),
                    savings: parseFloat(lock.savings_amount),
                })),
                pagination: {
                    limit: parseInt(limit as string),
                    offset: parseInt(offset as string),
                    total: result.rowCount,
                },
            },
        });
    } catch (error) {
        logger.error('Error fetching user locks:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});

// ============================================================================
// EXECUTE LOCK (Initiate M-Pesa payment)
// ============================================================================
router.post('/:lockId/execute', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { lockId } = req.params;
        const { phoneNumber } = (req as any).body;
        const userId = req.userId;

        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                error: 'Phone number required',
            });
        }

        // Get lock details
        const result = await db.query(
            `SELECT * FROM locks 
       WHERE lock_id = $1 AND user_id = $2`,
            [lockId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Lock not found',
            });
        }

        const lock = result.rows[0];

        if (lock.status !== 'active') {
            return res.status(400).json({
                success: false,
                error: 'Lock not active',
                message: `Lock status is ${lock.status}`,
            });
        }

        if (new Date(lock.expires_at) < new Date()) {
            return res.status(400).json({
                success: false,
                error: 'Lock expired',
            });
        }

        // TODO: Initiate M-Pesa STK Push
        // This would call the mpesa-service
        // For now, return success with instructions

        logger.info(`Lock execution initiated: ${lockId}`);

        res.json({
            success: true,
            message: 'M-Pesa payment initiated',
            data: {
                lockId,
                amount: parseFloat(lock.kes_required),
                phoneNumber,
                instructions: 'Please check your phone for M-Pesa prompt',
            },
        });
    } catch (error: any) {
        logger.error('Error executing lock:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});

// ============================================================================
// CANCEL LOCK
// ============================================================================
router.post('/:lockId/cancel', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { lockId } = req.params;
        const userId = req.userId;

        const result = await db.query(
            `UPDATE locks 
       SET status = 'cancelled', cancelled_at = NOW()
       WHERE lock_id = $1 AND user_id = $2 AND status = 'active'
       RETURNING *`,
            [lockId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Cannot cancel lock',
                message: 'Lock not found or not active',
            });
        }

        logger.info(`Lock cancelled: ${lockId} by user ${userId}`);

        res.json({
            success: true,
            message: 'Lock cancelled successfully',
            data: {
                lockId,
                status: 'cancelled',
                cancelledAt: result.rows[0].cancelled_at,
            },
        });
    } catch (error: any) {
        logger.error('Error cancelling lock:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});

export default router;
