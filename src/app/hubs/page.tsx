//src/app/hubs/page.tsx
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import HubsClient from "./hubs-client";
import { Skeleton } from "@mui/material";

export default async function HubsPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string; category?: string };
}) {
  const page = parseInt(searchParams.page || "1");
  const search = searchParams.search || "";
  const category = searchParams.category || "";
  const limit = 12;
  const skip = (page - 1) * limit;

  const where = {
    deletedAt: null,
    isActive: true,
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
        { cardBio: { contains: search, mode: "insensitive" as const } },
      ],
    }),
    ...(category && {
      categories: {
        some: {
          name: { contains: category, mode: "insensitive" as const },
        },
      },
    }),
  };

  const [hubs, total, categories] = await Promise.all([
    prisma.hub.findMany({
      where,
      skip,
      take: limit,
      include: {
        categories: {
          select: {
            name: true,
            color: true,
          },
        },
        _count: {
          select: {
            members: {
              where: {
                isActive: true,
                deletedAt: null,
              },
            },
            projects: {
              where: {
                deletedAt: null,
                publishStatus: "PUBLISHED",
              },
            },
            programmes: {
              where: {
                deletedAt: null,
                publishStatus: "PUBLISHED",
              },
            },
            events: {
              where: {
                deletedAt: null,
                publishStatus: "PUBLISHED",
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.hub.count({ where }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <Suspense fallback={<Skeleton variant="rectangular" height={400} />}>
      <HubsClient
        hubs={hubs.map((hub) => ({
          ...hub,
          categories: hub.categories.map((cat) => ({
            ...cat,
            color: cat.color === null ? undefined : cat.color,
          })),
        }))}
        categories={categories}
        pagination={{
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        }}
        searchParams={{ search, category }}
      />
    </Suspense>
  );
}
