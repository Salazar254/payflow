import { db, redisClient } from '../server';

export interface RateQuote {
    usdAmount: number;
    lockType: string;
    midMarketRate: number;
    quotedRate: number;
    kesRequired: number;
    expiresAt: Date;
    savings: {
        vsBank: number;
        percentage: number;
    };
    spread: number;
    volatilityAdjustment: number;
    utilizationAdjustment: number;
}

const BANK_RATE = 131.0;

const BASE_SPREADS = {
    instant: 0.8,
    '7day': 1.4,
    '30day': 2.2,
};

export async function calculateQuote(
    usdAmount: number,
    lockType: 'instant' | '7day' | '30day'
): Promise<RateQuote> {
    // 1. Get mid-market rate (simulated fallback for now)
    let midMarketRate = 129.5;
    try {
        const result = await db.query(
            "SELECT mid_market FROM rate_history ORDER BY time DESC LIMIT 1"
        );
        if (result.rows[0]) {
            midMarketRate = parseFloat(result.rows[0].mid_market);
        }
    } catch (err) {
        console.warn('DB not initialized for rates, using fallback');
    }

    // 2. Base spread
    let spread = BASE_SPREADS[lockType] || 1.5;

    // 3. Volatility adjustment (simulated for now)
    const volatilityAdjustment = 0;
    const utilizationAdjustment = 0;

    // 4. Calculate quoted rate
    const quotedRate = midMarketRate - spread;
    const kesRequired = usdAmount * quotedRate;

    // 5. Savings vs bank
    const bankTotal = usdAmount * BANK_RATE;
    const savings = bankTotal - kesRequired;
    const savingsPercentage = (savings / bankTotal) * 100;

    return {
        usdAmount,
        lockType,
        midMarketRate,
        quotedRate,
        kesRequired,
        expiresAt: new Date(Date.now() + 2 * 60 * 1000), // 2 min
        savings: {
            vsBank: savings,
            percentage: savingsPercentage,
        },
        spread,
        volatilityAdjustment,
        utilizationAdjustment,
    };
}
