import { Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db/mock';
import { v4 as uuidv4 } from 'uuid';

const createPaymentSchema = z.object({
    paymentType: z.enum(['DEPOSIT', 'EXCHANGE', 'TRANSFER']),
    amount: z.number().positive(),
    currency: z.string().length(3),
    beneficiaryId: z.string().optional(),
});

export const createPayment = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?.userId;

    try {
        const { paymentType, amount, currency, beneficiaryId } = createPaymentSchema.parse(req.body);

        const transaction = {
            id: uuidv4(),
            userId,
            type: paymentType,
            fromCurrency: currency,
            fromAmount: amount,
            status: 'PENDING',
            createdAt: new Date(),
        };

        db.transactions.push(transaction);

        res.status(201).json({ transaction });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.issues });
        }
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getHistory = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?.userId;

    const transactions = db.transactions
        .filter(t => t.userId === userId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    res.json({ transactions });
};
