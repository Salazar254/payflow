"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHistory = exports.createPayment = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const prisma = new client_1.PrismaClient();
const createPaymentSchema = zod_1.z.object({
    paymentType: zod_1.z.enum(['DEPOSIT', 'EXCHANGE', 'TRANSFER']), // Should match Prisma Enum values
    amount: zod_1.z.number().positive(),
    currency: zod_1.z.string().length(3),
    beneficiaryId: zod_1.z.string().optional(),
});
const createPayment = async (req, res) => {
    // @ts-ignore
    const userId = req.user?.userId;
    try {
        const { paymentType, amount, currency, beneficiaryId } = createPaymentSchema.parse(req.body);
        const transaction = await prisma.transaction.create({
            data: {
                userId,
                // @ts-ignore
                type: paymentType,
                fromCurrency: currency,
                fromAmount: amount,
                status: 'PENDING',
                // In a real app, we would process the transfer logic here
            }
        });
        res.status(201).json({ transaction });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createPayment = createPayment;
const getHistory = async (req, res) => {
    // @ts-ignore
    const userId = req.user?.userId;
    const transactions = await prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    });
    res.json({ transactions });
};
exports.getHistory = getHistory;
