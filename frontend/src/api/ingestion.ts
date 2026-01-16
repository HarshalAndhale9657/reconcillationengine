import { INGESTION_BASE_URL } from "./config";

export async function startIngestion() {
  const res = await fetch(`${INGESTION_BASE_URL}/ingestion/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to start ingestion");
  }

  return res.json();
}

export async function stopIngestion() {
  const res = await fetch(`${INGESTION_BASE_URL}/ingestion/stop`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to stop ingestion");
  }

  return res.json();
}

export async function getIngestionStatus() {
  const res = await fetch(`${INGESTION_BASE_URL}/ingestion/status`);

  if (!res.ok) {
    throw new Error("Failed to fetch ingestion status");
  }

  return res.json();
}
