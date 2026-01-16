import dotenv from "dotenv";

dotenv.config();

export const INGESTION_SERVICE_PORT = process.env.INGESTION_SERVICE_PORT || 3002;