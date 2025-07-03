import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { programmeId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { programmeId } = params;
    const { userId, message } = await request.json();

    // Verify the user is applying for themselves or is admin
    if (userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Can only apply for yourself" },
        { status: 403 }
      );
    }

    // Check if programme exists
    const programme = await prisma.programme.findUnique({
      where: {
        id: programmeId,
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
        _count: {
          select: {
            members: {
              where: {
                status: "ACTIVE",
              },
            },
          },
        },
      },
    });

    if (!programme) {
      return NextResponse.json(
        { success: false, error: "Programme not found" },
        { status: 404 }
      );
    }

    // Check if programme has capacity and is full
    if (
      programme.maxParticipants &&
      programme._count.members >= programme.maxParticipants
    ) {
      return NextResponse.json(
        { success: false, error: "Programme is full" },
        { status: 400 }
      );
    }

    // Check if application deadline has passed
    if (
      programme.applicationDeadline &&
      new Date() > programme.applicationDeadline
    ) {
      return NextResponse.json(
        { success: false, error: "Application deadline has passed" },
        { status: 400 }
      );
    }

    // Check if already a member
    const existingMember = await prisma.programmeMember.findFirst({
      where: {
        programmeId,
        userId,
        status: "ACTIVE",
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { success: false, error: "Already enrolled in this programme" },
        { status: 400 }
      );
    }

    // Check if there's already a pending request
    const existingRequest = await prisma.programmeJoinRequest.findFirst({
      where: {
        programmeId,
        userId,
        status: "PENDING",
        deletedAt: null,
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        { success: false, error: "Application already pending" },
        { status: 400 }
      );
    }

    // Create join request
    const joinRequest = await prisma.programmeJoinRequest.create({
      data: {
        programmeId,
        hubId: programme.hubId,
        userId,
        message: message || "I would like to join this programme",
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
        programme: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Create notification for programme supervisors
    const supervisors = await prisma.programme.findUnique({
      where: { id: programmeId },
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
        title: "New Programme Application",
        message: `${joinRequest.user.firstName} ${joinRequest.user.lastName} applied for "${programme.title}"`,
        type: "SYSTEM" as const,
        priority: "MEDIUM" as const,
        actionUrl: `/dashboard/${supervisor.id}/programmes/${programmeId}/applications`,
        metadata: {
          requestId: joinRequest.id,
          programmeId,
          applicantId: userId,
        },
      }));

      await prisma.notification.createMany({
        data: notifications,
      });
    }

    return NextResponse.json({
      success: true,
      data: joinRequest,
      message: "Application submitted successfully",
    });
  } catch (error) {
    console.error("Error creating programme application:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit application" },
      { status: 500 }
    );
  }
}
