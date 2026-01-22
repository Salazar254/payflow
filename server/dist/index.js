"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const auth_1 = __importDefault(require("./routes/auth"));
const fx_1 = __importDefault(require("./routes/fx"));
const payment_1 = __importDefault(require("./routes/payment"));
const beneficiary_1 = __importDefault(require("./routes/beneficiary"));
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.prisma = new client_1.PrismaClient();
const PORT = process.env.PORT || 3000;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/fx', fx_1.default);
app.use('/api/payments', payment_1.default);
app.use('/api/beneficiaries', beneficiary_1.default);
async function main() {
    try {
        // await prisma.$connect(); 
        // Commenting out connection block to allow server to start even if DB is missing for MVP demo (mock mode)
        // But controllers use prisma... so it will fail when hit. 
        // We should try to connect.
        await exports.prisma.$connect();
        console.log('Connected to Database');
    }
    catch (error) {
        console.warn('Database connection failed. Some features may not work.', error);
    }
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
main();
