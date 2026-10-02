import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import AppLayoutShell from '@/components/layout/AppLayoutShell';

export const metadata: Metadata = {
  title: 'Wezblue Enterprise Jira - Project Management SaaS',
  description: 'Wezblue Jira-like Project Management SaaS platform with multi-tenant RBAC, drag-and-drop boards, sprints, epics, bug tracking, and analytics.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased h-screen w-screen overflow-hidden flex flex-col bg-jira-bg text-jira-text">
        <AppProvider>
          <AppLayoutShell>
            {children}
          </AppLayoutShell>
        </AppProvider>
      </body>
    </html>
  );
}
