"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBeneficiaries = exports.createBeneficiary = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const prisma = new client_1.PrismaClient();
const beneficiarySchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    currency: zod_1.z.string().length(3),
    bankDetails: zod_1.z.record(zod_1.z.string(), zod_1.z.any()), // Allow flexible JSON for now
});
const createBeneficiary = async (req, res) => {
    // @ts-ignore
    const userId = req.user?.userId;
    try {
        const { name, currency, bankDetails } = beneficiarySchema.parse(req.body);
        const beneficiary = await prisma.beneficiary.create({
            data: {
                userId,
                name,
                currency,
                bankDetails,
            }
        });
        res.status(201).json({ beneficiary });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createBeneficiary = createBeneficiary;
const getBeneficiaries = async (req, res) => {
    // @ts-ignore
    const userId = req.user?.userId;
    const beneficiaries = await prisma.beneficiary.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    });
    res.json({ beneficiaries });
};
exports.getBeneficiaries = getBeneficiaries;
