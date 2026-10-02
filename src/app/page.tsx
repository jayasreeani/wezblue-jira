'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import KanbanBoard from '@/components/boards/KanbanBoard';
import ScrumBoard from '@/components/boards/ScrumBoard';
import BacklogView from '@/components/backlog/BacklogView';
import EpicsView from '@/components/epics/EpicsView';
import SprintsView from '@/components/sprints/SprintsView';
import DashboardView from '@/components/reports/DashboardView';
import UserManagementView from '@/components/users/UserManagementView';
import ProjectSettingsView from '@/components/projects/ProjectSettingsView';
import ConfluenceView from '@/components/confluence/ConfluenceView';
import RovoChatDrawer from '@/components/rovo/RovoChatDrawer';

export default function HomePage() {
  const { activeView } = useApp();

  const renderView = () => {
    switch (activeView) {
      case 'kanban':
        return <KanbanBoard />;
      case 'scrum':
        return <ScrumBoard />;
      case 'backlog':
        return <BacklogView />;
      case 'epics':
        return <EpicsView />;
      case 'sprints':
        return <SprintsView />;
      case 'confluence':
        return <ConfluenceView />;
      case 'dashboard':
        return <DashboardView />;
      case 'users':
        return <UserManagementView />;
      case 'settings':
        return <ProjectSettingsView />;
      default:
        return <KanbanBoard />;
    }
  };

  return (
    <>
      {renderView()}
      <RovoChatDrawer />
    </>
  );
}
