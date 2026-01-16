export const mockStats = {
  totalTransactions: 1250,
  matched: 980,
  amountMismatch: 120,
  statusMismatch: 60,
  timeout: 40,
  incomplete: 50,
  totalAlerts: 34,
  unresolvedAlerts: 8,
  matchRate: 78.4,
};

export const mockTransactions = {
  transactions: [
    {
      transactionId: 'TXN_1001',
      state: 'MATCHED',
      lastUpdatedAt: '2026-01-13 10:30',
    },
    {
      transactionId: 'TXN_1002',
      state: 'AMOUNT_MISMATCH',
      lastUpdatedAt: '2026-01-13 10:32',
    },
    {
      transactionId: 'TXN_1003',
      state: 'TIMEOUT',
      lastUpdatedAt: '2026-01-13 10:35',
    },
  ],
};

export const mockRawTransactions = {
  rawTransactions: [
    {
      transactionId: 'TXN_1001',
      source: 'BANK',
      receivedAt: '2026-01-13 10:28',
    },
    {
      transactionId: 'TXN_1001',
      source: 'GATEWAY',
      receivedAt: '2026-01-13 10:29',
    },
    {
      transactionId: 'TXN_1002',
      source: 'APP',
      receivedAt: '2026-01-13 10:31',
    },
  ],
};

export const mockAlerts = {
  alerts: [
    {
      id: 1,
      transactionId: 'TXN_1002',
      severity: 'HIGH',
      resolved: false,
    },
    {
      id: 2,
      transactionId: 'TXN_1003',
      severity: 'MEDIUM',
      resolved: true,
    },
  ],
};
