import { v4 as uuidv4 } from 'uuid';

export const db = {
    users: [] as any[],
    wallets: [] as any[],
    transactions: [] as any[],
    beneficiaries: [] as any[],
};

// Seed Mock Data
const demoUser = {
    id: 'demo-user-id',
    email: 'demo@example.com',
    password: 'hashed-password-placeholder', // In a real mock we might skip hashing or use a fixed hash
    name: 'Demo User',
    role: 'USER'
};

db.users.push(demoUser);
db.wallets.push({
    id: uuidv4(),
    userId: demoUser.id,
    currency: 'USD',
    balance: 50000,
    updatedAt: new Date()
});
