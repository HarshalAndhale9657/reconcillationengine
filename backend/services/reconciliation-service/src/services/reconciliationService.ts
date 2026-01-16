import { KafkaManager,kafkaManager } from "@backend/common";
import { EachMessagePayload, KafkaConfig } from "kafkajs";
import { TransactionSource, ReconciliationStatus, TransactionStatus, AlertSeverity } from "../../generated/prisma/enums";
import { prisma } from '../../prisma/prisma'
import { eventService } from './eventService';
const REQUIRED_SOURCES: TransactionSource[] = [TransactionSource.APP, TransactionSource.BANK, TransactionSource.GATEWAY];
const RECONCILIATION_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

interface TransactionData {
    transaction_id: string;
    source: string;
    amount: number;
    status: string;
    timestamp: string;
}

interface PendingTransaction {
    transactionId: string;
    sources: Map<TransactionSource, TransactionData>;
    firstSeenAt: Date;
    timeoutId?: NodeJS.Timeout;
}

class ReconciliationService {
    private kafkaManager = kafkaManager;
    private pendingTransactions: Map<string, PendingTransaction> = new Map();

    constructor() {
       
        this.kafkaManager = kafkaManager;
    }

    async initialize() {
        console.log('Initializing reconciliation service...');
        await this.kafkaManager.connectAdmin();

        // Start consumers for all three topics
        await this.startConsumer(['APP', 'BANK', 'GATEWAY'], 'reconciliation-group');


        // Start timeout checker
        this.startTimeoutChecker();

        console.log('Reconciliation service initialized');
    }

