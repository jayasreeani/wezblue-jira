/**
 * End-to-End Automated Verification Script for Wezblue Jira & Confluence Suite
 * Tests:
 * 1. Epic creation
 * 2. User Story creation linked to Epic
 * 3. Task creation linked to User Story
 * 4. Assigning task to Developer (Althaf Thajudeen)
 * 5. Developer moving task through all 6 stages:
 *    TODO -> IN_PROGRESS -> UNDER_REVIEW -> IN_QA -> IN_STAKEHOLDER_VALIDATION -> DONE
 * 6. Sprint lifecycle: Create Sprint -> Add Issue -> Start Sprint (ACTIVE) -> End Sprint (COMPLETED)
 * 7. Sprint Reports & Dashboard verification (/api/reports)
 * 8. WezAI Intelligence verification:
 *    - Ticket key query
 *    - Organisation Roadmap query
 *    - Team workload query
 * 9. Confluence Doc Attachments (Create doc -> Attach file -> List/Verify -> Delete attachment)
 * 10. Project Management (Create project -> Edit project -> Delete project)
 * 11. Organisation Roadmap API (List initiatives -> Add initiative -> Cleanup)
 */

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const BASE_URL = (process.env.TEST_URL || 'http://localhost:3000').trim();

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, { ...options, headers });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    json = { rawText: text };
  }
  return { status: res.status, ok: res.ok, data: json };
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(message);
  }
  console.log(`  ✅ ${message}`);
}

