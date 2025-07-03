import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProjectDetailClient from "./project-detail-client";

export default async function ProjectDetailPage({
  params,
}: {
  params: { userId: string; projectId: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  if (session.user.id !== params.userId) {
    redirect("/auth/signin");
  }

  // Verify user is a member of this project
  const projectMembership = await prisma.projectMember.findFirst({
    where: {
      userId: params.userId,
      projectId: params.projectId,
      deletedAt: null,
    },
  });

  if (!projectMembership) {
    redirect(`/dashboard/${params.userId}/my-projects`);
  }

  // Fetch detailed project information
  const project = await prisma.project.findUnique({
    where: { id: params.projectId },
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
              skills: true,
              bio: true,
            },
          },
        },
      },
      tasks: {
        where: {
          assigneeId: params.userId,
          deletedAt: null,
        },
        orderBy: {
          dueDate: "asc",
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
      },
      announcements: {
        where: {
          deletedAt: null,
        },
        include: {
          creator: {
            select: {
              firstName: true,
              lastName: true,
              profilePicture: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      },
      projectFiles: {
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
          tasks: true,
          members: true,
          progressReports: true,
        },
      },
    },
  });

  if (!project) {
    redirect(`/dashboard/${params.userId}/my-projects`);
  }

  return (
    <ProjectDetailClient
      project={project}
      userMembership={projectMembership}
      userId={params.userId}
    />
  );
}
