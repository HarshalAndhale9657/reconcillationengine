import { NavLink } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <h1 className="logo">⚙️ Reconciliation Engine</h1>

      <nav className="nav">
        <NavLink to="/" end className="nav-item">
          📊 Dashboard
        </NavLink>

        <NavLink to="/transactions" className="nav-item">
          💳 Transactions
        </NavLink>

        <NavLink to="/alerts" className="nav-item">
          🚨 Alerts
        </NavLink>

        <NavLink to="/raw-events" className="nav-item">
          📥 Raw Events
        </NavLink>

        <NavLink to="/ingestion" className="nav-item">
          ⚡ Ingestion
        </NavLink>
      </nav>
    </aside>
  );
}
