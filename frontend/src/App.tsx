import { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Alerts from './pages/Alerts';
import RawTransactions from './pages/RawTransactions';
import Ingestion from './pages/Ingestion';

export default function App() {
  const [page, setPage] = useState('dashboard');

  const renderPage = () => {
    switch (page) {
      case 'transactions':
        return <Transactions />;
      case 'alerts':
        return <Alerts />;
      case 'raw':
        return <RawTransactions />;
      case 'ingestion':
        return <Ingestion />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout onNavigate={setPage} activePage={page}>
      {renderPage()}
    </Layout>
  );
}
