import type { ReactNode } from 'react';
import { Navbar } from './Navbar';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="layout">
      <Navbar />
      <main className="layout__main">{children}</main>
    </div>
  );
}