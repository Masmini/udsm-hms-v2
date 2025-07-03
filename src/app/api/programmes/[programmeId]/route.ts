import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { programmeId: string } }
) {
  try {
    const { programmeId } = params;

    const programme = await prisma.programme.findUnique({
      where: {
        id: programmeId,
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
        members: {
          where: {
            status: "ACTIVE",
          },
          include: {
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
        supervisors: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
          },
        },
        programmeJoinRequests: {
          where: {
            status: "PENDING",
            deletedAt: null,
          },
          include: {
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

    return NextResponse.json({
      success: true,
      data: programme,
    });
  } catch (error) {
    console.error("Error fetching programme:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch programme" },
      { status: 500 }
    );
  }
}
