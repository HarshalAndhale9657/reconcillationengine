import { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
  onNavigate: (page: string) => void;
}

export default function Layout({ children, onNavigate }: LayoutProps) {
  return (
    <div className="layout">
      <Sidebar onNavigate={onNavigate} />
      <main className="content">
        {children}
      </main>
    </div>
  );
}
