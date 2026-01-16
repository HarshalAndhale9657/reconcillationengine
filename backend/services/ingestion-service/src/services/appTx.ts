import { produceMessage } from "@backend/common";

let appTxInterval: NodeJS.Timeout | null = null;
let count = 0;

export const logAppTx = async (): Promise<NodeJS.Timeout> => {
    if (appTxInterval) {
        return appTxInterval; // Already running
    }
    
    appTxInterval = setInterval(async () => {
        const event = {
            transaction_id: `TX${count}`,
            source: "APP",
            amount: 1000,
            status: "PENDING",
            timestamp: new Date().toISOString()
        };
        await produceMessage(event, 'APP')
        count++;
    }, 30000);
    
    return appTxInterval;
}

export const stopAppTx = () => {
    if (appTxInterval) {
        clearInterval(appTxInterval);
        appTxInterval = null;
        count = 0;
    }
}

