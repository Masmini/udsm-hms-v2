//src/app/admin/users/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminUsersClient from "./admin-users-client";
import { Role } from "@prisma/client"; // Import Role enum from Prisma

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string; role?: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/auth/signin");
  }

  const page = parseInt(searchParams.page || "1");
  const search = searchParams.search || "";
  const role = searchParams.role as Role | undefined; // Type as Role or undefined
  const limit = 20;
  const skip = (page - 1) * limit;

  const where = {
    deletedAt: null,
    ...(search && {
      OR: [
        { firstName: { contains: search, mode: "insensitive" as const } },
        { lastName: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } },
      ],
    }),
    ...(role && { role }), // Safe since role is typed as Role | undefined
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        profilePicture: true,
        degreeProgramme: true,
        skills: true,
        isGoogleUser: true,
        createdAt: true,
        _count: {
          select: {
            hubs: true,
            programmes: true,
            eventRegistrations: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  return (
    <AdminUsersClient
      users={users}
      pagination={{
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }}
      searchParams={{ search, role: role || "" }}
    />
  );
}
