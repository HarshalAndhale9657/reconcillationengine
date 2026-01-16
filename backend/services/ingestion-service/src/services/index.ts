import { logAppTx, stopAppTx } from './appTx'
import { logGatewayTx, stopGatewayTx } from './gatewayTx'
import { logBankTx, stopBankTx } from './bankTx'

let isRunning = false;

export async function startIngestion() {
    if (isRunning) {
        return { success: false, message: 'Ingestion is already running' };
    }

    isRunning = true;
    
    // Start all three transaction loggers
    await logAppTx();
    setTimeout(async () => await logGatewayTx(), 1000);
    setTimeout(async () => await logBankTx(), 2000);

    return { success: true, message: 'Ingestion started successfully' };
}

export function stopIngestion() {
    if (!isRunning) {
        return { success: false, message: 'Ingestion is not running' };
    }

    isRunning = false;
    
    // Stop all transaction loggers
    stopAppTx();
    stopGatewayTx();
    stopBankTx();

    return { success: true, message: 'Ingestion stopped successfully' };
}

export function getIngestionStatus() {
    return { isRunning, message: isRunning ? 'Ingestion is running' : 'Ingestion is stopped' };
}

// Auto-start if AUTO_START environment variable is set
if (process.env.AUTO_START === 'true') {
    startIngestion();
}