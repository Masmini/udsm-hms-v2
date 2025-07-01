//src/app/api/programmes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { PublishStatus } from "@prisma/client"; // Import PublishStatus enum

const createProgrammeSchema = z.object({
  title: z.string().min(3, "Programme title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  coverImage: z.string().url().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const hubId = searchParams.get("hubId");

    const skip = (page - 1) * limit;

    const where = {
      deletedAt: null,
      publishStatus: PublishStatus.PUBLISHED, // Use enum value
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
        ],
      }),
      ...(hubId && { hubId }),
    };

    const [programmes, total] = await Promise.all([
      prisma.programme.findMany({
        where,
        skip,
        take: limit,
        include: {
          hub: {
            select: {
              id: true,
              name: true,
              logo: true,
            },
          },
          members: {
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
          _count: {
            select: {
              members: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.programme.count({ where }),
    ]);

    return NextResponse.json({
      programmes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching programmes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createProgrammeSchema.parse(body);

    // Check if user is a hub leader or admin
    const hubMember = await prisma.hubMember.findFirst({
      where: {
        userId: session.user.id,
        hubId: body.hubId,
        role: { in: ["HUB_LEADER", "SUPERVISOR"] },
        deletedAt: null,
      },
    });

    if (!hubMember && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const programme = await prisma.programme.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        coverImage: validatedData.coverImage,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        hubId: body.hubId,
        publishStatus: PublishStatus.DRAFT, // Use enum value
      },
      include: {
        hub: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
    });

    return NextResponse.json(programme, { status: 201 });
  } catch (error) {
    console.error("Error creating programme:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
