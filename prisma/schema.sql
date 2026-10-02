-- PostgreSQL Enterprise Jira SaaS Schema

CREATE TYPE "Role" AS ENUM ('ADMIN', 'PROJECT_MANAGER', 'PRODUCT_OWNER', 'DEVELOPER', 'QA_ENGINEER', 'VIEWER');
CREATE TYPE "ProjectTemplate" AS ENUM ('SCRUM', 'KANBAN');
CREATE TYPE "SprintStatus" AS ENUM ('FUTURE', 'ACTIVE', 'COMPLETED');
CREATE TYPE "IssueType" AS ENUM ('EPIC', 'STORY', 'TASK', 'BUG');
CREATE TYPE "IssueStatus" AS ENUM ('BACKLOG', 'TODO', 'IN_PROGRESS', 'UNDER_REVIEW', 'IN_QA', 'IN_STAKEHOLDER_VALIDATION', 'DONE');
CREATE TYPE "Priority" AS ENUM ('HIGHEST', 'HIGH', 'MEDIUM', 'LOW', 'LOWEST');
CREATE TYPE "BugSeverity" AS ENUM ('CRITICAL', 'MAJOR', 'MINOR', 'TRIVIAL');

CREATE TABLE "User" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT UNIQUE NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT,
    "role" "Role" DEFAULT 'DEVELOPER' NOT NULL,
    "department" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "Project" (
    "id" TEXT PRIMARY KEY,
    "key" TEXT UNIQUE NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "template" "ProjectTemplate" DEFAULT 'SCRUM' NOT NULL,
    "leadId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "ProjectMember" (
    "id" TEXT PRIMARY KEY,
    "projectId" TEXT REFERENCES "Project"("id") ON DELETE CASCADE NOT NULL,
    "userId" TEXT REFERENCES "User"("id") ON DELETE CASCADE NOT NULL,
    "role" "Role" DEFAULT 'DEVELOPER' NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE ("projectId", "userId")
);

CREATE TABLE "Sprint" (
    "id" TEXT PRIMARY KEY,
    "projectId" TEXT REFERENCES "Project"("id") ON DELETE CASCADE NOT NULL,
    "name" TEXT NOT NULL,
    "goal" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "status" "SprintStatus" DEFAULT 'FUTURE' NOT NULL,
    "velocity" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "Epic" (
    "id" TEXT PRIMARY KEY,
    "projectId" TEXT REFERENCES "Project"("id") ON DELETE CASCADE NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT,
    "color" TEXT DEFAULT '#8777d9' NOT NULL,
    "status" TEXT DEFAULT 'IN_PROGRESS' NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "Issue" (
    "id" TEXT PRIMARY KEY,
    "key" TEXT UNIQUE NOT NULL,
    "projectId" TEXT REFERENCES "Project"("id") ON DELETE CASCADE NOT NULL,
    "type" "IssueType" DEFAULT 'STORY' NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT,
    "status" "IssueStatus" DEFAULT 'TODO' NOT NULL,
    "priority" "Priority" DEFAULT 'MEDIUM' NOT NULL,
    "severity" "BugSeverity",
    "storyPoints" INTEGER,
    "actualPoints" INTEGER,
    "estimatedHours" DOUBLE PRECISION,
    "actualHours" DOUBLE PRECISION DEFAULT 0 NOT NULL,
    "remainingHours" DOUBLE PRECISION,
    "order" INTEGER DEFAULT 0 NOT NULL,
    "assigneeId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
    "reporterId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
    "sprintId" TEXT REFERENCES "Sprint"("id") ON DELETE SET NULL,
    "epicId" TEXT REFERENCES "Epic"("id") ON DELETE SET NULL,
    "parentStoryId" TEXT REFERENCES "Issue"("id") ON DELETE SET NULL,
    "parentId" TEXT REFERENCES "Issue"("id") ON DELETE SET NULL,
    "dueDate" TIMESTAMP(3),
    "plannedCompletionDate" TIMESTAMP(3),
    "actualCompletionDate" TIMESTAMP(3),
    "environment" TEXT,
    "reproduceSteps" TEXT,
    "figmaUrl" TEXT,
    "feature" TEXT,
    "acceptanceCriteria" TEXT,
    "phase" TEXT DEFAULT 'MVP',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "WorkLog" (
    "id" TEXT PRIMARY KEY,
    "issueId" TEXT REFERENCES "Issue"("id") ON DELETE CASCADE NOT NULL,
    "userId" TEXT REFERENCES "User"("id") ON DELETE CASCADE NOT NULL,
    "hours" DOUBLE PRECISION NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE "Comment" (
    "id" TEXT PRIMARY KEY,
    "issueId" TEXT REFERENCES "Issue"("id") ON DELETE CASCADE NOT NULL,
    "authorId" TEXT REFERENCES "User"("id") ON DELETE CASCADE NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "Attachment" (
    "id" TEXT PRIMARY KEY,
    "issueId" TEXT REFERENCES "Issue"("id") ON DELETE CASCADE NOT NULL,
    "filename" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileType" TEXT NOT NULL,
    "uploaderId" TEXT REFERENCES "User"("id") ON DELETE CASCADE NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE "ActivityLog" (
    "id" TEXT PRIMARY KEY,
    "projectId" TEXT REFERENCES "Project"("id") ON DELETE CASCADE NOT NULL,
    "issueId" TEXT REFERENCES "Issue"("id") ON DELETE SET NULL,
    "userId" TEXT REFERENCES "User"("id") ON DELETE CASCADE NOT NULL,
    "action" TEXT NOT NULL,
    "fieldChanged" TEXT,
    "oldValue" TEXT,
    "newValue" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE "Notification" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT REFERENCES "User"("id") ON DELETE CASCADE NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "read" BOOLEAN DEFAULT false NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
