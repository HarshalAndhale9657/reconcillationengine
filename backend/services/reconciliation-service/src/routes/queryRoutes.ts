import express from 'express';
import { prisma } from '../../prisma/prisma';
import { ReconciliationStatus, TransactionSource } from '../../generated/prisma/enums';

const router: express.Router = express.Router();

// Get all matched transactions
router.get('/transactions/matched', async (req: express.Request, res: express.Response) => {
    try {
        const { page = '1', limit = '50' } = req.query;
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const skip = (pageNum - 1) * limitNum;

        const [transactions, total] = await Promise.all([
            prisma.reconciliationResult.findMany({
                where: {
                    reconciliationStatus: ReconciliationStatus.MATCHED
                },
                include: {
                    state: {
                        include: {
                            reconciliation: true
                        }
                    },
                    alerts: true
                },
                orderBy: {
                    reconciledAt: 'desc'
                },
                skip,
                take: limitNum
            }),
            prisma.reconciliationResult.count({
                where: {
                    reconciliationStatus: ReconciliationStatus.MATCHED
                }
            })
        ]);

        res.json({
            transactions,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get all failed/mismatched transactions
router.get('/transactions/failed', async (req: express.Request, res: express.Response) => {
    try {
        const { page = '1', limit = '50' } = req.query;
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const skip = (pageNum - 1) * limitNum;

        const [transactions, total] = await Promise.all([
            prisma.reconciliationResult.findMany({
                where: {
                    reconciliationStatus: {
                        not: ReconciliationStatus.MATCHED
                    }
                },
                include: {
                    state: {
                        include: {
                            reconciliation: true
                        }
                    },
                    alerts: true
                },
                orderBy: {
                    reconciledAt: 'desc'
                },
                skip,
                take: limitNum
            }),
            prisma.reconciliationResult.count({
                where: {
                    reconciliationStatus: {
                        not: ReconciliationStatus.MATCHED
                    }
                }
            })
        ]);

        res.json({
            transactions,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get all transactions with their states
router.get('/transactions', async (req: express.Request, res: express.Response) => {
    try {
        const { page = '1', limit = '50', status, source } = req.query;
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};
        if (status) {
            where.state = status as ReconciliationStatus;
        }

        const [transactions, total] = await Promise.all([
            prisma.transactionState.findMany({
                where,
                include: {
                    reconciliation: {
                        include: {
                            alerts: true
                        }
                    }
                },
                orderBy: {
                    lastUpdatedAt: 'desc'
                },
                skip,
                take: limitNum
            }),
            prisma.transactionState.count({ where })
        ]);

        // If source filter is provided, filter by raw transactions
        let filteredTransactions = transactions;
        if (source) {
            const rawTransactions = await prisma.transactionRaw.findMany({
                where: {
                    source: source as TransactionSource
                },
                select: {
                    transactionId: true
                }
            });
            const transactionIds = new Set(rawTransactions.map(t => t.transactionId));
            filteredTransactions = transactions.filter(t => transactionIds.has(t.transactionId));
        }

        res.json({
            transactions: filteredTransactions,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total: filteredTransactions.length,
                totalPages: Math.ceil(filteredTransactions.length / limitNum)
            }
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get a specific transaction by ID
router.get('/transactions/:transactionId', async (req: express.Request, res: express.Response) => {
    try {
        const { transactionId } = req.params;

        const [state, rawTransactions, reconciliation] = await Promise.all([
            prisma.transactionState.findUnique({
                where: { transactionId },
                include: {
                    reconciliation: {
                        include: {
                            alerts: true
                        }
                    }
                }
            }),
            prisma.transactionRaw.findMany({
                where: { transactionId },
                orderBy: {
                    receivedAt: 'asc'
                }
            }),
            prisma.reconciliationResult.findUnique({
                where: { transactionId },
                include: {
                    alerts: true
                }
            })
        ]);

        if (!state) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        res.json({
            transactionId,
            state,
            rawTransactions,
            reconciliation
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get all raw transactions
router.get('/raw-transactions', async (req: express.Request, res: express.Response) => {
    try {
        const { page = '1', limit = '50', transactionId, source } = req.query;
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};
        if (transactionId) {
            where.transactionId = transactionId as string;
        }
        if (source) {
            where.source = source as TransactionSource;
        }

        const [rawTransactions, total] = await Promise.all([
            prisma.transactionRaw.findMany({
                where,
                orderBy: {
                    receivedAt: 'desc'
                },
                skip,
                take: limitNum
            }),
            prisma.transactionRaw.count({ where })
        ]);

        res.json({
            rawTransactions,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get all alerts
router.get('/alerts', async (req: express.Request, res: express.Response) => {
    try {
        const { page = '1', limit = '50', severity, resolved, transactionId } = req.query;
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};
        if (severity) {
            where.severity = severity;
        }
        if (resolved !== undefined) {
            where.resolved = resolved === 'true';
        }
        if (transactionId) {
            where.transactionId = transactionId as string;
        }

        const [alerts, total] = await Promise.all([
            prisma.alert.findMany({
                where,
                include: {
                    reconciliation: {
                        include: {
                            state: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take: limitNum
            }),
            prisma.alert.count({ where })
        ]);

        res.json({
            alerts,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get reconciliation statistics
router.get('/stats', async (req: express.Request, res: express.Response) => {
    try {
        const [
            totalTransactions,
            matchedCount,
            amountMismatchCount,
            statusMismatchCount,
            timeoutCount,
            incompleteCount,
            totalAlerts,
            unresolvedAlerts
        ] = await Promise.all([
            prisma.transactionState.count(),
            prisma.reconciliationResult.count({
                where: { reconciliationStatus: ReconciliationStatus.MATCHED }
            }),
            prisma.reconciliationResult.count({
                where: { reconciliationStatus: ReconciliationStatus.AMOUNT_MISMATCH }
            }),
            prisma.reconciliationResult.count({
                where: { reconciliationStatus: ReconciliationStatus.STATUS_MISMATCH }
            }),
            prisma.reconciliationResult.count({
                where: { reconciliationStatus: ReconciliationStatus.TIMEOUT_MISSING }
            }),
            prisma.transactionState.count({
                where: { state: ReconciliationStatus.INCOMPLETE }
            }),
            prisma.alert.count(),
            prisma.alert.count({
                where: { resolved: false }
            })
        ]);

        res.json({
            totalTransactions,
            matched: matchedCount,
            amountMismatch: amountMismatchCount,
            statusMismatch: statusMismatchCount,
            timeout: timeoutCount,
            incomplete: incompleteCount,
            totalAlerts,
            unresolvedAlerts,
            matchRate: totalTransactions > 0 ? (matchedCount / totalTransactions) * 100 : 0
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
