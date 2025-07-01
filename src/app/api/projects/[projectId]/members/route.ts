//src/app/api/projects/[projectId]/members/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const addMemberSchema = z.object({
  userId: z.string().uuid(),
  role: z.string().default("MEMBER"),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { userId, role } = addMemberSchema.parse(body);

    // Check if user is a hub leader, supervisor, or admin
    const project = await prisma.project.findUnique({
      where: { id: params.projectId },
      select: { hubId: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const hubMember = await prisma.hubMember.findFirst({
      where: {
        userId: session.user.id,
        hubId: project.hubId,
        role: { in: ["HUB_LEADER", "SUPERVISOR"] },
        deletedAt: null,
      },
    });

    if (!hubMember && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify the target user is a hub member
    const targetHubMember = await prisma.hubMember.findFirst({
      where: {
        userId,
        hubId: project.hubId,
        role: { in: ["MEMBER", "HUB_LEADER", "SUPERVISOR"] },
        deletedAt: null,
      },
    });

    if (!targetHubMember) {
      return NextResponse.json(
        { error: "User is not a member of the project’s hub" },
        { status: 403 }
      );
    }

    // Check if user is already a project member
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: { userId, projectId: params.projectId },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "User is already a project member" },
        { status: 400 }
      );
    }

    const projectMember = await prisma.projectMember.create({
      data: {
        userId,
        projectId: params.projectId,
        hubMemberId: targetHubMember.id,
        role,
      },
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
    });

    return NextResponse.json(projectMember, { status: 201 });
  } catch (error) {
    console.error("Error adding project member:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
