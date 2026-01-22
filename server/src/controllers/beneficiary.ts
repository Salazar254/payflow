import { Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db/mock';
import { v4 as uuidv4 } from 'uuid';

const beneficiarySchema = z.object({
    name: z.string().min(2),
    currency: z.string().length(3),
    bankDetails: z.record(z.string(), z.any()),
});

export const createBeneficiary = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?.userId;

    try {
        const { name, currency, bankDetails } = beneficiarySchema.parse(req.body);

        const beneficiary = {
            id: uuidv4(),
            userId,
            name,
            currency,
            bankDetails,
            createdAt: new Date()
        };

        db.beneficiaries.push(beneficiary);

        res.status(201).json({ beneficiary });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.issues });
        }
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getBeneficiaries = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?.userId;

    const beneficiaries = db.beneficiaries
        .filter(b => b.userId === userId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    res.json({ beneficiaries });
};
