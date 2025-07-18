//src/app/dashboard/[userId]/my-hubs/[hubId]/hub-member/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import HubMemberClient from "./hub-member-client";

export default async function HubMemberDashboardPage({
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

  // Verify user is a member of this hub (not leader or supervisor)
  const hubMember = await prisma.hubMember.findFirst({
    where: {
      userId: params.userId,
      hubId: params.hubId,
      role: "MEMBER",
      isActive: true,
      deletedAt: null,
    },
    include: {
      hub: {
        include: {
          categories: true,
          projects: {
            where: {
              deletedAt: null,
              publishStatus: "PUBLISHED",
            },
            include: {
              members: {
                include: {
                  user: true,
                },
              },
              tasks: {
                where: {
                  assigneeId: params.userId,
                },
              },
            },
          },
          events: {
            where: {
              deletedAt: null,
              publishStatus: "PUBLISHED",
            },
            include: {
              registrations: {
                where: {
                  userId: params.userId,
                },
              },
            },
          },
          programmes: {
            where: {
              deletedAt: null,
              publishStatus: "PUBLISHED",
            },
            include: {
              members: {
                where: {
                  userId: params.userId,
                },
              },
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

  // Get user's project memberships in this hub
  const userProjects = await prisma.projectMember.findMany({
    where: {
      userId: params.userId,
      project: {
        hubId: params.hubId,
        deletedAt: null,
      },
    },
    include: {
      project: {
        include: {
          tasks: {
            where: {
              assigneeId: params.userId,
            },
          },
          progressReports: {
            where: {
              userId: params.userId,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 5,
          },
        },
      },
    },
  });

  // Get user's notifications related to this hub
  const notifications = await prisma.notification.findMany({
    where: {
      userId: params.userId,
      read: false,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  });

  return (
    <HubMemberClient
      hubMember={hubMember}
      userProjects={userProjects}
      notifications={notifications}
      userId={params.userId}
    />
  );
}
