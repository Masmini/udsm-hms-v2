import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import EventDetailClient from "./event-detail-client";

export default async function EventDetailPage({
  params,
}: {
  params: { userId: string; eventId: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  if (session.user.id !== params.userId) {
    redirect("/auth/signin");
  }

  // Verify user is registered for this event
  const eventRegistration = await prisma.eventRegistration.findFirst({
    where: {
      userId: params.userId,
      eventId: params.eventId,
      deletedAt: null,
    },
  });

  if (!eventRegistration) {
    redirect(`/dashboard/${params.userId}/my-events`);
  }

  // Fetch detailed event information
  const event = await prisma.event.findUnique({
    where: { id: params.eventId },
    include: {
      hub: {
        select: {
          id: true,
          name: true,
          logo: true,
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
      attendanceBadges: {
        where: {
          userId: params.userId,
        },
      },
      eventFeedbacks: {
        where: {
          userId: params.userId,
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
    redirect(`/dashboard/${params.userId}/my-events`);
  }

  return (
    <EventDetailClient
      event={event}
      userRegistration={eventRegistration}
      userId={params.userId}
    />
  );
}
