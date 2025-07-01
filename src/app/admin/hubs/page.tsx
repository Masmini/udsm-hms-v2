//src/app/admin/hubs/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminHubsClient from "./admin-hubs-client";
import { Prisma } from "@prisma/client";

// Define the type for Hub with relations using Prisma's GetPayload
type HubWithRelations = Prisma.HubGetPayload<{
  include: {
    categories: true;
    _count: {
      select: {
        members: true;
        projects: true;
        programmes: true;
        events: true;
      };
    };
  };
}>;

export default async function AdminHubsPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/auth/signin");
  }

  const page = parseInt(searchParams.page || "1");
  const search = searchParams.search || "";
  const limit = 20;
  const skip = (page - 1) * limit;

  const where = {
    deletedAt: null,
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [hubs, total] = await Promise.all([
    prisma.hub.findMany({
      where,
      skip,
      take: limit,
      include: {
        categories: true,
        _count: {
          select: {
            members: true,
            projects: true,
            programmes: true,
            events: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }) as Promise<HubWithRelations[]>,
    prisma.hub.count({ where }),
  ]);

  return (
    <AdminHubsClient
      hubs={hubs.map((hub: HubWithRelations) => ({
        ...hub,
        logo: hub.logo === null ? undefined : hub.logo,
        coverImage: hub.coverImage === null ? undefined : hub.coverImage,
        cardBio: hub.cardBio === null ? undefined : hub.cardBio,
        createdAt:
          hub.createdAt instanceof Date
            ? hub.createdAt.toISOString()
            : hub.createdAt,
        updatedAt:
          hub.updatedAt instanceof Date
            ? hub.updatedAt.toISOString()
            : hub.updatedAt,
      }))}
      pagination={{
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }}
      searchParams={{ search }}
    />
  );
}
