import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const hubId = url.searchParams.get("hubId");

    if (!hubId) {
      return NextResponse.json({ error: "Hub ID required" }, { status: 400 });
    }

    // Verify user is hub leader
    const hubMember = await prisma.hubMember.findFirst({
      where: {
        userId: session.user.id,
        hubId: hubId,
        role: "HUB_LEADER",
        isActive: true,
        deletedAt: null,
      },
    });

    if (!hubMember) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get project suggestions for projects in this hub
    const suggestions = await prisma.projectSuggestion.findMany({
      where: {
        project: {
          hubId: hubId,
        },
        deletedAt: null,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Error fetching project suggestions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
