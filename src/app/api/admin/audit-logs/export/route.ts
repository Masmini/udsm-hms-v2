//src/app/api/admin/audit-logs/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Force dynamic rendering to avoid static prerendering issues
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "csv";
    const userId = searchParams.get("userId");
    const action = searchParams.get("action");
    const entityType = searchParams.get("entityType");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const success = searchParams.get("success");
    const search = searchParams.get("search");

    // Generate mock audit logs for export
    const mockAuditLogs = await generateMockAuditLogs(
      userId,
      action,
      entityType,
      startDate,
      endDate,
      0,
      1000
    );

    if (format === "csv") {
      const csvContent = generateCSV(mockAuditLogs);
      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="audit-logs-${
            new Date().toISOString().split("T")[0]
          }.csv"`,
        },
      });
    } else if (format === "json") {
      const jsonContent = JSON.stringify(mockAuditLogs, null, 2);
      return new NextResponse(jsonContent, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="audit-logs-${
            new Date().toISOString().split("T")[0]
          }.json"`,
        },
      });
    }

    return NextResponse.json({ error: "Invalid format" }, { status: 400 });
  } catch (error) {
    console.error("Export audit logs error:", error);
    return NextResponse.json(
      { error: "Failed to export audit logs" },
      { status: 500 }
    );
  }
}

function generateCSV(logs: any[]) {
  const headers = [
    "Timestamp",
    "User Email",
    "Action",
    "Entity Type",
    "Entity ID",
    "Success",
    "IP Address",
    "User Agent",
  ];
  const csvRows = [headers.join(",")];

  logs.forEach((log) => {
    const row = [
      log.timestamp.toISOString(),
      `"${log.userEmail}"`,
      log.action,
      log.entityType,
      log.entityId || "",
      log.success.toString(), // Ensure boolean is stringified for CSV
      log.ipAddress,
      `"${log.userAgent.replace(/"/g, '""')}"`,
    ];
    csvRows.push(row.join(","));
  });

  return csvRows.join("\n");
}

async function generateMockAuditLogs(
  userId?: string | null,
  action?: string | null,
  entityType?: string | null,
  startDate?: string | null,
  endDate?: string | null,
  skip: number = 0,
  limit: number = 50
) {
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

  const auditLogs: any[] = [];
  let logId = 1;

  // Generate audit logs based on actual data
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
