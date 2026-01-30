import { Router, Request, Response } from 'express';
import { db, redisClient } from '../server';
import { calculateQuote } from '../utils/rate-logic';

const router = Router();

// ============================================================================
// GET CURRENT RATES
// ============================================================================
router.get('/current', async (_req: any, res: Response) => {
    try {
        // Try to get from cache first
        const cached = await redisClient.get('current_rates');

        if (cached) {
            const rates = JSON.parse(cached);
            return res.json({
                success: true,
                data: {
                    midMarket: rates.midMarket,
                    rates: {
                        instant: {
                            rate: rates.instant,
                            lockDuration: '2 hours',
                            spread: (rates.midMarket - rates.instant).toFixed(2),
                        },
                        '7day': {
                            rate: rates.day7,
                            lockDuration: '7 days',
                            spread: (rates.midMarket - rates.day7).toFixed(2),
                        },
                        '30day': {
                            rate: rates.day30,
                            lockDuration: '30 days',
                            spread: (rates.midMarket - rates.day30).toFixed(2),
                        },
                    },
                    bankRate: 131.0,
                    volatility: rates.volatility,
                    poolUtilization: rates.utilization,
                    timestamp: rates.timestamp,
                },
            });
        }

        // If not cached, return error
        res.status(503).json({
            success: false,
            error: 'Rate service temporarily unavailable',
            message: 'Please try again in a few seconds',
        });
    } catch (error) {
        console.error('Error fetching current rates:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});

// ============================================================================
// GET PERSONALIZED QUOTE
// ============================================================================
router.post('/quote', async (req: Request, res: Response) => {
    try {
        const { usdAmount, lockType } = req.body;

        // Validation
        if (!usdAmount || !lockType) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                message: 'usdAmount and lockType are required',
            });
        }

        if (usdAmount < 10 || usdAmount > 50000) {
            return res.status(400).json({
                success: false,
                error: 'Invalid amount',
                message: 'Amount must be between $10 and $50,000',
            });
        }

        if (!['instant', '7day', '30day'].includes(lockType)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid lock type',
                message: 'Lock type must be instant, 7day, or 30day',
            });
        }

        // Calculate quote
        const quote = await calculateQuote(usdAmount, lockType);

        // Cache the quote
        const quoteId = `quote:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
        await redisClient.setEx(
            quoteId,
            120, // 2 minutes
            JSON.stringify(quote)
        );

        res.json({
            success: true,
            data: {
                quoteId,
                usdAmount: quote.usdAmount,
                lockType: quote.lockType,
                rates: {
                    midMarket: quote.midMarketRate.toFixed(4),
                    quoted: quote.quotedRate.toFixed(4),
                    bank: '131.0000',
                },
                kesRequired: quote.kesRequired.toFixed(2),
                savings: {
                    amount: quote.savings.vsBank.toFixed(2),
                    percentage: quote.savings.percentage.toFixed(2),
                },
                breakdown: {
                    baseSpread: quote.spread.toFixed(2),
                    volatilityAdjustment: quote.volatilityAdjustment.toFixed(2),
                    utilizationAdjustment: quote.utilizationAdjustment.toFixed(2),
                },
                expiresAt: quote.expiresAt.toISOString(),
                validFor: '2 minutes',
            },
        });
    } catch (error) {
        console.error('Error generating quote:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to generate quote',
        });
    }
});

// ============================================================================
// GET RATE HISTORY
// ============================================================================
router.get('/history', async (req: Request, res: Response) => {
    try {
        const { period = '7d' } = req.query;

        let interval = '7 days';
        if (period === '24h') interval = '24 hours';
        if (period === '30d') interval = '30 days';

        const result = await db.query(
            `SELECT 
        time_bucket('1 hour', time) AS bucket,
        AVG(mid_market) as avg_rate,
        MIN(mid_market) as min_rate,
        MAX(mid_market) as max_rate
       FROM rate_history
       WHERE time >= NOW() - INTERVAL '${interval}'
       GROUP BY bucket
       ORDER BY bucket ASC`
        );

        res.json({
            success: true,
            data: {
                period,
                points: result.rows.map((row: any) => ({
                    timestamp: row.bucket,
                    avgRate: parseFloat(row.avg_rate),
                    minRate: parseFloat(row.min_rate),
                    maxRate: parseFloat(row.max_rate),
                })),
            },
        });
    } catch (error) {
        console.error('Error fetching rate history:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});

export default router;
