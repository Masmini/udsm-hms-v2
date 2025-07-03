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
    const certificationType = searchParams.get("certificationType") || "";
    const upcoming = searchParams.get("upcoming") === "true";

    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {
      hubId,
      deletedAt: null,
      publishStatus: "PUBLISHED",
    };

    if (certificationType) {
      whereClause.certificationType = certificationType;
    }

    if (upcoming) {
      whereClause.startDate = {
        gte: new Date(),
      };
    }

    const [programmes, total] = await Promise.all([
      prisma.programme.findMany({
        where: whereClause,
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
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.programme.count({
        where: whereClause,
      }),
    ]);

    // Add mock counts for comments (these would come from Firebase)
    const programmesWithCounts = programmes.map((programme) => ({
      ...programme,
      commentsCount: Math.floor(Math.random() * 10), // Mock data
    }));

    return NextResponse.json({
      success: true,
      data: programmesWithCounts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching hub programmes:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch hub programmes" },
      { status: 500 }
    );
  }
}
