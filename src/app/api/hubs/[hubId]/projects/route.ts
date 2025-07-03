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
    const status = searchParams.get("status") || "";
    const priority = searchParams.get("priority") || "";

    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {
      hubId,
      deletedAt: null,
      publishStatus: "PUBLISHED",
    };

    if (status) {
      whereClause.status = status;
    }

    if (priority) {
      whereClause.priority = priority;
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
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
          supervisors: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePicture: true,
            },
          },
          tasks: {
            where: {
              deletedAt: null,
            },
            include: {
              assignee: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          _count: {
            select: {
              members: {
                where: {
                  deletedAt: null,
                },
              },
              tasks: {
                where: {
                  deletedAt: null,
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
      prisma.project.count({
        where: whereClause,
      }),
    ]);

    // Add mock counts for comments (these would come from Firebase)
    const projectsWithCounts = projects.map((project) => ({
      ...project,
      commentsCount: Math.floor(Math.random() * 15), // Mock data
    }));

    return NextResponse.json({
      success: true,
      data: projectsWithCounts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching hub projects:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch hub projects" },
      { status: 500 }
    );
  }
}
