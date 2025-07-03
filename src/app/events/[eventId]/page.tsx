import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import EventDetailClient from "./event-detail-client";
import { redirect } from "next/navigation";

export default async function EventDetailPage({
  params,
}: {
  params: { eventId: string };
}) {
  const session = await getServerSession();

  // Fetch event with comprehensive details
  const event = await prisma.event.findUnique({
    where: {
      id: params.eventId,
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
      creator: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profilePicture: true,
        },
      },
      registrations: {
        where: {
          status: "APPROVED",
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePicture: true,
              skills: true,
            },
          },
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
          registrations: true,
        },
      },
    },
  });

  if (!event) {
    redirect("/events");
  }

  // Check if user can register
  let canRegister = false;
  let isHubLeaderOrSupervisor = false;
  let existingRegistration = null;

  if (session?.user?.id) {
    // Check if user is already registered
    existingRegistration = await prisma.eventRegistration.findFirst({
      where: {
        userId: session.user.id,
        eventId: event.id,
        deletedAt: null,
      },
    });

    // Check if user is hub leader or supervisor
    const hubMembership = await prisma.hubMember.findFirst({
      where: {
        userId: session.user.id,
        hubId: event.hubId,
        role: { in: ["HUB_LEADER", "SUPERVISOR"] },
        isActive: true,
        deletedAt: null,
      },
    });

    isHubLeaderOrSupervisor = !!hubMembership;

    // Can register if not already registered, not hub leader/supervisor, and event is upcoming
    canRegister =
      !existingRegistration &&
      !isHubLeaderOrSupervisor &&
      new Date(event.startDate) > new Date();
  }

  return (
    <EventDetailClient
      event={event}
      userId={session?.user?.id}
      canRegister={canRegister}
      isHubLeaderOrSupervisor={isHubLeaderOrSupervisor}
      existingRegistration={existingRegistration}
    />
  );
}
