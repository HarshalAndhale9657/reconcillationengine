import { useEffect, useState } from "react";
import { fetchAlerts } from "../api/reconciliation";

export default function Alerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetchAlerts();
        setAlerts(res?.alerts ?? []);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("No alerts available yet.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <h3>Loading alerts...</h3>;

  if (error)
    return (
      <p style={{ color: "#666", marginTop: 20 }}>
        {error}
      </p>
    );

  if (alerts.length === 0)
    return <p>No alerts generated.</p>;

  return (
    <div>
      <h1>Alerts</h1>
      <table style={{ width: "100%", marginTop: 20 }}>
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>Severity</th>
            <th>Resolved</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map((a, idx) => (
            <tr key={idx}>
              <td>{a.transactionId}</td>
              <td>{a.severity}</td>
              <td>{a.resolved ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
