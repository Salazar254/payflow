import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import fxRoutes from './routes/fx';
import paymentRoutes from './routes/payment';
import beneficiaryRoutes from './routes/beneficiary';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date(), mode: 'MOCK_DB' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/fx', fxRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/beneficiaries', beneficiaryRoutes);

async function main() {
    console.log('Starting server in Mock Mode (No Database Connection)...');
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

main();
