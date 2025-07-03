import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MyProgrammesClient from "./my-programmes-client";

export default async function MyProgrammesPage({
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

  // Fetch user's programme memberships
  const programmeMemberships = await prisma.programmeMember.findMany({
    where: {
      userId: params.userId,
      deletedAt: null,
    },
    include: {
      programme: {
        include: {
          hub: {
            select: {
              id: true,
              name: true,
              logo: true,
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
      },
    },
    orderBy: {
      joinedAt: "desc",
    },
  });

  return (
    <MyProgrammesClient
      programmeMemberships={programmeMemberships}
      userId={params.userId}
    />
  );
}
