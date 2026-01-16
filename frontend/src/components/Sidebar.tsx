interface SidebarProps {
  onNavigate: (page: string) => void;
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  return (
    <nav className="sidebar">
      <h2>Recon Engine</h2>

      <button onClick={() => onNavigate('dashboard')}>Dashboard</button>
      <button onClick={() => onNavigate('transactions')}>Transactions</button>
      <button onClick={() => onNavigate('alerts')}>Alerts</button>
      <button onClick={() => onNavigate('raw')}>Raw Events</button>
      <button onClick={() => onNavigate('ingestion')}>Ingestion</button>
    </nav>
  );
}

<style>{`
  aside {
    background: linear-gradient(180deg, #020617, #020617);
  }

  .nav {
    padding: 10px 12px;
    border-radius: 8px;
    color: #cbd5f5;
    text-decoration: none;
    font-size: 15px;
  }

  .nav:hover {
    background: rgba(255,255,255,0.08);
  }

  .nav.active {
    background: rgba(255,255,255,0.15);
    color: white;
    font-weight: 600;
  }
`}</style>
