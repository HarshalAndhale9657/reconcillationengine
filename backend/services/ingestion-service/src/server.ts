import { INGESTION_SERVICE_PORT } from "./config/constants";
import app from "./app";        



app.listen(INGESTION_SERVICE_PORT, () => {
    console.log(`Ingestion service is running on port ${INGESTION_SERVICE_PORT}`);
});
