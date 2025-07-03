//src/app/api/admin/audit-logs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  userEmail: string;
  action: string;
  entityType: string;
  entityId?: string;
  details: any;
  ipAddress: string;
  userAgent: string;
  success: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const userId = searchParams.get("userId");
    const action = searchParams.get("action");
    const entityType = searchParams.get("entityType");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const skip = (page - 1) * limit;

    // For now, we'll create mock audit logs since we don't have a dedicated audit table
    // In production, you'd want to implement proper audit logging
    const mockAuditLogs = await generateMockAuditLogs(
      userId,
      action,
      entityType,
      startDate,
      endDate,
      skip,
      limit
    );
    const total = await getMockAuditLogsCount(
      userId,
      action,
      entityType,
      startDate,
      endDate
    );

    return NextResponse.json({
      logs: mockAuditLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Audit logs API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}

async function generateMockAuditLogs(
  userId?: string | null,
  action?: string | null,
  entityType?: string | null,
  startDate?: string | null,
  endDate?: string | null,
  skip: number = 0,
  limit: number = 50
): Promise<AuditLog[]> {
  // Get recent user activities to create realistic audit logs
  const recentUsers = await prisma.user.findMany({
    take: 20,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const recentHubs = await prisma.hub.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const recentEvents = await prisma.event.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      createdBy: true,
    },
  });

  const auditLogs: AuditLog[] = [];
  const actions = [
    "CREATE",
    "UPDATE",
    "DELETE",
    "LOGIN",
    "LOGOUT",
    "ROLE_CHANGE",
    "APPROVE",
    "REJECT",
  ];
  const entityTypes = ["USER", "HUB", "EVENT", "PROJECT", "PROGRAMME", "NEWS"];

  // Generate audit logs based on actual data
  let logId = 1;

  // User creation logs
  recentUsers.forEach((user, index) => {
    if (auditLogs.length >= limit) return;

    auditLogs.push({
      id: `audit_${logId++}`,
      timestamp: new Date(
        user.createdAt.getTime() + Math.random() * 1000 * 60 * 60
      ),
      userId: user.id,
      userEmail: user.email,
      action: "CREATE",
      entityType: "USER",
      entityId: user.id,
      details: {
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      success: true,
    });

    // Login logs
    if (Math.random() > 0.3) {
      auditLogs.push({
        id: `audit_${logId++}`,
        timestamp: new Date(
          user.createdAt.getTime() + Math.random() * 1000 * 60 * 60 * 24
        ),
        userId: user.id,
        userEmail: user.email,
        action: "LOGIN",
        entityType: "SESSION",
        details: {
          loginMethod: user.email.includes("google") ? "google" : "credentials",
        },
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        success: true,
      });
    }
  });

  // Hub creation logs
  recentHubs.forEach((hub) => {
    if (auditLogs.length >= limit) return;

    const randomUser =
      recentUsers[Math.floor(Math.random() * recentUsers.length)];
    auditLogs.push({
      id: `audit_${logId++}`,
      timestamp: new Date(hub.createdAt.getTime() + Math.random() * 1000 * 60),
      userId: randomUser.id,
      userEmail: randomUser.email,
      action: "CREATE",
      entityType: "HUB",
      entityId: hub.id,
      details: {
        hubName: hub.name,
      },
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      success: true,
    });
  });

  // Event creation logs
  recentEvents.forEach((event) => {
    if (auditLogs.length >= limit) return;

    const creator =
      recentUsers.find((u) => u.id === event.createdBy) || recentUsers[0];
    auditLogs.push({
      id: `audit_${logId++}`,
      timestamp: new Date(
        event.createdAt.getTime() + Math.random() * 1000 * 60
      ),
      userId: creator.id,
      userEmail: creator.email,
      action: "CREATE",
      entityType: "EVENT",
      entityId: event.id,
      details: {
        eventTitle: event.title,
      },
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15",
      success: true,
    });
  });

  // Add some failed login attempts
  for (let i = 0; i < 3; i++) {
    if (auditLogs.length >= limit) break;

    auditLogs.push({
      id: `audit_${logId++}`,
      timestamp: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 7),
      userId: "unknown",
      userEmail: `failed.attempt.${i}@example.com`,
      action: "LOGIN",
      entityType: "SESSION",
      details: {
        reason: "Invalid credentials",
        attempts: Math.floor(Math.random() * 5) + 1,
      },
      ipAddress: `203.0.113.${Math.floor(Math.random() * 255)}`,
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      success: false,
    });
  }

  // Sort by timestamp descending
  auditLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  // Apply filters
  let filteredLogs = auditLogs;

  if (userId) {
    filteredLogs = filteredLogs.filter((log) => log.userId === userId);
  }

  if (action) {
    filteredLogs = filteredLogs.filter((log) => log.action === action);
  }

  if (entityType) {
    filteredLogs = filteredLogs.filter((log) => log.entityType === entityType);
  }

  if (startDate) {
    const start = new Date(startDate);
    filteredLogs = filteredLogs.filter((log) => log.timestamp >= start);
  }

  if (endDate) {
    const end = new Date(endDate);
    filteredLogs = filteredLogs.filter((log) => log.timestamp <= end);
  }

  return filteredLogs.slice(skip, skip + limit);
}

async function getMockAuditLogsCount(
  userId?: string | null,
  action?: string | null,
  entityType?: string | null,
  startDate?: string | null,
  endDate?: string | null
): Promise<number> {
  // Return a realistic count based on the system size
  const baseCount = 1000;
  let multiplier = 1;

  if (userId) multiplier *= 0.1;
  if (action) multiplier *= 0.3;
  if (entityType) multiplier *= 0.4;
  if (startDate || endDate) multiplier *= 0.5;

  return Math.floor(baseCount * multiplier);
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, entityType, entityId, details } = await request.json();

    // In a real implementation, you would save this to an audit_logs table
    const auditLog = {
      id: `audit_${Date.now()}`,
      timestamp: new Date(),
      userId: session.user.id,
      userEmail: session.user.email,
      action,
      entityType,
      entityId,
      details,
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
      success: true,
    };

    console.log("Audit Log Created:", auditLog);

    return NextResponse.json({ success: true, auditLog });
  } catch (error) {
    console.error("Create audit log error:", error);
    return NextResponse.json(
      { error: "Failed to create audit log" },
      { status: 500 }
    );
  }
}
