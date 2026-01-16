import { useEffect, useState } from "react";
import {
  startIngestion,
  stopIngestion,
  getIngestionStatus,
} from "../api/ingestion";

type IngestionState = "running" | "stopped" | "unknown";

export default function Ingestion() {
  const [status, setStatus] = useState<IngestionState>("unknown");
  const [loading, setLoading] = useState(false);

  const refreshStatus = async () => {
    try {
      const res = await getIngestionStatus();

      
      if (res?.isRunning === true) {
        setStatus("running");
      } else {
        setStatus("stopped");
      }
    } catch (err) {
      console.error("Failed to fetch ingestion status", err);
      setStatus("stopped");
    }
  };

  const handleStart = async () => {
    setLoading(true);
    try {
      await startIngestion();
      await refreshStatus(); 
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      await stopIngestion();
      await refreshStatus(); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  return (
    <div className="card">
      <h2>⚙️ Ingestion Control</h2>

      <p style={{ marginTop: 12 }}>
        Status:{" "}
        <strong
          style={{
            color: status === "running" ? "green" : "red",
            textTransform: "uppercase",
          }}
        >
          {status}
        </strong>
      </p>

      <div style={{ marginTop: 20 }}>
        <button
          className="primary"
          disabled={loading || status === "running"}
          onClick={handleStart}
        >
          ▶ Start Ingestion
        </button>

        <button
          className="danger"
          disabled={loading || status === "stopped"}
          onClick={handleStop}
          style={{ marginLeft: 12 }}
        >
          ■ Stop Ingestion
        </button>
      </div>
    </div>
  );
}
