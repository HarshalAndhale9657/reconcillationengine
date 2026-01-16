import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { AppError, errorHandler } from "@backend/common";
import { NODE_ENV } from "./config/constants";
import sseRoutes from "./routes/sseRoutes";
import queryRoutes from "./routes/queryRoutes";

dotenv.config();

const app: express.Application = express();

app.use(cors());
app.use(express.json());

app.use('/api', sseRoutes);
app.use('/api', queryRoutes);


app.get('/health', (req: express.Request, res: express.Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});


app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    errorHandler(err, req, res, next, NODE_ENV);
});

export default app;