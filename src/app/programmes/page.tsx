//src/app/programmes/page.tsx
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import ProgrammesClient from "./programmes-client";
import { Skeleton } from "@mui/material";
import { PublishStatus } from "@prisma/client";

interface Programme {
  id: string;
  title: string;
  description: string;
  coverImage?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  hub: {
    id: string;
    name: string;
    logo?: string | null;
  };
  members: {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      profilePicture?: string | null;
    };
  }[];
  supervisors: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string | null;
  }[];
  _count: {
    members: number;
  };
}

export default async function ProgrammesPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string };
}) {
  const page = parseInt(searchParams.page || "1");
  const search = searchParams.search || "";
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
  };

  const [programmes, total] = await Promise.all([
    prisma.programme.findMany({
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
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePicture: true,
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
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }) as Promise<Programme[]>,
    prisma.programme.count({ where }),
  ]);

  return (
    <Suspense fallback={<Skeleton variant="rectangular" height={400} />}>
      <ProgrammesClient
        programmes={programmes}
        pagination={{
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        }}
        searchParams={{ search }}
      />
    </Suspense>
  );
}
