import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { projectId } = params;
    const { userId, message } = await request.json();

    // Verify the user is requesting for themselves or is admin
    if (userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Can only request to join for yourself" },
        { status: 403 }
      );
    }

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
        deletedAt: null,
        publishStatus: "PUBLISHED",
      },
      include: {
        hub: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    // Check if already a member
    const existingMember = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId,
        deletedAt: null,
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { success: false, error: "Already a member of this project" },
        { status: 400 }
      );
    }

    // Check if there's already a pending request
    const existingRequest = await prisma.projectJoinRequest.findFirst({
      where: {
        projectId,
        userId,
        status: "PENDING",
        deletedAt: null,
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        { success: false, error: "Join request already pending" },
        { status: 400 }
      );
    }

    // Create join request
    const joinRequest = await prisma.projectJoinRequest.create({
      data: {
        projectId,
        hubId: project.hubId,
        userId,
        message: message || "I would like to join this project",
        status: "PENDING",
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePicture: true,
          },
        },
        project: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Create notification for project supervisors
    const supervisors = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        supervisors: {
          select: {
            id: true,
          },
        },
      },
    });

    if (supervisors?.supervisors.length) {
      const notifications = supervisors.supervisors.map((supervisor) => ({
        userId: supervisor.id,
        title: "New Project Join Request",
        message: `${joinRequest.user.firstName} ${joinRequest.user.lastName} wants to join "${project.title}"`,
        type: "PROJECT_UPDATE" as const,
        priority: "MEDIUM" as const,
        actionUrl: `/dashboard/${supervisor.id}/projects/${projectId}/requests`,
        metadata: {
          requestId: joinRequest.id,
          projectId,
          requesterId: userId,
        },
      }));

      await prisma.notification.createMany({
        data: notifications,
      });
    }

    return NextResponse.json({
      success: true,
      data: joinRequest,
      message: "Join request sent successfully",
    });
  } catch (error) {
    console.error("Error creating project join request:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send join request" },
      { status: 500 }
    );
  }
}
