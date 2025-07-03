import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { hubId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { hubId } = params;
    const { userId, message } = await request.json();

    // Verify the user is requesting for themselves or is admin
    if (userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Can only request membership for yourself" },
        { status: 403 }
      );
    }

    // Check if hub exists
    const hub = await prisma.hub.findUnique({
      where: { id: hubId, isActive: true, deletedAt: null },
    });

    if (!hub) {
      return NextResponse.json(
        { success: false, error: "Hub not found" },
        { status: 404 }
      );
    }

    // Check if already a member
    const existingMember = await prisma.hubMember.findFirst({
      where: {
        hubId,
        userId,
        isActive: true,
        deletedAt: null,
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { success: false, error: "Already a member of this hub" },
        { status: 400 }
      );
    }

    // Check if there's already a pending request
    const existingRequest = await prisma.hubMembershipRequest.findFirst({
      where: {
        hubId,
        userId,
        status: "PENDING",
        deletedAt: null,
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        { success: false, error: "Membership request already pending" },
        { status: 400 }
      );
    }

    // Create membership request
    const membershipRequest = await prisma.hubMembershipRequest.create({
      data: {
        hubId,
        userId,
        message: message || "I would like to join this hub",
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
        hub: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
    });

    // Create notification for hub leaders
    const hubLeaders = await prisma.hubMember.findMany({
      where: {
        hubId,
        role: "HUB_LEADER",
        isActive: true,
        deletedAt: null,
      },
      select: {
        userId: true,
      },
    });

    // Create notifications for all hub leaders
    const notifications = hubLeaders.map((leader) => ({
      userId: leader.userId,
      title: "New Hub Membership Request",
      message: `${membershipRequest.user.firstName} ${membershipRequest.user.lastName} wants to join ${hub.name}`,
      type: "HUB_INVITATION" as const,
      priority: "MEDIUM" as const,
      actionUrl: `/dashboard/${leader.userId}/my-hubs/${hubId}/hub-leader/requests`,
      metadata: {
        requestId: membershipRequest.id,
        hubId,
        requesterId: userId,
      },
    }));

    if (notifications.length > 0) {
      await prisma.notification.createMany({
        data: notifications,
      });
    }

    return NextResponse.json({
      success: true,
      data: membershipRequest,
      message: "Membership request sent successfully",
    });
  } catch (error) {
    console.error("Error creating membership request:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send membership request" },
      { status: 500 }
    );
  }
}
