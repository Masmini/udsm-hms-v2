//src/app/projects/page.tsx
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import ProjectsClient from "./projects-client";
import { Skeleton } from "@mui/material";
import { PublishStatus, Visibility } from "@prisma/client";

interface Project {
  id: string;
  title: string;
  description: string;
  coverImage?: string | null;
  visibility: string;
  skills: string[];
  startDate?: Date | null;
  endDate?: Date | null;
  completionRate: number;
  hub: {
    id: string;
    name: string;
    logo?: string | null;
  };
  members: {
    hubMember: {
      role: string;
      hubId: string;
      user: {
        id: string;
        firstName: string;
        lastName: string;
        profilePicture?: string | null;
      };
    } | null;
  }[];
  _count: {
    members: number;
    tasks: number;
  };
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string; visibility?: string };
}) {
  const page = parseInt(searchParams.page || "1");
  const search = searchParams.search || "";
  const visibility = searchParams.visibility as Visibility | undefined;
  const limit = 12;
  const skip = (page - 1) * limit;

  const where = {
    deletedAt: null,
    publishStatus: PublishStatus.PUBLISHED,
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
      ],
    }),
    ...(visibility && { visibility }),
  };

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
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
            hubMember: {
              select: {
                role: true,
                hubId: true,
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
          },
        },
        _count: {
          select: {
            members: true,
            tasks: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.project.count({ where }),
  ]);

  return (
    <Suspense fallback={<Skeleton variant="rectangular" height={400} />}>
      <ProjectsClient
        projects={projects}
        pagination={{
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        }}
        searchParams={{ search, visibility: visibility ?? "" }}
      />
    </Suspense>
  );
}
