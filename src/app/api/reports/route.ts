import { NextResponse } from 'next/server';
import { db } from '@/lib/store';
import { Sprint, Issue } from '@/lib/types';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId') || 'proj-1';

  const issues: Issue[] = db.getIssues({ projectId });
  const sprints: Sprint[] = db.getSprints(projectId);

  // Velocity data
  const velocityData = sprints.map((s: Sprint) => {
    const sprintIssues = issues.filter((i: Issue) => i.sprintId === s.id);
    const committed = sprintIssues.reduce((sum: number, i: Issue) => sum + (i.storyPoints || 0), 0);
    const completed = sprintIssues.filter((i: Issue) => i.status === 'DONE').reduce((sum: number, i: Issue) => sum + (i.storyPoints || 0), 0);
    return {
      sprintName: s.name.replace('Wezblue ', '').replace('Nova ', ''),
      committed,
      completed,
    };
  });

  // Burndown data for active sprint
  const activeSprint = sprints.find(s => s.status === 'ACTIVE') || sprints[0];
  const activeIssues = issues.filter(i => i.sprintId === activeSprint?.id);
  const totalPoints = activeIssues.reduce((sum, i) => sum + (i.storyPoints || 0), 0);
  const donePoints = activeIssues.filter(i => i.status === 'DONE').reduce((sum, i) => sum + (i.storyPoints || 0), 0);

  // Generate 10-day sprint burndown curve
  const burndownData = [
    { day: 'Day 1', ideal: totalPoints, actual: totalPoints },
    { day: 'Day 2', ideal: Math.round(totalPoints * 0.9), actual: totalPoints },
    { day: 'Day 3', ideal: Math.round(totalPoints * 0.8), actual: totalPoints - 3 },
    { day: 'Day 4', ideal: Math.round(totalPoints * 0.7), actual: totalPoints - 5 },
    { day: 'Day 5', ideal: Math.round(totalPoints * 0.6), actual: totalPoints - 8 },
    { day: 'Day 6', ideal: Math.round(totalPoints * 0.5), actual: totalPoints - 10 },
    { day: 'Day 7', ideal: Math.round(totalPoints * 0.4), actual: totalPoints - 15 },
    { day: 'Day 8', ideal: Math.round(totalPoints * 0.3), actual: totalPoints - donePoints },
    { day: 'Day 9', ideal: Math.round(totalPoints * 0.2), actual: null },
    { day: 'Day 10', ideal: 0, actual: null },
  ];

  const totalEstimatedHours = issues.reduce((sum: number, i: Issue) => sum + (i.estimatedHours || 0), 0);
  const totalActualHours = issues.reduce((sum: number, i: Issue) => sum + (i.actualHours || 0), 0);
  const totalRemainingHours = issues.reduce((sum: number, i: Issue) => sum + (i.remainingHours || 0), 0);

  // Distribution by Status (updated 6-stage flow + backlog)
  const statusCounts = {
    BACKLOG: issues.filter(i => i.status === 'BACKLOG').length,
    TODO: issues.filter(i => i.status === 'TODO').length,
    IN_PROGRESS: issues.filter(i => i.status === 'IN_PROGRESS').length,
    UNDER_REVIEW: issues.filter(i => i.status === 'UNDER_REVIEW').length,
    IN_QA: issues.filter(i => i.status === 'IN_QA').length,
    IN_STAKEHOLDER_VALIDATION: issues.filter(i => i.status === 'IN_STAKEHOLDER_VALIDATION').length,
    DONE: issues.filter(i => i.status === 'DONE').length,
  };

  // Distribution by Type
  const typeCounts = {
    STORY: issues.filter(i => i.type === 'STORY').length,
    TASK: issues.filter(i => i.type === 'TASK').length,
    BUG: issues.filter(i => i.type === 'BUG').length,
    EPIC: issues.filter(i => i.type === 'EPIC').length,
  };

  // Distribution by Priority
  const priorityCounts = {
    HIGHEST: issues.filter(i => i.priority === 'HIGHEST').length,
    HIGH: issues.filter(i => i.priority === 'HIGH').length,
    MEDIUM: issues.filter(i => i.priority === 'MEDIUM').length,
    LOW: issues.filter(i => i.priority === 'LOW').length,
    LOWEST: issues.filter(i => i.priority === 'LOWEST').length,
  };

  return NextResponse.json({
    activeSprint,
    totalIssues: issues.length,
    totalStoryPoints: totalPoints,
    completedStoryPoints: donePoints,
    totalEstimatedHours,
    totalActualHours,
    totalRemainingHours,
    velocityData,
    burndownData,
    statusCounts,
    typeCounts,
    priorityCounts,
  });
}
