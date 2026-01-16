import { produceMessage } from "@backend/common";

let gatewayTxInterval: NodeJS.Timeout | null = null;
let count = 0;

export const logGatewayTx = async (): Promise<NodeJS.Timeout> => {
    if (gatewayTxInterval) {
        return gatewayTxInterval; // Already running
    }
    
    gatewayTxInterval = setInterval(async () => {
        const event = {
            transaction_id: `TX${count}`,
            source: "GATEWAY",
            amount: 1000,
            status: "PENDING",
            timestamp: new Date().toISOString()
        };
        await produceMessage(event, 'GATEWAY')
        count++;
    }, 30000);
    
    return gatewayTxInterval;
}

export const stopGatewayTx = () => {
    if (gatewayTxInterval) {
        clearInterval(gatewayTxInterval);
        gatewayTxInterval = null;
        count = 0;
    }
}

