//src/app/admin/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminDashboardClient from "./admin-dashboard-client";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: { page?: string; action?: string; search?: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/auth/signin");
  }

  const page = parseInt(searchParams.page || "1");
  const action = searchParams.action || "";
  const search = searchParams.search || "";
  const limit = 10;
  const skip = (page - 1) * limit;

  const where = {
    ...(action && {
      action: { contains: action, mode: "insensitive" as const },
    }),
    ...(search && {
      details: {
        path: "$[*]",
        array_contains: search,
        mode: "insensitive" as const,
      },
    }),
  };

  const [
    totalUsers,
    totalHubs,
    totalProjects,
    totalEvents,
    pendingRequests,
    recentActivity,
    totalActivity,
    actionTypes,
  ] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.hub.count({ where: { deletedAt: null } }),
    prisma.project.count({
      where: { deletedAt: null, publishStatus: "PUBLISHED" },
    }),
    prisma.event.count({
      where: { deletedAt: null, publishStatus: "PUBLISHED" },
    }),
    prisma.hubMembershipRequest.count({
      where: { status: "PENDING", deletedAt: null },
    }),
    prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: "desc" },
      take: limit,
      skip,
      select: {
        id: true,
        action: true,
        details: true,
        timestamp: true,
      },
    }),
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      select: { action: true },
      distinct: ["action"],
      orderBy: { action: "asc" },
    }),
  ]);

  const dashboardData = {
    stats: {
      totalUsers,
      totalHubs,
      totalProjects,
      totalEvents,
      pendingRequests,
    },
    recentActivity: recentActivity.map((log) => ({
      title: log.action,
      description:
        log.details && typeof log.details === "object"
          ? JSON.stringify(log.details)
          : typeof log.details === "string"
          ? log.details
          : typeof log.details === "number"
          ? log.details.toString()
          : log.details === true
          ? "true"
          : log.details === false
          ? "false"
          : "No description available",
      createdAt: log.timestamp.toISOString(),
    })),
    actionTypes: actionTypes.map((log) => log.action),
    pagination: {
      page,
      limit,
      total: totalActivity,
      totalPages: Math.ceil(totalActivity / limit),
    },
  };

  return <AdminDashboardClient data={dashboardData} />;
}
