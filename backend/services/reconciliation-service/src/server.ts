import { RECONCILIATION_SERVICE_PORT } from "./config/constants";
import app from "./app";
import { reconciliationService } from "./services/reconciliationService";
import { prisma } from '../prisma/prisma'


async function startServer() {
    try {
        // Initialize reconciliation service
        await reconciliationService.initialize();
        // console.log(prisma)
        // Start HTTP server
        app.listen(RECONCILIATION_SERVICE_PORT, () => {
            console.log(`Reconciliation service is running on port ${RECONCILIATION_SERVICE_PORT}`);
        });

        // Graceful shutdown
        process.on('SIGTERM', async () => {
            console.log('SIGTERM received, shutting down gracefully...');
            await reconciliationService.shutdown();
            process.exit(0);
        });

        process.on('SIGINT', async () => {
            console.log('SIGINT received, shutting down gracefully...');
            await reconciliationService.shutdown();
            process.exit(0);
        });
    } catch (error) {
        console.error('Failed to start reconciliation service:', error);
        process.exit(1);
    }
}

startServer();
