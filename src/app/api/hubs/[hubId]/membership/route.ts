import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
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
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || session.user.id;

    const membership = await prisma.hubMember.findFirst({
      where: {
        hubId,
        userId,
        isActive: true,
        deletedAt: null,
      },
      include: {
        hub: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: membership,
    });
  } catch (error) {
    console.error("Error fetching membership:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch membership" },
      { status: 500 }
    );
  }
}
