import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action } = await request.json();
    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Get the membership request
    const request_data = await prisma.hubMembershipRequest.findUnique({
      where: { id: params.requestId },
      include: { hub: true },
    });

    if (!request_data) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Verify user is hub leader
    const hubMember = await prisma.hubMember.findFirst({
      where: {
        userId: session.user.id,
        hubId: request_data.hubId,
        role: "HUB_LEADER",
        isActive: true,
        deletedAt: null,
      },
    });

    if (!hubMember) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update the request
    const updatedRequest = await prisma.hubMembershipRequest.update({
      where: { id: params.requestId },
      data: {
        status: action === "approve" ? "APPROVED" : "REJECTED",
        respondedBy: session.user.id,
        respondedAt: new Date(),
      },
    });

    // If approved, create hub membership
    if (action === "approve") {
      await prisma.hubMember.create({
        data: {
          userId: request_data.userId,
          hubId: request_data.hubId,
          role: "MEMBER",
        },
      });

      // Create notification
      await prisma.notification.create({
        data: {
          userId: request_data.userId,
          title: "Hub Membership Approved",
          message: `Your request to join ${request_data.hub.name} has been approved!`,
          type: "HUB_INVITATION",
          priority: "MEDIUM",
          actionUrl: `/dashboard/${request_data.userId}/my-hubs/${request_data.hubId}/hub-member`,
        },
      });
    }

    return NextResponse.json({ success: true, request: updatedRequest });
  } catch (error) {
    console.error("Error updating membership request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
