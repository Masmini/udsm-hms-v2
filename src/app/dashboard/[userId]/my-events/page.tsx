import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MyEventsClient from "./my-events-client";

export default async function MyEventsPage({
  params,
}: {
  params: { userId: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  if (session.user.id !== params.userId) {
    redirect("/auth/signin");
  }

  // Fetch user's event registrations
  const eventRegistrations = await prisma.eventRegistration.findMany({
    where: {
      userId: params.userId,
      deletedAt: null,
    },
    include: {
      event: {
        include: {
          hub: {
            select: {
              id: true,
              name: true,
              logo: true,
            },
          },
          _count: {
            select: {
              registrations: true,
            },
          },
        },
      },
    },
    orderBy: {
      registeredAt: "desc",
    },
  });

  return (
    <MyEventsClient
      eventRegistrations={eventRegistrations}
      userId={params.userId}
    />
  );
}
