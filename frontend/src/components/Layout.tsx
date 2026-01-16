import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import "./Layout.css";

type LayoutProps = {
  children: ReactNode;
  onNavigate: (page: string) => void;
  activePage: string;
};

export default function Layout({ children, onNavigate, activePage }: LayoutProps) {
  return (
    <div className="layout">
      <Sidebar onNavigate={onNavigate} activePage={activePage} />
      <main className="content">{children}</main>
    </div>
  );
}
