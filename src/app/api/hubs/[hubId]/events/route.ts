import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { hubId: string } }
) {
  try {
    const { hubId } = params;
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const eventType = searchParams.get("eventType") || "";
    const upcoming = searchParams.get("upcoming") === "true";

    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {
      hubId,
      deletedAt: null,
      publishStatus: "PUBLISHED",
    };

    if (eventType) {
      whereClause.eventType = eventType;
    }

    if (upcoming) {
      whereClause.startDate = {
        gte: new Date(),
      };
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where: whereClause,
        include: {
          hub: {
            select: {
              id: true,
              name: true,
              logo: true,
            },
          },
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePicture: true,
            },
          },
          registrations: {
            where: {
              status: "APPROVED",
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
              registrations: {
                where: {
                  status: "APPROVED",
                  deletedAt: null,
                },
              },
            },
          },
        },
        orderBy: {
          startDate: "asc",
        },
        skip,
        take: limit,
      }),
      prisma.event.count({
        where: whereClause,
      }),
    ]);

    // Add mock counts for likes and comments (these would come from Firebase)
    const eventsWithCounts = events.map((event) => ({
      ...event,
      likesCount: Math.floor(Math.random() * 50), // Mock data
      commentsCount: Math.floor(Math.random() * 20), // Mock data
    }));

    return NextResponse.json({
      success: true,
      data: eventsWithCounts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching hub events:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch hub events" },
      { status: 500 }
    );
  }
}
