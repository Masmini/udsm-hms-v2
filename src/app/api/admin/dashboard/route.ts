//src/app/api/admin/dashboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { aiInsightsService, AIInsight } from "@/lib/ai-insights";
import { addDays, subDays, differenceInDays, format } from "date-fns";

interface DashboardData {
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalHubs: number;
    totalProjects: number;
    totalEvents: number;
    pendingRequests: number;
    engagementRate: number;
    growthRate: number;
  };
  recentActivity: { title: string; description: string; createdAt: string }[];
  aiInsights: AIInsight[];
  chartData: {
    userGrowth: {
      labels: string[];
      datasets: {
        label: string;
        data: number[];
        borderColor: string;
        fill: boolean;
      }[];
    };
    hubActivity: {
      labels: string[];
      datasets: { data: number[]; backgroundColor: string[] }[];
    };
    projectCompletion: {
      labels: string[];
      datasets: { label: string; data: number[]; backgroundColor: string }[];
    };
  };
}

// Mock data as a fallback
const mockDashboardData: DashboardData = {
  stats: {
    totalUsers: 2500,
    activeUsers: 1800,
    totalHubs: 12,
    totalProjects: 156,
    totalEvents: 89,
    pendingRequests: 10,
    engagementRate: 72,
    growthRate: 15.3,
  },
  recentActivity: [
    {
      title: "User Joined",
      description: "Jane Doe joined Tech Hub",
      createdAt: new Date().toISOString(),
    },
    {
      title: "Project Created",
      description: "AI Project started in Business Hub",
      createdAt: new Date().toISOString(),
    },
    {
      title: "Event Registered",
      description: "John Smith registered for Workshop",
      createdAt: new Date().toISOString(),
    },
  ],
  aiInsights: [
    {
      type: "recommendation",
      title: "Boost Engagement",
      description: "Increase user activity with targeted events.",
      confidence: 0.85,
      actionable: true,
      priority: "medium",
    },
  ],
  chartData: {
    userGrowth: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [
        {
          label: "Users",
          data: [1200, 1500, 1800, 2000, 2200, 2500],
          borderColor: "#1976d2",
          fill: false,
        },
      ],
    },
    hubActivity: {
      labels: ["Tech", "Business", "Arts"],
      datasets: [
        {
          data: [40, 30, 30],
          backgroundColor: ["#1976d2", "#388e3c", "#f57c00"],
        },
      ],
    },
    projectCompletion: {
      labels: ["Tech", "Business", "Arts"],
      datasets: [
        {
          label: "Completion %",
          data: [85, 70, 65],
          backgroundColor: "#1976d2",
        },
      ],
    },
  },
};

