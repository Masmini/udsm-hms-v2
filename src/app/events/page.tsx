//src/app/events/page.tsx
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import EventsClient from "./events-client";
import { Skeleton } from "@mui/material";
import { PublishStatus } from "@prisma/client";

interface Event {
  id: string;
  title: string;
  description: string;
  coverImage?: string | null;
  startDate: Date;
  endDate?: Date | null;
  eventType: string;
  capacity?: number | null;
  visibility: string;
  hub: {
    id: string;
    name: string;
    logo?: string | null;
  };
  registrations: { status: string }[];
  _count: {
    registrations: number;
  };
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    search?: string;
    eventType?: string;
    upcoming?: string;
  };
}) {
  const page = parseInt(searchParams.page || "1");
  const search = searchParams.search || "";
  const eventType = searchParams.eventType || "";
  const upcoming = searchParams.upcoming === "true";
  const limit = 12;
  const skip = (page - 1) * limit;

  const where = {
    deletedAt: null,
    publishStatus: PublishStatus.PUBLISHED, // Use enum
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
      ],
    }),
    ...(eventType && { eventType }),
    ...(upcoming && {
      startDate: {
        gte: new Date(),
      },
    }),
  };

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      skip,
      take: limit,
      include: {
        hub: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        registrations: {
          where: { status: "APPROVED" },
        },
        _count: {
          select: {
            registrations: true,
          },
        },
      },
      orderBy: { startDate: "asc" },
    }) as Promise<Event[]>,
    prisma.event.count({ where }),
  ]);

  return (
    <Suspense fallback={<Skeleton variant="rectangular" height={400} />}>
      <EventsClient
        events={events}
        pagination={{
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        }}
        searchParams={{ search, eventType, upcoming: upcoming.toString() }}
      />
    </Suspense>
  );
}
