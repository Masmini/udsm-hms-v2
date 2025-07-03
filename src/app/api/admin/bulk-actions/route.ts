//src/app/api/admin/bulk-actions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, entityType, entityIds, data } = await request.json();

    if (!action || !entityType || !Array.isArray(entityIds)) {
      return NextResponse.json(
        { error: "Missing required parameters: action, entityType, entityIds" },
        { status: 400 }
      );
    }

    let results = [];

    switch (entityType) {
      case "users":
        results = [await handleUserBulkActions(action, entityIds, data)];
        break;
      case "hubs":
        results = [await handleHubBulkActions(action, entityIds, data)];
        break;
      case "events":
        results = [await handleEventBulkActions(action, entityIds, data)];
        break;
      case "projects":
        results = [await handleProjectBulkActions(action, entityIds, data)];
        break;
      default:
        return NextResponse.json(
          { error: `Unsupported entity type: ${entityType}` },
          { status: 400 }
        );
    }

    // Log the bulk action
    console.log(`Admin ${session.user.email} performed bulk action:`, {
      action,
      entityType,
      entityCount: entityIds.length,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      results,
      message: `Bulk ${action} completed for ${entityIds.length} ${entityType}`,
    });
  } catch (error) {
    console.error("Bulk action error:", error);
    return NextResponse.json(
      { error: "Failed to perform bulk action" },
      { status: 500 }
    );
  }
}

async function handleUserBulkActions(
  action: string,
  userIds: string[],
  data?: any
) {
  switch (action) {
    case "activate":
      return await prisma.user.updateMany({
        where: { id: { in: userIds } },
        data: { isActive: true },
      });

    case "deactivate":
      return await prisma.user.updateMany({
        where: { id: { in: userIds } },
        data: { isActive: false },
      });

    case "delete":
      return await prisma.user.updateMany({
        where: { id: { in: userIds } },
        data: { deletedAt: new Date() },
      });

    case "change_role":
      if (!data?.role) {
        throw new Error("Role is required for role change action");
      }
      return await prisma.user.updateMany({
        where: { id: { in: userIds } },
        data: { role: data.role },
      });

    default:
      throw new Error(`Unsupported user action: ${action}`);
  }
}

async function handleHubBulkActions(
  action: string,
  hubIds: string[],
  data?: any
) {
  switch (action) {
    case "activate":
      return await prisma.hub.updateMany({
        where: { id: { in: hubIds } },
        data: { isActive: true },
      });

    case "deactivate":
      return await prisma.hub.updateMany({
        where: { id: { in: hubIds } },
        data: { isActive: false },
      });

    case "delete":
      return await prisma.hub.updateMany({
        where: { id: { in: hubIds } },
        data: { deletedAt: new Date() },
      });

    default:
      throw new Error(`Unsupported hub action: ${action}`);
  }
}

async function handleEventBulkActions(
  action: string,
  eventIds: string[],
  data?: any
) {
  switch (action) {
    case "publish":
      return await prisma.event.updateMany({
        where: { id: { in: eventIds } },
        data: { publishStatus: "PUBLISHED" },
      });

    case "unpublish":
      return await prisma.event.updateMany({
        where: { id: { in: eventIds } },
        data: { publishStatus: "DRAFT" },
      });

    case "archive":
      return await prisma.event.updateMany({
        where: { id: { in: eventIds } },
        data: { publishStatus: "ARCHIVED" },
      });

    case "delete":
      return await prisma.event.updateMany({
        where: { id: { in: eventIds } },
        data: { deletedAt: new Date() },
      });

    default:
      throw new Error(`Unsupported event action: ${action}`);
  }
}

async function handleProjectBulkActions(
  action: string,
  projectIds: string[],
  data?: any
) {
  switch (action) {
    case "publish":
      return await prisma.project.updateMany({
        where: { id: { in: projectIds } },
        data: { publishStatus: "PUBLISHED" },
      });

    case "unpublish":
      return await prisma.project.updateMany({
        where: { id: { in: projectIds } },
        data: { publishStatus: "DRAFT" },
      });

    case "archive":
      return await prisma.project.updateMany({
        where: { id: { in: projectIds } },
        data: { publishStatus: "ARCHIVED" },
      });

    case "delete":
      return await prisma.project.updateMany({
        where: { id: { in: projectIds } },
        data: { deletedAt: new Date() },
      });

    case "change_status":
      if (!data?.status) {
        throw new Error("Status is required for status change action");
      }
      return await prisma.project.updateMany({
        where: { id: { in: projectIds } },
        data: { status: data.status },
      });

    default:
      throw new Error(`Unsupported project action: ${action}`);
  }
}
