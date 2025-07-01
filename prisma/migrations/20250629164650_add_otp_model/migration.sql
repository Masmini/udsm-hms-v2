-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "SubRole" AS ENUM ('MEMBER', 'HUB_LEADER', 'SUPERVISOR', 'PROGRAMME_SUPERVISOR');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PUBLIC', 'AUTHENTICATED', 'HUB_MEMBERS', 'PROGRAMME_MEMBERS');

-- CreateEnum
CREATE TYPE "PublishStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO', 'DOCUMENT', 'AUDIO', 'OTHER');

-- CreateEnum
CREATE TYPE "SuggestionType" AS ENUM ('IMPROVEMENT', 'BUG_REPORT', 'FEATURE_REQUEST', 'FEEDBACK');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SYSTEM', 'HUB_INVITATION', 'PROJECT_UPDATE', 'EVENT_REMINDER', 'TASK_ASSIGNMENT', 'ANNOUNCEMENT', 'MESSAGE');

-- CreateEnum
CREATE TYPE "PartnerType" AS ENUM ('INDUSTRY', 'ACADEMIC', 'NGO', 'GOVERNMENT', 'INTERNATIONAL');

-- CreateEnum
CREATE TYPE "PartnershipStatus" AS ENUM ('PROPOSED', 'NEGOTIATING', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "FundingStatus" AS ENUM ('IDENTIFIED', 'APPLYING', 'SUBMITTED', 'APPROVED', 'REJECTED', 'RECEIVED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "isGoogleUser" BOOLEAN NOT NULL DEFAULT false,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "degreeProgramme" TEXT,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "profilePicture" TEXT,
    "bio" TEXT,
    "phoneNumber" TEXT,
    "linkedinProfile" TEXT,
    "githubProfile" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hub" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "logo" TEXT,
    "coverImage" TEXT,
    "cardBio" TEXT,
    "vision" TEXT,
    "mission" TEXT,
    "objectives" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "contactEmail" TEXT,
    "website" TEXT,
    "socialLinks" JSONB,
    "location" TEXT,
    "establishedDate" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Hub_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HubMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hubId" TEXT NOT NULL,
    "role" "SubRole" NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "HubMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "coverImage" TEXT,
    "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC',
    "capacity" INTEGER,
    "eventType" TEXT NOT NULL,
    "venue" TEXT,
    "venueAddress" TEXT,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "meetingLink" TEXT,
    "requirements" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "agenda" JSONB,
    "speakers" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "verifiedAttendees" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "approvedAttendees" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "hubId" TEXT NOT NULL,
    "publishStatus" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "scheduledAt" TIMESTAMP(3),
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "discussionId" TEXT,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventAttendanceBadge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "badge" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventAttendanceBadge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Programme" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "coverImage" TEXT,
    "curriculum" JSONB,
    "prerequisites" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "learningOutcomes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "duration" TEXT,
    "certificationType" TEXT,
    "maxParticipants" INTEGER,
    "applicationDeadline" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "hubId" TEXT NOT NULL,
    "publishStatus" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "scheduledAt" TIMESTAMP(3),
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "discussionId" TEXT,

    CONSTRAINT "Programme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgrammeMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "programmeId" TEXT NOT NULL,
    "role" "SubRole" NOT NULL DEFAULT 'MEMBER',
    "deletedAt" TIMESTAMP(3),
    "status" "MembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0.0,

    CONSTRAINT "ProgrammeMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "coverImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hubId" TEXT NOT NULL,
    "publishStatus" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "scheduledAt" TIMESTAMP(3),
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC',
    "objectives" TEXT,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "technologies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "budget" DOUBLE PRECISION,
    "fundingSource" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'PLANNING',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "completionRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "discussionId" TEXT,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "contribution" TEXT,

    CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3),
    "assigneeId" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "estimatedHours" DOUBLE PRECISION,
    "actualHours" DOUBLE PRECISION,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskDependency" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "dependsOnId" TEXT NOT NULL,

    CONSTRAINT "TaskDependency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgressReport" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProgressReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "News" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT NOT NULL,
    "hubId" TEXT,
    "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC',
    "image" TEXT,
    "category" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "publishStatus" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "likesCount" INTEGER NOT NULL DEFAULT 0,
    "commentsCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsComment" (
    "id" TEXT NOT NULL,
    "newsId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "NewsComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsLike" (
    "id" TEXT NOT NULL,
    "newsId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "size" INTEGER NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "eventId" TEXT,
    "projectId" TEXT,
    "programmeId" TEXT,
    "newsId" TEXT,
    "hubId" TEXT,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HubMembershipRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hubId" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responseReason" TEXT,
    "respondedAt" TIMESTAMP(3),
    "respondedBy" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "HubMembershipRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventRegistration" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responseReason" TEXT,
    "respondedAt" TIMESTAMP(3),
    "respondedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "attended" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "EventRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectJoinRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "hubId" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responseReason" TEXT,
    "respondedAt" TIMESTAMP(3),
    "respondedBy" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProjectJoinRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgrammeJoinRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "programmeId" TEXT NOT NULL,
    "hubId" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responseReason" TEXT,
    "respondedAt" TIMESTAMP(3),
    "respondedBy" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProgrammeJoinRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventFeedback" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "content" TEXT,
    "suggestions" TEXT,
    "wouldRecommend" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectFile" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "version" TEXT NOT NULL DEFAULT '1.0',
    "description" TEXT,

    CONSTRAINT "ProjectFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Discussion" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Discussion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectSuggestion" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "SuggestionType" NOT NULL DEFAULT 'IMPROVEMENT',
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProjectSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAnalytics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "loginCount" INTEGER NOT NULL DEFAULT 0,
    "lastLoginAt" TIMESTAMP(3),
    "totalTimeSpent" INTEGER NOT NULL DEFAULT 0,
    "hubsJoined" INTEGER NOT NULL DEFAULT 0,
    "projectsJoined" INTEGER NOT NULL DEFAULT 0,
    "eventsAttended" INTEGER NOT NULL DEFAULT 0,
    "programmesCompleted" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HubAnalytics" (
    "id" TEXT NOT NULL,
    "hubId" TEXT NOT NULL,
    "totalMembers" INTEGER NOT NULL DEFAULT 0,
    "activeMembers" INTEGER NOT NULL DEFAULT 0,
    "totalProjects" INTEGER NOT NULL DEFAULT 0,
    "completedProjects" INTEGER NOT NULL DEFAULT 0,
    "totalEvents" INTEGER NOT NULL DEFAULT 0,
    "totalProgrammes" INTEGER NOT NULL DEFAULT 0,
    "engagementRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "growthRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HubAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectAnalytics" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "taskCompletionRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "memberActivity" JSONB,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "milestonesAchieved" INTEGER NOT NULL DEFAULT 0,
    "issuesResolved" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Partnership" (
    "id" TEXT NOT NULL,
    "hubId" TEXT NOT NULL,
    "partnerName" TEXT NOT NULL,
    "partnerType" "PartnerType" NOT NULL,
    "contactPerson" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "description" TEXT NOT NULL,
    "status" "PartnershipStatus" NOT NULL DEFAULT 'PROPOSED',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "value" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "documents" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Partnership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FundingOpportunity" (
    "id" TEXT NOT NULL,
    "hubId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "funder" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "description" TEXT NOT NULL,
    "requirements" TEXT[],
    "deadline" TIMESTAMP(3) NOT NULL,
    "status" "FundingStatus" NOT NULL DEFAULT 'IDENTIFIED',
    "applicationDate" TIMESTAMP(3),
    "documents" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FundingOpportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "actionUrl" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OTP" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OTP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_HubCategories" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_SupervisorProgrammes" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_SupervisorProjects" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_id_idx" ON "User"("id");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "User_isActive_idx" ON "User"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE INDEX "Category_name_idx" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Hub_name_key" ON "Hub"("name");

-- CreateIndex
CREATE INDEX "Hub_name_idx" ON "Hub"("name");

-- CreateIndex
CREATE INDEX "Hub_isActive_idx" ON "Hub"("isActive");

-- CreateIndex
CREATE INDEX "HubMember_userId_idx" ON "HubMember"("userId");

-- CreateIndex
CREATE INDEX "HubMember_hubId_idx" ON "HubMember"("hubId");

-- CreateIndex
CREATE INDEX "HubMember_role_idx" ON "HubMember"("role");

-- CreateIndex
CREATE UNIQUE INDEX "HubMember_userId_hubId_key" ON "HubMember"("userId", "hubId");

-- CreateIndex
CREATE INDEX "Event_hubId_idx" ON "Event"("hubId");

-- CreateIndex
CREATE INDEX "Event_createdBy_idx" ON "Event"("createdBy");

-- CreateIndex
CREATE INDEX "Event_publishStatus_idx" ON "Event"("publishStatus");

-- CreateIndex
CREATE INDEX "Event_startDate_idx" ON "Event"("startDate");

-- CreateIndex
CREATE INDEX "Event_eventType_idx" ON "Event"("eventType");

-- CreateIndex
CREATE INDEX "EventAttendanceBadge_userId_idx" ON "EventAttendanceBadge"("userId");

-- CreateIndex
CREATE INDEX "EventAttendanceBadge_eventId_idx" ON "EventAttendanceBadge"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "EventAttendanceBadge_userId_eventId_key" ON "EventAttendanceBadge"("userId", "eventId");

-- CreateIndex
CREATE INDEX "Programme_hubId_idx" ON "Programme"("hubId");

-- CreateIndex
CREATE INDEX "Programme_publishStatus_idx" ON "Programme"("publishStatus");

-- CreateIndex
CREATE INDEX "Programme_startDate_idx" ON "Programme"("startDate");

-- CreateIndex
CREATE INDEX "ProgrammeMember_userId_idx" ON "ProgrammeMember"("userId");

-- CreateIndex
CREATE INDEX "ProgrammeMember_programmeId_idx" ON "ProgrammeMember"("programmeId");

-- CreateIndex
CREATE INDEX "ProgrammeMember_status_idx" ON "ProgrammeMember"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ProgrammeMember_userId_programmeId_key" ON "ProgrammeMember"("userId", "programmeId");

-- CreateIndex
CREATE INDEX "Project_hubId_idx" ON "Project"("hubId");

-- CreateIndex
CREATE INDEX "Project_publishStatus_idx" ON "Project"("publishStatus");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "Project_priority_idx" ON "Project"("priority");

-- CreateIndex
CREATE INDEX "ProjectMember_userId_idx" ON "ProjectMember"("userId");

-- CreateIndex
CREATE INDEX "ProjectMember_projectId_idx" ON "ProjectMember"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMember_userId_projectId_key" ON "ProjectMember"("userId", "projectId");

-- CreateIndex
CREATE INDEX "Task_projectId_idx" ON "Task"("projectId");

-- CreateIndex
CREATE INDEX "Task_assigneeId_idx" ON "Task"("assigneeId");

-- CreateIndex
CREATE INDEX "Task_status_idx" ON "Task"("status");

-- CreateIndex
CREATE INDEX "Task_dueDate_idx" ON "Task"("dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "TaskDependency_taskId_dependsOnId_key" ON "TaskDependency"("taskId", "dependsOnId");

-- CreateIndex
CREATE INDEX "ProgressReport_projectId_idx" ON "ProgressReport"("projectId");

-- CreateIndex
CREATE INDEX "ProgressReport_userId_idx" ON "ProgressReport"("userId");

-- CreateIndex
CREATE INDEX "ProgressReport_createdAt_idx" ON "ProgressReport"("createdAt");

-- CreateIndex
CREATE INDEX "News_authorId_idx" ON "News"("authorId");

-- CreateIndex
CREATE INDEX "News_hubId_idx" ON "News"("hubId");

-- CreateIndex
CREATE INDEX "News_publishStatus_idx" ON "News"("publishStatus");

-- CreateIndex
CREATE INDEX "News_createdAt_idx" ON "News"("createdAt");

-- CreateIndex
CREATE INDEX "News_featured_idx" ON "News"("featured");

-- CreateIndex
CREATE INDEX "NewsComment_newsId_idx" ON "NewsComment"("newsId");

-- CreateIndex
CREATE INDEX "NewsComment_userId_idx" ON "NewsComment"("userId");

-- CreateIndex
CREATE INDEX "NewsComment_createdAt_idx" ON "NewsComment"("createdAt");

-- CreateIndex
CREATE INDEX "NewsLike_newsId_idx" ON "NewsLike"("newsId");

-- CreateIndex
CREATE INDEX "NewsLike_userId_idx" ON "NewsLike"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "NewsLike_newsId_userId_key" ON "NewsLike"("newsId", "userId");

-- CreateIndex
CREATE INDEX "Media_eventId_idx" ON "Media"("eventId");

-- CreateIndex
CREATE INDEX "Media_projectId_idx" ON "Media"("projectId");

-- CreateIndex
CREATE INDEX "Media_programmeId_idx" ON "Media"("programmeId");

-- CreateIndex
CREATE INDEX "Media_newsId_idx" ON "Media"("newsId");

-- CreateIndex
CREATE INDEX "Media_type_idx" ON "Media"("type");

-- CreateIndex
CREATE INDEX "HubMembershipRequest_userId_idx" ON "HubMembershipRequest"("userId");

-- CreateIndex
CREATE INDEX "HubMembershipRequest_hubId_idx" ON "HubMembershipRequest"("hubId");

-- CreateIndex
CREATE INDEX "HubMembershipRequest_status_idx" ON "HubMembershipRequest"("status");

-- CreateIndex
CREATE UNIQUE INDEX "HubMembershipRequest_userId_hubId_key" ON "HubMembershipRequest"("userId", "hubId");

-- CreateIndex
CREATE INDEX "EventRegistration_userId_idx" ON "EventRegistration"("userId");

-- CreateIndex
CREATE INDEX "EventRegistration_eventId_idx" ON "EventRegistration"("eventId");

-- CreateIndex
CREATE INDEX "EventRegistration_status_idx" ON "EventRegistration"("status");

-- CreateIndex
CREATE UNIQUE INDEX "EventRegistration_userId_eventId_key" ON "EventRegistration"("userId", "eventId");

-- CreateIndex
CREATE INDEX "ProjectJoinRequest_userId_idx" ON "ProjectJoinRequest"("userId");

-- CreateIndex
CREATE INDEX "ProjectJoinRequest_projectId_idx" ON "ProjectJoinRequest"("projectId");

-- CreateIndex
CREATE INDEX "ProjectJoinRequest_hubId_idx" ON "ProjectJoinRequest"("hubId");

-- CreateIndex
CREATE INDEX "ProjectJoinRequest_status_idx" ON "ProjectJoinRequest"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectJoinRequest_userId_projectId_key" ON "ProjectJoinRequest"("userId", "projectId");

-- CreateIndex
CREATE INDEX "ProgrammeJoinRequest_userId_idx" ON "ProgrammeJoinRequest"("userId");

-- CreateIndex
CREATE INDEX "ProgrammeJoinRequest_programmeId_idx" ON "ProgrammeJoinRequest"("programmeId");

-- CreateIndex
CREATE INDEX "ProgrammeJoinRequest_hubId_idx" ON "ProgrammeJoinRequest"("hubId");

-- CreateIndex
CREATE INDEX "ProgrammeJoinRequest_status_idx" ON "ProgrammeJoinRequest"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ProgrammeJoinRequest_userId_programmeId_key" ON "ProgrammeJoinRequest"("userId", "programmeId");

-- CreateIndex
CREATE INDEX "EventFeedback_eventId_idx" ON "EventFeedback"("eventId");

-- CreateIndex
CREATE INDEX "EventFeedback_userId_idx" ON "EventFeedback"("userId");

-- CreateIndex
CREATE INDEX "EventFeedback_rating_idx" ON "EventFeedback"("rating");

-- CreateIndex
CREATE UNIQUE INDEX "EventFeedback_eventId_userId_key" ON "EventFeedback"("eventId", "userId");

-- CreateIndex
CREATE INDEX "ProjectFile_projectId_idx" ON "ProjectFile"("projectId");

-- CreateIndex
CREATE INDEX "ProjectFile_uploadedBy_idx" ON "ProjectFile"("uploadedBy");

-- CreateIndex
CREATE INDEX "ProjectFile_type_idx" ON "ProjectFile"("type");

-- CreateIndex
CREATE INDEX "Announcement_projectId_idx" ON "Announcement"("projectId");

-- CreateIndex
CREATE INDEX "Announcement_createdBy_idx" ON "Announcement"("createdBy");

-- CreateIndex
CREATE INDEX "Announcement_priority_idx" ON "Announcement"("priority");

-- CreateIndex
CREATE INDEX "Announcement_createdAt_idx" ON "Announcement"("createdAt");

-- CreateIndex
CREATE INDEX "Discussion_projectId_idx" ON "Discussion"("projectId");

-- CreateIndex
CREATE INDEX "Discussion_createdBy_idx" ON "Discussion"("createdBy");

-- CreateIndex
CREATE INDEX "Discussion_createdAt_idx" ON "Discussion"("createdAt");

-- CreateIndex
CREATE INDEX "ProjectSuggestion_projectId_idx" ON "ProjectSuggestion"("projectId");

-- CreateIndex
CREATE INDEX "ProjectSuggestion_userId_idx" ON "ProjectSuggestion"("userId");

-- CreateIndex
CREATE INDEX "ProjectSuggestion_status_idx" ON "ProjectSuggestion"("status");

-- CreateIndex
CREATE INDEX "ProjectSuggestion_type_idx" ON "ProjectSuggestion"("type");

-- CreateIndex
CREATE UNIQUE INDEX "UserAnalytics_userId_key" ON "UserAnalytics"("userId");

-- CreateIndex
CREATE INDEX "UserAnalytics_userId_idx" ON "UserAnalytics"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "HubAnalytics_hubId_key" ON "HubAnalytics"("hubId");

-- CreateIndex
CREATE INDEX "HubAnalytics_hubId_idx" ON "HubAnalytics"("hubId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectAnalytics_projectId_key" ON "ProjectAnalytics"("projectId");

-- CreateIndex
CREATE INDEX "ProjectAnalytics_projectId_idx" ON "ProjectAnalytics"("projectId");

-- CreateIndex
CREATE INDEX "Partnership_hubId_idx" ON "Partnership"("hubId");

-- CreateIndex
CREATE INDEX "Partnership_createdBy_idx" ON "Partnership"("createdBy");

-- CreateIndex
CREATE INDEX "Partnership_status_idx" ON "Partnership"("status");

-- CreateIndex
CREATE INDEX "FundingOpportunity_hubId_idx" ON "FundingOpportunity"("hubId");

-- CreateIndex
CREATE INDEX "FundingOpportunity_createdBy_idx" ON "FundingOpportunity"("createdBy");

-- CreateIndex
CREATE INDEX "FundingOpportunity_status_idx" ON "FundingOpportunity"("status");

-- CreateIndex
CREATE INDEX "FundingOpportunity_deadline_idx" ON "FundingOpportunity"("deadline");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_read_idx" ON "Notification"("read");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "Account_provider_providerAccountId_idx" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_sessionToken_idx" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "OTP_email_idx" ON "OTP"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_HubCategories_AB_unique" ON "_HubCategories"("A", "B");

-- CreateIndex
CREATE INDEX "_HubCategories_B_index" ON "_HubCategories"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_SupervisorProgrammes_AB_unique" ON "_SupervisorProgrammes"("A", "B");

-- CreateIndex
CREATE INDEX "_SupervisorProgrammes_B_index" ON "_SupervisorProgrammes"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_SupervisorProjects_AB_unique" ON "_SupervisorProjects"("A", "B");

-- CreateIndex
CREATE INDEX "_SupervisorProjects_B_index" ON "_SupervisorProjects"("B");

-- AddForeignKey
ALTER TABLE "HubMember" ADD CONSTRAINT "HubMember_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES "Hub"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HubMember" ADD CONSTRAINT "HubMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES "Hub"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAttendanceBadge" ADD CONSTRAINT "EventAttendanceBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAttendanceBadge" ADD CONSTRAINT "EventAttendanceBadge_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Programme" ADD CONSTRAINT "Programme_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES "Hub"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgrammeMember" ADD CONSTRAINT "ProgrammeMember_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "Programme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgrammeMember" ADD CONSTRAINT "ProgrammeMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES "Hub"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskDependency" ADD CONSTRAINT "TaskDependency_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskDependency" ADD CONSTRAINT "TaskDependency_dependsOnId_fkey" FOREIGN KEY ("dependsOnId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressReport" ADD CONSTRAINT "ProgressReport_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressReport" ADD CONSTRAINT "ProgressReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "News" ADD CONSTRAINT "News_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "News" ADD CONSTRAINT "News_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES "Hub"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsComment" ADD CONSTRAINT "NewsComment_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "News"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsComment" ADD CONSTRAINT "NewsComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsLike" ADD CONSTRAINT "NewsLike_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "News"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsLike" ADD CONSTRAINT "NewsLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "Programme"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "News"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HubMembershipRequest" ADD CONSTRAINT "HubMembershipRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HubMembershipRequest" ADD CONSTRAINT "HubMembershipRequest_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES "Hub"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectJoinRequest" ADD CONSTRAINT "ProjectJoinRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectJoinRequest" ADD CONSTRAINT "ProjectJoinRequest_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectJoinRequest" ADD CONSTRAINT "ProjectJoinRequest_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES "Hub"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgrammeJoinRequest" ADD CONSTRAINT "ProgrammeJoinRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgrammeJoinRequest" ADD CONSTRAINT "ProgrammeJoinRequest_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "Programme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgrammeJoinRequest" ADD CONSTRAINT "ProgrammeJoinRequest_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES "Hub"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventFeedback" ADD CONSTRAINT "EventFeedback_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventFeedback" ADD CONSTRAINT "EventFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectFile" ADD CONSTRAINT "ProjectFile_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectFile" ADD CONSTRAINT "ProjectFile_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Discussion" ADD CONSTRAINT "Discussion_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Discussion" ADD CONSTRAINT "Discussion_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectSuggestion" ADD CONSTRAINT "ProjectSuggestion_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectSuggestion" ADD CONSTRAINT "ProjectSuggestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAnalytics" ADD CONSTRAINT "UserAnalytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HubAnalytics" ADD CONSTRAINT "HubAnalytics_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES "Hub"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAnalytics" ADD CONSTRAINT "ProjectAnalytics_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Partnership" ADD CONSTRAINT "Partnership_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES "Hub"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Partnership" ADD CONSTRAINT "Partnership_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundingOpportunity" ADD CONSTRAINT "FundingOpportunity_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES "Hub"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundingOpportunity" ADD CONSTRAINT "FundingOpportunity_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_HubCategories" ADD CONSTRAINT "_HubCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_HubCategories" ADD CONSTRAINT "_HubCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "Hub"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SupervisorProgrammes" ADD CONSTRAINT "_SupervisorProgrammes_A_fkey" FOREIGN KEY ("A") REFERENCES "Programme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SupervisorProgrammes" ADD CONSTRAINT "_SupervisorProgrammes_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SupervisorProjects" ADD CONSTRAINT "_SupervisorProjects_A_fkey" FOREIGN KEY ("A") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SupervisorProjects" ADD CONSTRAINT "_SupervisorProjects_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
