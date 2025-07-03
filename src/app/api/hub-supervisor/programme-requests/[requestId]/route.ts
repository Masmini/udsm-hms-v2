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

    // Get the programme join request
    const request_data = await prisma.programmeJoinRequest.findUnique({
      where: { id: params.requestId },
      include: {
        programme: {
          include: {
            supervisors: true,
          },
        },
      },
    });

    if (!request_data) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Verify user is a supervisor for this programme
    const isSupervisor = request_data.programme.supervisors.some(
      (supervisor) => supervisor.id === session.user.id
    );

    if (!isSupervisor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update the request
    const updatedRequest = await prisma.programmeJoinRequest.update({
      where: { id: params.requestId },
      data: {
        status: action === "approve" ? "APPROVED" : "REJECTED",
        respondedBy: session.user.id,
        respondedAt: new Date(),
      },
    });

    // If approved, create programme membership
    if (action === "approve") {
      await prisma.programmeMember.create({
        data: {
          userId: request_data.userId,
          programmeId: request_data.programmeId,
          role: "MEMBER",
        },
      });

      // Create notification
      await prisma.notification.create({
        data: {
          userId: request_data.userId,
          title: "Programme Application Approved",
          message: `Your application to join ${request_data.programme.title} has been approved!`,
          type: "SYSTEM",
          priority: "MEDIUM",
          actionUrl: `/programmes/${request_data.programmeId}`,
        },
      });
    }

    return NextResponse.json({ success: true, request: updatedRequest });
  } catch (error) {
    console.error("Error updating programme request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
