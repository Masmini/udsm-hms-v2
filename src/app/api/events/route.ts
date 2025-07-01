//src/app/api/events/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { PublishStatus } from "@prisma/client"; // Import PublishStatus enum

const createEventSchema = z.object({
  title: z.string().min(3, "Event title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  eventType: z.string().min(1, "Event type is required"),
  startDate: z.date(),
  endDate: z.date().optional(),
  capacity: z.number().positive().optional(),
  visibility: z.enum(["PUBLIC", "AUTHENTICATED", "HUB_MEMBERS"]),
  coverImage: z.string().url().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const hubId = searchParams.get("hubId");
    const eventType = searchParams.get("eventType");
    const upcoming = searchParams.get("upcoming") === "true";

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
      ...(eventType && { eventType }),
      ...(upcoming && {
        startDate: {
          gte: new Date(),
        },
      }),
    };

    const [events, total] = await Promise.all([
      prisma.event.findMany({
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
          registrations: {
            where: { status: "APPROVED" },
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
              registrations: true,
            },
          },
        },
        orderBy: { startDate: "asc" },
      }),
      prisma.event.count({ where }),
    ]);

    return NextResponse.json({
      events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching events:", error);
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
    const validatedData = createEventSchema.parse(body);

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

    const event = await prisma.event.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        eventType: validatedData.eventType,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        capacity: validatedData.capacity,
        visibility: validatedData.visibility,
        coverImage: validatedData.coverImage,
        hubId: body.hubId,
        createdBy: session.user.id,
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

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
