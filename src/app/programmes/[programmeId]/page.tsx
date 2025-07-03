import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import ProgrammeDetailClient from "./programme-detail-client";
import { redirect } from "next/navigation";

export default async function ProgrammeDetailPage({
  params,
}: {
  params: { programmeId: string };
}) {
  const session = await getServerSession();

  // Fetch programme with comprehensive details
  const programme = await prisma.programme.findUnique({
    where: {
      id: params.programmeId,
      deletedAt: null,
      publishStatus: "PUBLISHED",
    },
    include: {
      hub: {
        select: {
          id: true,
          name: true,
          logo: true,
          description: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePicture: true,
              skills: true,
              bio: true,
            },
          },
        },
      },
      supervisors: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profilePicture: true,
          bio: true,
        },
      },
      media: {
        where: {
          deletedAt: null,
        },
        orderBy: {
          uploadedAt: "desc",
        },
        take: 10,
      },
      _count: {
        select: {
          members: true,
        },
      },
    },
  });

  if (!programme) {
    redirect("/programmes");
  }

  // Check if user can join
  let canJoin = false;
  let isHubLeaderOrSupervisor = false;
  let isProgrammeSupervisor = false;
  let existingMembership = null;
  let existingJoinRequest = null;

  if (session?.user?.id) {
    // Check if user is already a programme member
    existingMembership = await prisma.programmeMember.findFirst({
      where: {
        userId: session.user.id,
        programmeId: programme.id,
        deletedAt: null,
      },
    });

    // Check if user is hub leader or supervisor
    const hubMembership = await prisma.hubMember.findFirst({
      where: {
        userId: session.user.id,
        hubId: programme.hubId,
        role: { in: ["HUB_LEADER", "SUPERVISOR"] },
        isActive: true,
        deletedAt: null,
      },
    });

    isHubLeaderOrSupervisor = !!hubMembership;

    // Check if user is programme supervisor
    isProgrammeSupervisor = programme.supervisors.some(
      (s: any) => s.id === session.user.id
    );

    // Check for existing join request
    if (
      !existingMembership &&
      !isHubLeaderOrSupervisor &&
      !isProgrammeSupervisor
    ) {
      existingJoinRequest = await prisma.programmeJoinRequest.findFirst({
        where: {
          userId: session.user.id,
          programmeId: programme.id,
          status: "PENDING",
        },
      });

      canJoin = !existingJoinRequest;
    }
  }

  return (
    <ProgrammeDetailClient
      programme={programme}
      userId={session?.user?.id}
      canJoin={canJoin}
      isHubLeaderOrSupervisor={isHubLeaderOrSupervisor}
      isProgrammeSupervisor={isProgrammeSupervisor}
      existingMembership={existingMembership}
      existingJoinRequest={existingJoinRequest}
    />
  );
}