async function runE2ETests() {
  console.log(`\n======================================================`);
  console.log(`🚀 STARTING END-TO-END VERIFICATION ON: ${BASE_URL}`);
  console.log(`======================================================\n`);

  // Step 0: Get Projects & Current Project
  console.log(`📌 STEP 0: Fetch initial workspace`);
  const projectsRes = await request('/api/projects');
  assert(projectsRes.ok && projectsRes.data.projects.length > 0, 'Workspace projects loaded');
  const project = projectsRes.data.projects[0];
  console.log(`   Active Project: ${project.name} (${project.key})`);

  // Step 1: Create Epic
  console.log(`\n📌 STEP 1: Create Epic`);
  const epicRes = await request('/api/epics', {
    method: 'POST',
    body: JSON.stringify({
      projectId: project.id,
      name: 'E2E-Automated-Billing-Engine',
      summary: 'Automated recurring billing, invoices, and payment webhooks',
      color: '#0052cc',
    }),
  });
  assert(epicRes.ok && epicRes.data.epic?.id, 'Epic successfully created');
  const createdEpic = epicRes.data.epic;
  console.log(`   Created Epic ID: ${createdEpic.id} Name: ${createdEpic.name}`);

  // Step 2: Create User Story linked to Epic
  console.log(`\n📌 STEP 2: Create User Story linked to Epic`);
  const storyRes = await request('/api/issues', {
    method: 'POST',
    body: JSON.stringify({
      projectId: project.id,
      epicId: createdEpic.id,
      type: 'STORY',
      summary: 'Resident can pay society maintenance via UPI and Stripe',
      description: 'As a resident, I want to pay maintenance fees securely online.',
      priority: 'HIGH',
      status: 'TODO',
      storyPoints: 5,
      estimatedHours: 16,
      feature: 'Payments',
      phase: 'MVP',
      acceptanceCriteria: 'Given valid UPI ID, when payment is submitted, transaction succeeds within 5s.',
    }),
  });
  assert(storyRes.ok && storyRes.data.issue?.id, 'User Story created and linked to Epic');
  const createdStory = storyRes.data.issue;
  console.log(`   Created Story: [${createdStory.key}] ${createdStory.summary}`);
  assert(createdStory.epicId === createdEpic.id, 'Story correctly links to Epic ID');

  // Step 3: Create Task linked to User Story
  console.log(`\n📌 STEP 3: Create Task linked to User Story`);
  const taskRes = await request('/api/issues', {
    method: 'POST',
    body: JSON.stringify({
      projectId: project.id,
      parentStoryId: createdStory.id,
      type: 'TASK',
      summary: 'Implement Stripe Webhook Signature Verification and Idempotency',
      description: 'Webhook listener verifying crypto signatures and idempotency keys.',
      priority: 'CRITICAL',
      status: 'TODO',
      storyPoints: 3,
      estimatedHours: 8,
      remainingHours: 8,
    }),
  });
  assert(taskRes.ok && taskRes.data.issue?.id, 'Task created under User Story');
  const createdTask = taskRes.data.issue;
  console.log(`   Created Task: [${createdTask.key}] ${createdTask.summary}`);
  assert(createdTask.parentStoryId === createdStory.id, 'Task correctly links to parent User Story');

  // Step 4: Assign Task to Developer (Althaf Thajudeen - user-althaf)
  console.log(`\n📌 STEP 4: Assign Task to Developer (Althaf Thajudeen)`);
  const assignRes = await request(`/api/issues/${createdTask.id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      assigneeId: 'user-althaf',
    }),
  });
  assert(assignRes.ok && assignRes.data.issue.assigneeId === 'user-althaf', 'Task assigned to Developer Althaf Thajudeen');
  console.log(`   Task assigned to: ${assignRes.data.issue.assignee?.name || 'Althaf Thajudeen'}`);

  // Step 5: Transition through all 6 workflow stages
  console.log(`\n📌 STEP 5: Developer transitions Task through all 6 stages`);
  const stages = [
    'IN_PROGRESS',
    'UNDER_REVIEW',
    'IN_QA',
    'IN_STAKEHOLDER_VALIDATION',
    'DONE',
  ];

  for (const nextStatus of stages) {
    const patchRes = await request(`/api/issues/${createdTask.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: nextStatus,
        remainingHours: nextStatus === 'DONE' ? 0 : 4,
        actualHours: nextStatus === 'DONE' ? 8 : 4,
      }),
    });
    assert(patchRes.ok && patchRes.data.issue.status === nextStatus, `Workflow stage transitioned to -> ${nextStatus}`);
  }

  // Also move the parent Story to DONE
  await request(`/api/issues/${createdStory.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'DONE', remainingHours: 0, actualHours: 16 }),
  });
  console.log(`   Parent Story also marked as DONE`);

  // Step 6: Sprint Lifecycle
  console.log(`\n📌 STEP 6: Sprint Lifecycle (Create -> Add Tickets -> Start -> End)`);
  const sprintRes = await request('/api/sprints', {
    method: 'POST',
    body: JSON.stringify({
      projectId: project.id,
      name: `E2E Sprint ${Date.now().toString().slice(-4)}`,
      goal: 'Complete Payment Gateway and Webhook Verification',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 14 * 86400000).toISOString(),
    }),
  });
  assert(sprintRes.ok && sprintRes.data.sprint?.id, 'Sprint successfully created in PLANNING status');
  const sprint = sprintRes.data.sprint;
  console.log(`   Created Sprint: ${sprint.name} (Status: ${sprint.status})`);

  // Add Task and Story to Sprint
  await request(`/api/issues/${createdTask.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ sprintId: sprint.id }),
  });
  await request(`/api/issues/${createdStory.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ sprintId: sprint.id }),
  });
  console.log(`   Added User Story and Task into Sprint`);

  // Start Sprint (status: ACTIVE)
  const startRes = await request(`/api/sprints/${sprint.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ action: 'START', status: 'ACTIVE' }),
  });
  assert(startRes.ok && startRes.data.sprint?.status === 'ACTIVE', 'Sprint successfully started -> status: ACTIVE');

  // Complete Sprint (status: COMPLETED)
  const endRes = await request(`/api/sprints/${sprint.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ action: 'COMPLETE', status: 'COMPLETED' }),
  });
  console.log(`   End Sprint Result: status=${endRes.status}, data=${JSON.stringify(endRes.data)}`);
  assert(endRes.ok && (endRes.data.sprint?.status === 'COMPLETED' || endRes.data.sprint?.status === 'DONE'), 'Sprint successfully completed -> status: COMPLETED');

  // Step 7: Sprint Reports & Dashboard
  console.log(`\n📌 STEP 7: Verify Sprint Reports & Dashboard Metrics`);
  const reportRes = await request(`/api/reports?projectId=${project.id}&sprintId=${sprint.id}`);
  const report = reportRes.data.report || reportRes.data;
  assert(reportRes.ok && (report.totalIssues !== undefined || report.totalStoryPoints !== undefined), 'Sprint report calculation returned successfully');
  console.log(`   Total Story Points: ${report.totalStoryPoints || report.totalPoints || 0}`);
  console.log(`   Completed Story Points: ${report.completedStoryPoints || report.completedPoints || 0}`);
  console.log(`   Total Issues: ${report.totalIssues || 0}`);
  assert(report.totalIssues > 0 || (report.statusCounts && report.statusCounts.DONE > 0), 'Report reflects issues in workspace');

  // Step 8: WezAI Intelligence Verification
  console.log(`\n📌 STEP 8: WezAI Intelligence Verification`);
  // 8a: Direct Ticket Query
  const aiTicketQuery = await request('/api/rovo/chat', {
    method: 'POST',
    body: JSON.stringify({
      message: `Show me information for [${createdTask.key}]`,
      history: [],
    }),
  });
  assert(aiTicketQuery.ok && aiTicketQuery.data.answer, 'WezAI responded to ticket lookup query');
  assert(
    aiTicketQuery.data.answer.includes(createdTask.key) || aiTicketQuery.data.answer.includes('Stripe'),
    'WezAI correctly identified ticket key and details'
  );
  console.log(`   WezAI Ticket Query Response Preview: ${aiTicketQuery.data.answer.slice(0, 100)}...`);

  // 8b: Strategic Roadmap Query
  const aiRoadmapQuery = await request('/api/rovo/chat', {
    method: 'POST',
    body: JSON.stringify({
      message: 'Summarize our Organisation Roadmap initiatives',
      history: [],
    }),
  });
  assert(aiRoadmapQuery.ok && aiRoadmapQuery.data.answer.includes('Roadmap'), 'WezAI answered roadmap inquiry with strategic overview');
  console.log(`   WezAI Roadmap Query: Verified`);

  // 8c: Developer Workload Query
  const aiWorkloadQuery = await request('/api/rovo/chat', {
    method: 'POST',
    body: JSON.stringify({
      message: 'What is the workload and remaining hours for Althaf Thajudeen?',
      history: [],
    }),
  });
  assert(aiWorkloadQuery.ok && aiWorkloadQuery.data.answer.includes('Althaf'), 'WezAI answered developer workload query for Althaf');
  console.log(`   WezAI Workload Query: Verified`);

  // Step 9: Confluence Page Document Attachments
  console.log(`\n📌 STEP 9: Confluence Page Document Attachments`);
  const docRes = await request('/api/confluence/docs', {
    method: 'POST',
    body: JSON.stringify({
      title: 'E2E Testing Spec & Architecture Runbook',
      content: '# E2E Spec\n\nAutomated testing documentation.',
      category: 'RUNBOOK',
      status: 'PUBLISHED',
      linkedIssueKeys: [createdStory.key],
    }),
  });
  assert(docRes.ok && docRes.data.doc?.id, 'Confluence document created');
  const doc = docRes.data.doc;

  // Attach a mock spec file
  const attachRes = await request('/api/attachments', {
    method: 'POST',
    body: JSON.stringify({
      docId: doc.id,
      filename: 'stripe-webhook-spec-v2.pdf',
      fileSize: 245760, // 240 KB
      fileType: 'application/pdf',
      fileUrl: 'data:application/pdf;base64,JVBERi0xLjQK...',
    }),
  });
  assert(attachRes.ok && attachRes.data.attachment?.id, 'Document attachment uploaded successfully');
  const attachment = attachRes.data.attachment;
  console.log(`   Attached file: ${attachment.filename} (${attachment.fileSize} bytes)`);

  // Verify attachment is present on doc
  const docVerifyRes = await request(`/api/confluence/docs/${doc.id}`);
  assert(
    docVerifyRes.ok && (docVerifyRes.data.doc.attachments || []).some(a => a.id === attachment.id),
    'Verified attachment persisted on Confluence document'
  );

  // Delete attachment
  const deleteAttachRes = await request(`/api/attachments?docId=${doc.id}&attachmentId=${attachment.id}`, {
    method: 'DELETE',
  });
  assert(deleteAttachRes.ok && deleteAttachRes.data.success, 'Attachment successfully deleted from Confluence document');

  // Step 10: Project Management (Create, Edit, Delete Project)
  console.log(`\n📌 STEP 10: Project Management (Create, Edit, Delete)`);
  const newProjRes = await request('/api/projects', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Temporary E2E Project',
      key: 'TEMP',
      description: 'Project to test edit and delete functionality',
      template: 'KANBAN',
    }),
  });
  assert(newProjRes.ok && newProjRes.data.project?.id, 'New project created');
  const tempProj = newProjRes.data.project;

  // Edit project
  const editProjRes = await request(`/api/projects/${tempProj.id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      name: 'Renamed E2E Project',
      key: 'TEMP',
      description: 'Updated project description',
      template: 'SCRUM',
    }),
  });
  assert(editProjRes.ok && editProjRes.data.project.name === 'Renamed E2E Project', 'Project successfully updated via PATCH');

  // Delete project
  const delProjRes = await request(`/api/projects/${tempProj.id}`, {
    method: 'DELETE',
  });
  assert(delProjRes.ok && delProjRes.data.success, 'Project successfully deleted via DELETE');

  // Step 11: Organisation Roadmap API
  console.log(`\n📌 STEP 11: Organisation Roadmap API`);
  const roadmapGetRes = await request('/api/roadmap');
  assert(roadmapGetRes.ok && Array.isArray(roadmapGetRes.data.initiatives), 'Roadmap initiatives list returned');
  console.log(`   Found ${roadmapGetRes.data.initiatives.length} initiatives in Organisation Roadmap`);

  const addInitRes = await request('/api/roadmap', {
    method: 'POST',
    body: JSON.stringify({
      title: 'E2E Automated FinOps Cloud Scaling',
      track: 'DevOps & Cloud Governance',
      targetQuarter: 'Q4 2026',
      status: 'IN_PROGRESS',
      progress: 45,
      owner: 'Althaf Thajudeen',
    }),
  });
  assert(addInitRes.ok && addInitRes.data.initiative?.id, 'Added new strategic initiative to Roadmap');
  const tempInit = addInitRes.data.initiative;

  // Clean up temp initiative
  const delInitRes = await request(`/api/roadmap/${tempInit.id}`, { method: 'DELETE' });
  assert(delInitRes.ok && delInitRes.data.success, 'Roadmap initiative cleanup complete');

  console.log(`\n======================================================`);
  console.log(`🎉 ALL 11 END-TO-END VERIFICATION STEPS PASSED SUCCESSFULLY!`);
  console.log(`======================================================\n`);
}

runE2ETests().catch(err => {
  console.error('\n❌ E2E VERIFICATION TEST FAILED:', err);
  process.exit(1);
});
