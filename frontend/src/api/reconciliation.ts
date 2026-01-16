import { RECON_BASE_URL } from './config';
import {
  mockStats,
  mockTransactions,
  mockRawTransactions,
  mockAlerts,
} from './mockData';

const USE_MOCK_DATA = false; // 🔥 CHANGE TO false when backend is ready

export const fetchStats = async () => {
  if (USE_MOCK_DATA) return mockStats;
  const res = await fetch(`${RECON_BASE_URL}/stats`);
  return res.json();
};

export const fetchTransactions = async () => {
  if (USE_MOCK_DATA) return mockTransactions;
  const res = await fetch(`${RECON_BASE_URL}/transactions`);
  return res.json();
};

export const fetchRawTransactions = async () => {
  if (USE_MOCK_DATA) return mockRawTransactions;
  const res = await fetch(`${RECON_BASE_URL}/raw-transactions`);
  return res.json();
};

export const fetchAlerts = async () => {
  if (USE_MOCK_DATA) return mockAlerts;
  const res = await fetch(`${RECON_BASE_URL}/alerts`);
  return res.json();
};
