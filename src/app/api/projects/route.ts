//src/app/api/projects/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { PublishStatus, Visibility } from "@prisma/client"; // Import enums

const createProjectSchema = z.object({
  title: z.string().min(3, "Project title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  objectives: z.string().min(10, "Objectives must be at least 10 characters"),
  coverImage: z.string().url().optional(),
  startDate: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  endDate: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  visibility: z.enum([
    "PUBLIC",
    "AUTHENTICATED",
    "HUB_MEMBERS",
    "PROGRAMME_MEMBERS",
  ]),
  skills: z.array(z.string()).optional(),
  hubId: z.string().uuid(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const hubId = searchParams.get("hubId");
    const visibility = searchParams.get("visibility") as Visibility | undefined; // Type as Visibility

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
      ...(visibility && { visibility }), // Safe due to type casting
    };

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
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
              hubMember: {
                select: {
                  role: true,
                  hubId: true,
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
            },
          },
          _count: {
            select: {
              members: true,
              tasks: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.project.count({ where }),
    ]);

    return NextResponse.json({
      projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
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
    const validatedData = createProjectSchema.parse(body);

    // Check if user is a hub leader, supervisor, or admin
    const hubMember = await prisma.hubMember.findFirst({
      where: {
        userId: session.user.id,
        hubId: validatedData.hubId,
        role: { in: ["HUB_LEADER", "SUPERVISOR"] },
        deletedAt: null,
      },
    });

    if (!hubMember && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const project = await prisma.project.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        objectives: validatedData.objectives,
        coverImage: validatedData.coverImage,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        visibility: validatedData.visibility,
        skills: validatedData.skills || [],
        hubId: validatedData.hubId,
        publishStatus: PublishStatus.DRAFT, // Use enum value
        members: {
          create: {
            userId: session.user.id,
            hubMemberId: hubMember?.id, // Handle null case
            role:
              hubMember?.role === "SUPERVISOR" ? "SUPERVISOR" : "HUB_LEADER",
          },
        },
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
          include: {
            hubMember: {
              select: {
                role: true,
                hubId: true,
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
          },
        },
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
