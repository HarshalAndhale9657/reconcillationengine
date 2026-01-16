import { useEffect, useState } from "react";
import { fetchStats } from "../api/reconciliation";

<h1>📊 Reconciliation Overview</h1>


type Stats = {
  totalTransactions: number;
  matched: number;
  amountMismatch: number;
  statusMismatch: number;
  timeout: number;
  incomplete: number;
  totalAlerts: number;
  unresolvedAlerts: number;
  matchRate: number;
};

const initialStats: Stats = {
  totalTransactions: 0,
  matched: 0,
  amountMismatch: 0,
  statusMismatch: 0,
  timeout: 0,
  incomplete: 0,
  totalAlerts: 0,
  unresolvedAlerts: 0,
  matchRate: 0,
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>(initialStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const data = await fetchStats();
        setStats({
          ...initialStats,
          ...data,
        });
        setError(null);
      } catch (err) {
        console.error("Failed to load stats:", err);
        setError("Backend not responding. Showing default values.");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return <h3>Loading dashboard...</h3>;
  }

  return (
    <div>
      <h1 style={{ marginBottom: "20px" }}>Dashboard</h1>

      {error && (
        <div
          style={{
            background: "#fff3cd",
            color: "#856404",
            padding: "10px",
            borderRadius: "6px",
            marginBottom: "20px",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
        }}
      >
        <StatCard title="Total Transactions" value={stats.totalTransactions} />
        <StatCard title="Matched" value={stats.matched} />
        <StatCard title="Amount Mismatch" value={stats.amountMismatch} />
        <StatCard title="Status Mismatch" value={stats.statusMismatch} />
        <StatCard title="Timeout" value={stats.timeout} />
        <StatCard title="Incomplete" value={stats.incomplete} />
        <StatCard title="Total Alerts" value={stats.totalAlerts} />
        <StatCard title="Unresolved Alerts" value={stats.unresolvedAlerts} />
        <StatCard
          title="Match Rate"
          value={`${stats.matchRate.toFixed(2)}%`}
        />
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: number | string;
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "10px",
        padding: "20px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
      }}
    >
      <p style={{ color: "#6b7280", marginBottom: "8px" }}>{title}</p>
      <h2 style={{ margin: 0 }}>{value}</h2>
    </div>
  );
}
