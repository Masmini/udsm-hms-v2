//src/app/dashboard/[userId]/my-hubs/[hubId]/hub-leader/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import HubLeaderClient from "./hub-leader-client";

export default async function HubLeaderDashboardPage({
  params,
}: {
  params: { userId: string; hubId: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  if (session.user.id !== params.userId) {
    redirect("/auth/signin");
  }

  // Verify user is a hub leader for this hub
  const hubMember = await prisma.hubMember.findFirst({
    where: {
      userId: params.userId,
      hubId: params.hubId,
      role: "HUB_LEADER",
      isActive: true,
      deletedAt: null,
    },
    include: {
      hub: {
        include: {
          categories: true,
          members: {
            where: { deletedAt: null },
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  profilePicture: true,
                  role: true,
                },
              },
            },
          },
          projects: {
            where: { deletedAt: null },
            include: {
              members: {
                include: {
                  user: true,
                },
              },
              tasks: true,
              projectJoinRequests: {
                where: { status: "PENDING" },
                include: {
                  user: true,
                },
              },
            },
          },
          events: {
            where: { deletedAt: null },
            include: {
              registrations: {
                where: { status: "PENDING" },
                include: {
                  user: true,
                },
              },
              attendanceBadges: true,
            },
          },
          programmes: {
            where: { deletedAt: null },
            include: {
              members: {
                include: {
                  user: true,
                },
              },
              programmeJoinRequests: {
                where: { status: "PENDING" },
                include: {
                  user: true,
                },
              },
            },
          },
          membershipRequests: {
            where: { status: "PENDING" },
            include: {
              user: true,
            },
          },
        },
      },
      user: true,
    },
  });

  if (!hubMember) {
    redirect(`/dashboard/${params.userId}`);
  }

  // Get analytics data
  const analytics = await prisma.hubAnalytics.findUnique({
    where: { hubId: params.hubId },
  });

  return (
    <HubLeaderClient
      hubMember={hubMember}
      analytics={analytics}
      userId={params.userId}
    />
  );
}
