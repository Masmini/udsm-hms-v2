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
    const limit = parseInt(searchParams.get("limit") || "24");
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const skill = searchParams.get("skill") || "";

    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {
      hubId,
      isActive: true,
      deletedAt: null,
      user: {
        deletedAt: null,
        isActive: true,
      },
    };

    if (role) {
      whereClause.role = role;
    }

    if (search || skill) {
      whereClause.user = {
        ...whereClause.user,
        OR: [],
      };

      if (search) {
        whereClause.user.OR.push(
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } }
        );
      }

      if (skill) {
        whereClause.user.OR.push({
          skills: { has: skill },
        });
      }
    }

    const [members, total] = await Promise.all([
      prisma.hubMember.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profilePicture: true,
              degreeProgramme: true,
              skills: true,
              bio: true,
              githubProfile: true,
              linkedinProfile: true,
              phoneNumber: true,
              createdAt: true,
            },
          },
        },
        orderBy: [
          { role: "asc" }, // HUB_LEADER first, then SUPERVISOR, then MEMBER
          { joinedAt: "desc" },
        ],
        skip,
        take: limit,
      }),
      prisma.hubMember.count({
        where: whereClause,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: members,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching hub members:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch hub members" },
      { status: 500 }
    );
  }
}
