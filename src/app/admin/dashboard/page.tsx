//src/app/admin/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminDashboardClient from "./admin-dashboard-client";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/auth/signin");
  }

  // Fetch admin dashboard data
  const [
    totalUsers,
    totalHubs,
    totalProjects,
    totalEvents,
    recentUsers,
    recentHubs,
    pendingRequests,
  ] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.hub.count({ where: { deletedAt: null } }),
    prisma.project.count({ where: { deletedAt: null } }),
    prisma.event.count({ where: { deletedAt: null } }),
    prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
        profilePicture: true,
      },
    }),
    prisma.hub.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        description: true,
        logo: true,
        createdAt: true,
        _count: {
          select: {
            members: true,
          },
        },
      },
    }),
    prisma.hubMembershipRequest.count({
      where: { status: "PENDING", deletedAt: null },
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
    recentUsers,
    recentHubs,
  };

  return <AdminDashboardClient data={dashboardData} />;
}
