import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Mock Exchange Rates (Base USD)
const RATES: Record<string, number> = {
    'USD': 1.0,
    'KES': 129.50,
    'EUR': 0.92,
    'GBP': 0.78,
    'CNY': 7.10,
};

const MARKUP_PERCENT = 0.02; // 2%
const FIXED_FEE_USD = 5.0;

export const getRates = (req: Request, res: Response) => {
    res.json(RATES);
};

export const getQuote = (req: Request, res: Response) => {
    const { from, to, amount } = req.query;

    const fromCurrency = (from as string).toUpperCase();
    const toCurrency = (to as string).toUpperCase();
    const amountVal = parseFloat(amount as string);

    if (!RATES[fromCurrency] || !RATES[toCurrency]) {
        return res.status(400).json({ error: 'Invalid currency' });
    }

    // Calculate Cross Rate
    // USD -> KES: 129.50
    // USD -> EUR: 0.92
    // EUR -> KES: (1/0.92) * 129.50 = 140.76

    const baseRate = RATES[toCurrency] / RATES[fromCurrency];
    const ourRate = baseRate * (1 - MARKUP_PERCENT); // We buy cheaper, sell higher? 
    // Wait, if User sends USD to KES. Bank gives 129. We give 127 (keep 2).
    // Yes, if converting From -> To.

    // Actually, the prompt says: "PayFlow rate: 1 USD = 127.00 KES (2% markup)"
    // So we give LESS to the target for the same source amount.
    // Rate should be LOWER than mid-market if multiply.

    const adjustedRate = baseRate * (1 - MARKUP_PERCENT);

    const convertedAmount = amountVal * adjustedRate;

    // Processing Fee in Source Currency? Or deducted?
    // "Fee: $100 (2%) + $5 processing"
    // Usually fees are deducted or added.
    // Prompt Example: $5000 USD -> KES.
    // Fee: $105.
    // Recipient gets KES 635,000.
    // 5000 * 127 = 635,000.
    // So the input amount is fully converted at the bad rate.
    // The fee is effectively the spread + the $5 flat fee.
    // Wait, if I charge $5 flat, do I deduct it from $5000?
    // Use case usually: "Send $5000".
    // If "Send $5000", does recipient get equivalent of $4995?
    // Example says: "Fee: $100 (2%) + $5 processing".
    // 2% of 5000 is 100.
    // So the markup IS the fee.
    // If I use the spread, the fee is implicit.
    // The User Interface might show it explicitly.

    res.json({
        quoteId: uuidv4(),
        fromCurrency,
        toCurrency,
        sourceAmount: amountVal,
        midMarketRate: baseRate,
        ourRate: adjustedRate,
        targetAmount: convertedAmount,
        fees: {
            spread: amountVal * baseRate - convertedAmount,
            processing: FIXED_FEE_USD
        },
        expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 min
    });
};
