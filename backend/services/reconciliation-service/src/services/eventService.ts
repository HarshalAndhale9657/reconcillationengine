import { EventEmitter } from 'events';
import { TransactionSource, ReconciliationStatus } from '../../generated/prisma/enums';

export interface TransactionEvent {
    type: 'raw_transaction_added' | 'transaction_matched' | 'transaction_failed' | 'transaction_timeout' | 'error';
    transactionId: string;
    source?: TransactionSource;
    status?: ReconciliationStatus;
    error?: string;
    details?: string;
    timestamp: string;
    data?: any;
}

class EventService extends EventEmitter {
    private static instance: EventService;

    private constructor() {
        super();
    }

    static getInstance(): EventService {
        if (!EventService.instance) {
            EventService.instance = new EventService();
        }
        return EventService.instance;
    }

    emitTransactionEvent(event: TransactionEvent) {
        this.emit('transaction-event', event);
    }

    emitRawTransactionAdded(transactionId: string, source: TransactionSource, data: any) {
        this.emitTransactionEvent({
            type: 'raw_transaction_added',
            transactionId,
            source,
            timestamp: new Date().toISOString(),
            data
        });
    }

    emitTransactionMatched(transactionId: string, status: ReconciliationStatus, details?: string) {
        this.emitTransactionEvent({
            type: 'transaction_matched',
            transactionId,
            status,
            details,
            timestamp: new Date().toISOString()
        });
    }

    emitTransactionFailed(transactionId: string, status: ReconciliationStatus, details?: string) {
        this.emitTransactionEvent({
            type: 'transaction_failed',
            transactionId,
            status,
            details,
            timestamp: new Date().toISOString()
        });
    }

    emitTransactionTimeout(transactionId: string, details?: string) {
        this.emitTransactionEvent({
            type: 'transaction_timeout',
            transactionId,
            status: ReconciliationStatus.TIMEOUT_MISSING,
            details,
            timestamp: new Date().toISOString()
        });
    }

    emitError(transactionId: string, error: string) {
        this.emitTransactionEvent({
            type: 'error',
            transactionId,
            error,
            timestamp: new Date().toISOString()
        });
    }
}

export const eventService = EventService.getInstance();
