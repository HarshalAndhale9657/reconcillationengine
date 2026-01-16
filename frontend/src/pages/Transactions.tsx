import { useEffect, useState } from "react";
import { fetchTransactions } from "../api/reconciliation";

export default function Transactions() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetchTransactions();
        setData(res?.transactions ?? []);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("No transaction data available yet.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <h3>Loading transactions...</h3>;

  if (error)
    return (
      <p style={{ color: "#666", marginTop: 20 }}>
        {error}
      </p>
    );

  if (data.length === 0)
    return <p>No transactions found.</p>;

  return (
    <div>
      <h1>Transactions</h1>
      <table style={{ width: "100%", marginTop: 20 }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Status</th>
            <th>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {data.map((t) => (
            <tr key={t.transactionId}>
              <td>{t.transactionId}</td>
              <td>{t.state}</td>
              <td>{t.lastUpdatedAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