    private async startConsumer(topics: string[], groupId: string) {
        const eachMessageHandler = async (payload: EachMessagePayload) => {
            try {
                const { message, topic } = payload;
                const value = message.value?.toString();

                if (!value) {
                    console.warn(`Empty message received from topic ${topic}`);
                    return;
                }

                const transactionData: TransactionData = JSON.parse(value);
                const source = topic as TransactionSource;
                await this.handleTransaction(transactionData, source);
            } catch (error) {
                console.error(`Error processing message from topic ${topics}:`, error);
                const transactionId = payload.message.value ? JSON.parse(payload.message.value.toString()).transaction_id : 'unknown';
                eventService.emitError(transactionId, `Error processing message: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        };

        await this.kafkaManager.initializeConsumer(topics, groupId, eachMessageHandler);
    }

    private async handleTransaction(data: TransactionData, source: TransactionSource) {
        const transactionId = data.transaction_id;
        console.log(`Received transaction ${transactionId} from ${source}`);

        await this.storeRawTransaction(data, source);

        let pending = this.pendingTransactions.get(transactionId);

        if (!pending) {
            pending = {
                transactionId,
                sources: new Map(),
                firstSeenAt: new Date()
            };
            this.pendingTransactions.set(transactionId, pending);

            pending.timeoutId = setTimeout(() => {
                this.handleTimeout(transactionId);
            }, RECONCILIATION_TIMEOUT_MS);
        }

        pending.sources.set(source, data);

        await this.updateTransactionState(transactionId, Array.from(pending.sources.keys()));

        if (this.hasAllSources(pending)) {
            await this.reconcileTransaction(transactionId, pending);
        }
    }

    private async storeRawTransaction(data: TransactionData, source: TransactionSource) {
        try {
            const rawTransaction = await prisma.transactionRaw.upsert({
                where: {
                    transactionId_source: {
                        transactionId: data.transaction_id,
                        source: source
                    }
                },
                create: {
                    transactionId: data.transaction_id,
                    source: source,
                    amount: data.amount,
                    status: this.mapStatus(data.status),
                    eventTimestamp: new Date(data.timestamp),
                },
                update: {
                    amount: data.amount,
                    status: this.mapStatus(data.status),
                    eventTimestamp: new Date(data.timestamp),
                }
            });

            // Emit event for new raw transaction
            eventService.emitRawTransactionAdded(data.transaction_id, source, {
                id: rawTransaction.id,
                amount: rawTransaction.amount,
                status: rawTransaction.status,
                eventTimestamp: rawTransaction.eventTimestamp,
                receivedAt: rawTransaction.receivedAt
            });
        } catch (error) {
            console.error(`Error storing raw transaction ${data.transaction_id} from ${source}:`, error);
            eventService.emitError(data.transaction_id, `Error storing raw transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private async updateTransactionState(transactionId: string, receivedSources: TransactionSource[]) {
        try {
            await prisma.transactionState.upsert({
                where: { transactionId },
                create: {
                    transactionId,
                    firstSeenAt: new Date(),
                    receivedSources: receivedSources,
                    state: ReconciliationStatus.INCOMPLETE
                },
                update: {
                    receivedSources: receivedSources,
                    lastUpdatedAt: new Date()
                }
            });
        } catch (error) {
            console.error(`Error updating transaction state for ${transactionId}:`, error);
        }
    }

    private hasAllSources(pending: PendingTransaction): boolean {
        return REQUIRED_SOURCES.every(source => pending.sources.has(source));
    }

    private async reconcileTransaction(transactionId: string, pending: PendingTransaction) {
        console.log(`Reconciling transaction ${transactionId}`);

        if (pending.timeoutId) {
            clearTimeout(pending.timeoutId);
        }

        const appTx = pending.sources.get(TransactionSource.APP);
        const bankTx = pending.sources.get(TransactionSource.BANK);
        const gatewayTx = pending.sources.get(TransactionSource.GATEWAY);

        if (!appTx || !bankTx || !gatewayTx) {
            console.error(`Missing transactions for ${transactionId}`);
            return;
        }

        const reconciliationResult = this.performReconciliation(appTx, bankTx, gatewayTx);

        await prisma.transactionState.update({
            where: { transactionId },
            data: {
                state: reconciliationResult.status,
                lastUpdatedAt: new Date()
            }
        });

        await prisma.reconciliationResult.upsert({
            where: { transactionId },
            create: {
                transactionId,
                reconciliationStatus: reconciliationResult.status,
                details: reconciliationResult.details
            },
            update: {
                reconciliationStatus: reconciliationResult.status,
                details: reconciliationResult.details
            }
        });

        if (reconciliationResult.status !== ReconciliationStatus.MATCHED) {
            await this.createAlerts(transactionId, reconciliationResult);
            // Emit failed event
            eventService.emitTransactionFailed(transactionId, reconciliationResult.status, reconciliationResult.details);
        } else {
            // Emit matched event
            eventService.emitTransactionMatched(transactionId, reconciliationResult.status, reconciliationResult.details);
        }

        this.pendingTransactions.delete(transactionId);

        console.log(`Reconciliation completed for ${transactionId}: ${reconciliationResult.status}`);
    }

    private performReconciliation(
        appTx: TransactionData,
        bankTx: TransactionData,
        gatewayTx: TransactionData
    ): { status: ReconciliationStatus; details: string } {
        const issues: string[] = [];

        const amounts = [appTx.amount, bankTx.amount, gatewayTx.amount];
        const uniqueAmounts = new Set(amounts);

        if (uniqueAmounts.size > 1) {
            issues.push(`Amount mismatch: APP=${appTx.amount}, BANK=${bankTx.amount}, GATEWAY=${gatewayTx.amount}`);
        }

        const statuses = [appTx.status, bankTx.status, gatewayTx.status];
        const uniqueStatuses = new Set(statuses);

        if (uniqueStatuses.size > 1) {
            issues.push(`Status mismatch: APP=${appTx.status}, BANK=${bankTx.status}, GATEWAY=${gatewayTx.status}`);
        }

        let status: ReconciliationStatus;
        if (issues.length === 0) {
            status = ReconciliationStatus.MATCHED;
        } else if (issues.some(issue => issue.includes('Amount'))) {
            status = ReconciliationStatus.AMOUNT_MISMATCH;
        } else if (issues.some(issue => issue.includes('Status'))) {
            status = ReconciliationStatus.STATUS_MISMATCH;
        } else {
            status = ReconciliationStatus.MATCHED;
        }

        return {
            status,
            details: issues.length > 0 ? issues.join('; ') : 'All transactions matched successfully'
        };
    }

    private async createAlerts(transactionId: string, reconciliationResult: { status: ReconciliationStatus; details: string }) {
        try {
            const reconciliation = await prisma.reconciliationResult.findUnique({
                where: { transactionId }
            });

            if (!reconciliation) {
                console.error(`Reconciliation result not found for ${transactionId}`);
                return;
            }

            let severity: AlertSeverity;
            if (reconciliationResult.status === ReconciliationStatus.AMOUNT_MISMATCH) {
                severity = AlertSeverity.HIGH;
            } else if (reconciliationResult.status === ReconciliationStatus.STATUS_MISMATCH) {
                severity = AlertSeverity.MEDIUM;
            } else {
                severity = AlertSeverity.LOW;
            }

            await prisma.alert.create({
                data: {
                    transactionId,
                    reconciliationId: reconciliation.id,
                    severity,
                    message: reconciliationResult.details
                }
            });
        } catch (error) {
            console.error(`Error creating alert for ${transactionId}:`, error);
        }
    }

    private async handleTimeout(transactionId: string) {
        console.log(`Timeout reached for transaction ${transactionId}`);

        const pending = this.pendingTransactions.get(transactionId);
        if (!pending) {
            return;
        }

        await prisma.transactionState.update({
            where: { transactionId },
            data: {
                state: ReconciliationStatus.TIMEOUT_MISSING,
                lastUpdatedAt: new Date()
            }
        });

        const missingSources = REQUIRED_SOURCES.filter(source => !pending.sources.has(source));
        await prisma.reconciliationResult.upsert({
            where: { transactionId },
            create: {
                transactionId,
                reconciliationStatus: ReconciliationStatus.TIMEOUT_MISSING,
                details: `Timeout: Missing sources: ${missingSources.join(', ')}`
            },
            update: {
                reconciliationStatus: ReconciliationStatus.TIMEOUT_MISSING,
                details: `Timeout: Missing sources: ${missingSources.join(', ')}`
            }
        });


        await this.createAlerts(transactionId, {
            status: ReconciliationStatus.TIMEOUT_MISSING,
            details: `Timeout: Missing sources: ${missingSources.join(', ')}`
        });

        // Emit timeout event
        eventService.emitTransactionTimeout(transactionId, `Timeout: Missing sources: ${missingSources.join(', ')}`);

        this.pendingTransactions.delete(transactionId);
    }

    private startTimeoutChecker() {

        setInterval(() => {
            const now = new Date();
            for (const [transactionId, pending] of this.pendingTransactions.entries()) {
                const age = now.getTime() - pending.firstSeenAt.getTime();
                if (age > RECONCILIATION_TIMEOUT_MS) {
                    console.log(`Cleaning up stale transaction ${transactionId}`);
                    this.handleTimeout(transactionId);
                }
            }
        }, 60000);
    }

    private mapStatus(status: string): TransactionStatus {
        const upperStatus = status.toUpperCase();
        if (upperStatus === 'SUCCESS') return TransactionStatus.SUCCESS;
        if (upperStatus === 'FAILED') return TransactionStatus.FAILED;
        if (upperStatus === 'PENDING') return TransactionStatus.PENDING;
        return TransactionStatus.PENDING; // Default
    }

    async shutdown() {
        console.log('Shutting down reconciliation service...');

        for (const pending of this.pendingTransactions.values()) {
            if (pending.timeoutId) clearTimeout(pending.timeoutId);
        }

        await this.kafkaManager.disconnectConsumer();
        await this.kafkaManager.disconnectAdmin();

        console.log('Reconciliation service shut down');
    }
}

export const reconciliationService = new ReconciliationService();