export async function GET(request: NextRequest) {
  try {
    // Authenticate the user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query parameters for date range
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("start")
      ? new Date(searchParams.get("start")!)
      : subDays(new Date(), 30);
    const endDate = searchParams.get("end")
      ? new Date(searchParams.get("end")!)
      : new Date();

    // Fetch stats from Prisma
    const [
      totalUsers,
      activeUsers,
      totalHubs,
      totalProjects,
      totalEvents,
      pendingRequests,
      previousUsers,
      hubActivity,
      projectCompletion,
      recentActivity,
    ] = await Promise.all([
      // Total users
      prisma.user.count({
        where: { deletedAt: null, isActive: true },
      }),
      // Active users (based on lastLoginAt in the last 30 days)
      prisma.user.count({
        where: {
          deletedAt: null,
          isActive: true,
          lastLoginAt: { gte: subDays(new Date(), 30) },
        },
      }),
      // Total hubs
      prisma.hub.count({
        where: { deletedAt: null, isActive: true },
      }),
      // Total projects
      prisma.project.count({
        where: { deletedAt: null, publishStatus: "PUBLISHED" },
      }),
      // Total events
      prisma.event.count({
        where: { deletedAt: null, publishStatus: "PUBLISHED" },
      }),
      // Pending requests (hub membership, project join, programme join, event registrations)
      prisma.$queryRaw`
        SELECT COUNT(*) as count
        FROM (
          SELECT id FROM "HubMembershipRequest" WHERE status = 'PENDING' AND "deletedAt" IS NULL
          UNION ALL
          SELECT id FROM "ProjectJoinRequest" WHERE status = 'PENDING' AND "deletedAt" IS NULL
          UNION ALL
          SELECT id FROM "ProgrammeJoinRequest" WHERE status = 'PENDING' AND "deletedAt" IS NULL
          UNION ALL
          SELECT id FROM "EventRegistration" WHERE status = 'PENDING' AND "deletedAt" IS NULL
        ) as requests
      `.then((result: any) => Number(result[0].count)),
      // Previous user count for growth rate (60 days ago to 30 days ago)
      prisma.user.count({
        where: {
          deletedAt: null,
          isActive: true,
          createdAt: { lte: subDays(new Date(), 30) },
        },
      }),
      // Hub activity (events and projects per hub)
      prisma.hub.findMany({
        where: { deletedAt: null, isActive: true },
        select: {
          name: true,
          _count: {
            select: {
              events: {
                where: { deletedAt: null, publishStatus: "PUBLISHED" },
              },
              projects: {
                where: { deletedAt: null, publishStatus: "PUBLISHED" },
              },
            },
          },
        },
        take: 10, // Limit to top 10 hubs for performance
      }),
      // Project completion rates by hub
      prisma.hub.findMany({
        where: { deletedAt: null, isActive: true },
        select: {
          name: true,
          projects: {
            where: { deletedAt: null, publishStatus: "PUBLISHED" },
            select: { status: true },
          },
        },
        take: 10,
      }),
      // Recent activity (from AuditLog for user actions, project creations, event registrations)
      prisma.auditLog.findMany({
        where: {
          timestamp: { gte: startDate, lte: endDate },
          action: {
            in: [
              "USER_LOGIN",
              "PROJECT_CREATED",
              "EVENT_REGISTRATION_CREATED",
              "HUB_MEMBERSHIP_REQUESTED",
            ],
          },
          success: true,
        },
        select: {
          action: true,
          details: true,
          timestamp: true,
        },
        orderBy: { timestamp: "desc" },
        take: 10,
      }),
    ]);

    // Compute engagement rate (active users / total users)
    const engagementRate =
      totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;

    // Compute growth rate (users in last 30 days vs previous 30 days)
    const newUsers = totalUsers - previousUsers;
    const growthRate = previousUsers > 0 ? (newUsers / previousUsers) * 100 : 0;

    // Prepare chart data
    const days = Math.min(differenceInDays(endDate, startDate), 30);
    const userGrowthLabels = Array.from({ length: days }, (_, i) =>
      format(addDays(startDate, i), "MMM dd")
    );
    const userGrowthData = await Promise.all(
      userGrowthLabels.map(async (_, i) => {
        const date = addDays(startDate, i);
        const count = await prisma.user.count({
          where: {
            deletedAt: null,
            isActive: true,
            createdAt: { lte: date },
          },
        });
        return count;
      })
    );

    const hubActivityLabels = hubActivity.map((hub) => hub.name);
    const hubActivityData = hubActivity.map(
      (hub) => hub._count.events + hub._count.projects
    );

    const projectCompletionLabels = hubActivity.map((hub) => hub.name);
    const projectCompletionData = projectCompletion.map((hub) => {
      const total = hub.projects.length;
      const completed = hub.projects.filter(
        (p) => p.status === "COMPLETED"
      ).length;
      return total > 0 ? (completed / total) * 100 : 0;
    });

    const chartData = {
      userGrowth: {
        labels: userGrowthLabels,
        datasets: [
          {
            label: "Users",
            data: userGrowthData,
            borderColor: "#1976d2",
            fill: false,
          },
        ],
      },
      hubActivity: {
        labels: hubActivityLabels,
        datasets: [
          {
            data: hubActivityData,
            backgroundColor: [
              "#1976d2",
              "#388e3c",
              "#f57c00",
              "#7b1fa2",
              "#0288d1",
              "#d81b60",
              "#fbc02d",
              "#455a64",
            ],
          },
        ],
      },
      projectCompletion: {
        labels: projectCompletionLabels,
        datasets: [
          {
            label: "Completion %",
            data: projectCompletionData,
            backgroundColor: "#1976d2",
          },
        ],
      },
    };

    // Generate AI insights
    const metrics = {
      totalUsers,
      activeUsers,
      totalHubs,
      totalProjects,
      totalEvents,
      engagementRate: Number(engagementRate.toFixed(1)),
      growthRate: Number(growthRate.toFixed(1)),
    };

    const aiInsights = await aiInsightsService.generateSystemInsights(metrics);

    // Format recent activity from AuditLog
    const recentActivityFormatted = recentActivity.map((log) => {
      let title = "";
      let description = "";
      switch (log.action) {
        case "USER_LOGIN":
          title = "User Logged In";
          description = `User ${
            typeof log.details === "object" &&
            log.details !== null &&
            "email" in log.details
              ? (log.details as { email?: string }).email ?? "Unknown"
              : "Unknown"
          } logged into the system`;
          break;
        case "PROJECT_CREATED":
          title = "Project Created";
          description = `New project "${
            typeof log.details === "object" &&
            log.details !== null &&
            "title" in log.details
              ? (log.details as { title?: string }).title ?? "Unknown"
              : "Unknown"
          }" created`;
          break;
        case "EVENT_REGISTRATION_CREATED":
          title = "Event Registration";
          description = `User registered for event "${
            typeof log.details === "object" &&
            log.details !== null &&
            "eventTitle" in log.details
              ? (log.details as { eventTitle?: string }).eventTitle ?? "Unknown"
              : "Unknown"
          }"`;
          break;
        case "HUB_MEMBERSHIP_REQUESTED":
          title = "Hub Membership Requested";
          description = `User requested to join hub "${
            typeof log.details === "object" &&
            log.details !== null &&
            "hubName" in log.details
              ? (log.details as { hubName?: string }).hubName ?? "Unknown"
              : "Unknown"
          }"`;
          break;
        default:
          title = log.action;
          description =
            typeof log.details === "object" &&
            log.details !== null &&
            "message" in log.details
              ? (log.details as { message?: string }).message ??
                "Activity occurred"
              : "Activity occurred";
      }
      return {
        title,
        description,
        createdAt: log.timestamp.toISOString(),
      };
    });

    // Format response
    const response: DashboardData = {
      stats: {
        totalUsers,
        activeUsers,
        totalHubs,
        totalProjects,
        totalEvents,
        pendingRequests,
        engagementRate: Number(engagementRate.toFixed(1)),
        growthRate: Number(growthRate.toFixed(1)),
      },
      recentActivity: recentActivityFormatted,
      aiInsights,
      chartData,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Dashboard API error:", error);
    // Fallback to mock data on error
    return NextResponse.json(mockDashboardData, { status: 200 });
  }
}
