import { useEffect, useState } from "react";
import { fetchRawTransactions } from "../api/reconciliation";

export default function RawTransactions() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetchRawTransactions();
        setRows(res?.rawTransactions ?? []);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("No raw events received yet.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <h3>Loading raw transactions...</h3>;

  if (error)
    return (
      <p style={{ color: "#666", marginTop: 20 }}>
        {error}
      </p>
    );

  if (rows.length === 0)
    return <p>No raw transactions available.</p>;

  return (
    <div>
      <h1>Raw Transactions</h1>
      <table style={{ width: "100%", marginTop: 20 }}>
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>Source</th>
            <th>Received At</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx}>
              <td>{r.transactionId}</td>
              <td>{r.source}</td>
              <td>{r.receivedAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
