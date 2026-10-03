import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { projectId, sprintId, stories } = body;

    if (!projectId || !Array.isArray(stories) || stories.length === 0) {
      return NextResponse.json(
        { error: 'Invalid payload: projectId and non-empty stories array are required.' },
        { status: 400 }
      );
    }

    const epicColorPalette = [
      '#8777d9', '#0052cc', '#00875a', '#ff991f', 
      '#de350b', '#00b8d9', '#6554c0', '#36b37e'
    ];

    // Cache existing and newly created epics
    const projectEpics = db.getEpics(projectId);
    const epicMap = new Map<string, string>(); // lowercased name -> epicId

    projectEpics.forEach(e => {
      epicMap.set(e.name.toLowerCase().trim(), e.id);
    });

    let newEpicsCount = 0;
    const createdIssues = [];

    for (const item of stories) {
      const narrative = (item.userStory || item.summary || item.story || '').trim();
      if (!narrative) continue;

      let epicId: string | undefined = undefined;
      const rawEpicName = (item.epicName || item.epic || item.module || '').trim();

      if (rawEpicName) {
        const lowerEpic = rawEpicName.toLowerCase();
        if (epicMap.has(lowerEpic)) {
          epicId = epicMap.get(lowerEpic);
        } else {
          // Provision new Epic
          const color = epicColorPalette[(projectEpics.length + newEpicsCount) % epicColorPalette.length];
          const newEpic = db.createEpic(
            projectId,
            rawEpicName,
            `Module: ${rawEpicName}`,
            color
          );
          epicId = newEpic.id;
          epicMap.set(lowerEpic, newEpic.id);
          newEpicsCount++;
        }
      }

      const issue = db.createIssue({
        projectId,
        type: 'STORY',
        summary: narrative,
        feature: item.feature ? item.feature.trim() : undefined,
        acceptanceCriteria: item.acceptanceCriteria ? item.acceptanceCriteria.trim() : undefined,
        phase: item.phase ? item.phase.trim() : 'MVP',
        epicId,
        sprintId: sprintId || undefined,
        status: 'BACKLOG',
        priority: 'MEDIUM',
        storyPoints: 3,
        estimatedHours: 8,
        plannedCompletionDate: new Date(Date.now() + 14 * 86400000).toISOString(),
      });

      createdIssues.push(issue);
    }

    // Log activity
    db.logActivity({
      projectId,
      userId: 'user-1',
      action: 'BULK_IMPORT',
      newValue: `Imported ${createdIssues.length} stories${newEpicsCount > 0 ? ` (${newEpicsCount} new epics)` : ''}`,
    });

    const allProjectEpics = db.getEpics(projectId);

    return NextResponse.json({
      success: true,
      importedCount: createdIssues.length,
      newEpicsCount,
      issues: createdIssues,
      epics: allProjectEpics,
      message: `Successfully imported ${createdIssues.length} user stories${newEpicsCount > 0 ? ` and created ${newEpicsCount} new epic(s)` : ''}!`,
    }, { status: 201 });
  } catch (error) {
    console.error('Bulk import error:', error);
    return NextResponse.json({ error: 'Failed to process bulk import.' }, { status: 500 });
  }
}
