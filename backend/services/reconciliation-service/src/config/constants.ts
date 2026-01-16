import dotenv from "dotenv";

dotenv.config();

export const RECONCILIATION_SERVICE_PORT = process.env.RECONCILIATION_SERVICE_PORT || 3001;
export const NODE_ENV = process.env.NODE_ENV || "development";