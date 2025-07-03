import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import ProjectDetailClient from "./project-detail-client";
import { redirect } from "next/navigation";

export default async function ProjectDetailPage({
  params,
}: {
  params: { projectId: string };
}) {
  const session = await getServerSession();

  // Fetch project with comprehensive details
  const project = await prisma.project.findUnique({
    where: {
      id: params.projectId,
      deletedAt: null,
      publishStatus: "PUBLISHED",
    },
    include: {
      hub: {
        select: {
          id: true,
          name: true,
          logo: true,
          description: true,
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
          hubMember: {
            select: {
              role: true,
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
          bio: true,
        },
      },
      tasks: {
        where: {
          deletedAt: null,
        },
        include: {
          assignee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePicture: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
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
      media: {
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
          members: true,
          tasks: true,
        },
      },
    },
  });

  if (!project) {
    redirect("/projects");
  }

  // Check visibility permissions
  const canView = await checkProjectVisibility(project, session?.user?.id);
  if (!canView) {
    redirect("/projects");
  }

  // Check if user can join (must be hub member)
  let canJoin = false;
  let isHubMember = false;
  let existingMembership = null;
  let existingJoinRequest = null;

  if (session?.user?.id) {
    // Check if user is already a project member
    existingMembership = await prisma.projectMember.findFirst({
      where: {
        userId: session.user.id,
        projectId: project.id,
        deletedAt: null,
      },
    });

    // Check if user is a hub member
    const hubMembership = await prisma.hubMember.findFirst({
      where: {
        userId: session.user.id,
        hubId: project.hubId,
        isActive: true,
        deletedAt: null,
      },
    });

    isHubMember = !!hubMembership;

    // Check for existing join request
    if (!existingMembership && isHubMember) {
      existingJoinRequest = await prisma.projectJoinRequest.findFirst({
        where: {
          userId: session.user.id,
          projectId: project.id,
          status: "PENDING",
        },
      });

      canJoin = !existingJoinRequest;
    }
  }

  return (
    <ProjectDetailClient
      project={project}
      userId={session?.user?.id}
      canJoin={canJoin}
      isHubMember={isHubMember}
      existingMembership={existingMembership}
      existingJoinRequest={existingJoinRequest}
    />
  );
}

async function checkProjectVisibility(project: any, userId?: string) {
  switch (project.visibility) {
    case "PUBLIC":
      return true;
    case "AUTHENTICATED":
      return !!userId;
    case "HUB_MEMBERS":
      if (!userId) return false;
      const hubMember = await prisma.hubMember.findFirst({
        where: {
          userId,
          hubId: project.hubId,
          isActive: true,
          deletedAt: null,
        },
      });
      return !!hubMember;
    case "PROGRAMME_MEMBERS":
      // Additional logic for programme members if needed
      return !!userId;
    default:
      return false;
  }
}
