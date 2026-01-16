import { ReactNode } from 'react';
import Sidebar from "./Sidebar";
import "./Layout.css";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="layout">
      <Sidebar />
      <main className="content">{children}</main>
    </div>
  );
}
