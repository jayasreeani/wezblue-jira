'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import TopNav from '@/components/layout/TopNav';
import Sidebar from '@/components/layout/Sidebar';
import CommandPalette from '@/components/common/CommandPalette';
import CreateIssueModal from '@/components/issues/CreateIssueModal';
import BulkUploadModal from '@/components/issues/BulkUploadModal';
import IssueDetailDrawer from '@/components/issues/IssueDetailDrawer';
import ToastNotification from '@/components/common/ToastNotification';
import LoginPage from '@/components/auth/LoginPage';

export default function AppLayoutShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useApp();
  const pathname = usePathname();

  if (!isAuthenticated || pathname === '/login') {
    return (
      <div className="h-screen w-screen overflow-hidden flex flex-col">
        <LoginPage />
        <ToastNotification />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-jira-bg text-jira-text">
      <TopNav />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {children}
        </main>
      </div>
      <CommandPalette />
      <CreateIssueModal />
      <BulkUploadModal />
      <IssueDetailDrawer />
      <ToastNotification />
    </div>
  );
}
