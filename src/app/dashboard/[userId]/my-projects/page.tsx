import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MyProjectsClient from "./my-projects-client";

export default async function MyProjectsPage({
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

  // Fetch user's project memberships
  const projectMemberships = await prisma.projectMember.findMany({
    where: {
      userId: params.userId,
      deletedAt: null,
    },
    include: {
      project: {
        include: {
          hub: {
            select: {
              id: true,
              name: true,
              logo: true,
            },
          },
          tasks: {
            where: {
              assigneeId: params.userId,
              deletedAt: null,
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
          progressReports: {
            where: {
              userId: params.userId,
              deletedAt: null,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 3,
          },
          _count: {
            select: {
              tasks: true,
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
    <MyProjectsClient
      projectMemberships={projectMemberships}
      userId={params.userId}
    />
  );
}
