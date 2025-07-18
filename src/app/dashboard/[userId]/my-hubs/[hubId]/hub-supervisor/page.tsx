import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import HubSupervisorClient from "./hub-supervisor-client";

export default async function HubSupervisorDashboardPage({
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

  // Verify user is a supervisor for this hub
  const hubMember = await prisma.hubMember.findFirst({
    where: {
      userId: params.userId,
      hubId: params.hubId,
      role: "SUPERVISOR",
      isActive: true,
      deletedAt: null,
    },
    include: {
      hub: {
        include: {
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
              supervisors: true,
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

  // Get supervised programmes
  const supervisedProgrammes = await prisma.programme.findMany({
    where: {
      hubId: params.hubId,
      supervisors: {
        some: {
          id: params.userId,
        },
      },
      deletedAt: null,
    },
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
      hub: true,
    },
  });

  return (
    <HubSupervisorClient
      hubMember={hubMember}
      supervisedProgrammes={supervisedProgrammes}
      userId={params.userId}
    />
  );
}
