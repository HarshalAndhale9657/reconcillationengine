import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { init } from '@backend/common'
import { startIngestion, stopIngestion, getIngestionStatus } from './services/index';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());


app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'ingestion-service' });
});


app.post('/ingestion/start', async (req, res) => {
    try {
        const result = await startIngestion();
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to start ingestion', error: String(error) });
    }
});

app.post('/ingestion/stop', (req, res) => {
    try {
        const result = stopIngestion();
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to stop ingestion', error: String(error) });
    }
});


app.get('/ingestion/status', (req, res) => {
    try {
        const status = getIngestionStatus();
        res.json(status);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get status', error: String(error) });
    }
});

(async () => {
    await init();
})();
export default app;