import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  coverImage: z.string().optional(),
  eventType: z.string().min(1, "Event type is required"),
  startDate: z.string(),
  endDate: z.string().optional(),
  isOnline: z.boolean().default(false),
  venue: z.string().optional(),
  venueAddress: z.string().optional(),
  meetingLink: z.string().optional(),
  capacity: z.number().optional(),
  visibility: z
    .enum(["PUBLIC", "AUTHENTICATED", "HUB_MEMBERS"])
    .default("HUB_MEMBERS"),
  requirements: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  speakers: z
    .array(
      z.object({
        name: z.string(),
        title: z.string(),
        bio: z.string(),
        image: z.string(),
      })
    )
    .default([]),
  agenda: z
    .array(
      z.object({
        time: z.string(),
        title: z.string(),
        description: z.string(),
        speaker: z.string(),
      })
    )
    .default([]),
  hubId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createEventSchema.parse(body);

    // Verify user is hub leader
    const hubMember = await prisma.hubMember.findFirst({
      where: {
        userId: session.user.id,
        hubId: validatedData.hubId,
        role: "HUB_LEADER",
        isActive: true,
        deletedAt: null,
      },
    });

    if (!hubMember) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Create event
    const event = await prisma.event.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        coverImage: validatedData.coverImage,
        eventType: validatedData.eventType,
        startDate: new Date(validatedData.startDate),
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
        isOnline: validatedData.isOnline,
        venue: validatedData.venue,
        venueAddress: validatedData.venueAddress,
        meetingLink: validatedData.meetingLink,
        capacity: validatedData.capacity,
        visibility: validatedData.visibility,
        requirements: validatedData.requirements,
        tags: validatedData.tags,
        speakers: validatedData.speakers,
        agenda: validatedData.agenda,
        hubId: validatedData.hubId,
        createdBy: session.user.id,
        publishStatus: "PUBLISHED",
      },
    });

    return NextResponse.json({ success: true, event }, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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

    const events = await prisma.event.findMany({
      where: {
        hubId: hubId,
        deletedAt: null,
      },
      include: {
        registrations: {
          where: { status: "PENDING" },
          include: {
            user: true,
          },
        },
        attendanceBadges: true,
        eventFeedbacks: true,
      },
      orderBy: {
        startDate: "desc",
      },
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
