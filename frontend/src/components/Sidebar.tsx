import "./Sidebar.css";

type SidebarProps = {
  currentPage: string;
  onNavigate: (page: string) => void;
};

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  return (
    <aside className="sidebar">
      <h1 className="logo">⚙️ Reconciliation Engine</h1>

      <nav className="nav">
        <button
          className={`nav-item ${currentPage === "dashboard" ? "active" : ""}`}
          onClick={() => onNavigate("dashboard")}
        >
          📊 Dashboard
        </button>

        <button
          className={`nav-item ${currentPage === "transactions" ? "active" : ""}`}
          onClick={() => onNavigate("transactions")}
        >
          💳 Transactions
        </button>

        <button
          className={`nav-item ${currentPage === "alerts" ? "active" : ""}`}
          onClick={() => onNavigate("alerts")}
        >
          🚨 Alerts
        </button>

        <button
          className={`nav-item ${currentPage === "raw" ? "active" : ""}`}
          onClick={() => onNavigate("raw")}
        >
          📥 Raw Events
        </button>

        <button
          className={`nav-item ${currentPage === "ingestion" ? "active" : ""}`}
          onClick={() => onNavigate("ingestion")}
        >
          ⚡ Ingestion
        </button>
      </nav>
    </aside>
  );
}
