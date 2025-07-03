// src/app/api/hub-leader/events/[eventId]/route.ts
// src/app/api/hub-leader/events/[eventId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  const session = await getServerSession(authOptions);
  const { eventId } = params;

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized", redirect: "/auth/signin" },
      { status: 401 }
    );
  }

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        hub: {
          select: { id: true },
        },
        media: {
          select: { url: true, type: true },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check if user is a hub leader for the event's hub or an admin
    const isHubLeader = await prisma.hubMember.findFirst({
      where: {
        userId: session.user.id,
        hubId: event.hub.id,
        role: "HUB_LEADER",
        isActive: true,
        deletedAt: null,
      },
    });

    if (!isHubLeader && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(event, { status: 200 });
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  const session = await getServerSession(authOptions);
  const { eventId } = params;

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized", redirect: "/auth/signin" },
      { status: 401 }
    );
  }

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        hub: {
          select: { id: true },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check if user is a hub leader for the event's hub or an admin
    const isHubLeader = await prisma.hubMember.findFirst({
      where: {
        userId: session.user.id,
        hubId: event.hub.id,
        role: "HUB_LEADER",
        isActive: true,
        deletedAt: null,
      },
    });

    if (!isHubLeader && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      description,
      coverImage,
      eventType,
      startDate,
      endDate,
      isOnline,
      venue,
      venueAddress,
      meetingLink,
      capacity,
      visibility,
      requirements,
      tags,
      speakers,
      agenda,
      hubId,
    } = body;

    // Basic validation
    if (!title || !description || !eventType || !startDate || !visibility) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        title,
        description,
        coverImage: coverImage || null,
        eventType,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        isOnline,
        venue: venue || null,
        venueAddress: venueAddress || null,
        meetingLink: meetingLink || null,
        capacity: capacity ? parseInt(capacity) : null,
        visibility,
        requirements: requirements || [],
        tags: tags || [],
        speakers: speakers || [],
        agenda: agenda || [],
        hubId,
        updatedAt: new Date(),
      },
      include: {
        media: {
          select: { url: true, type: true },
        },
      },
    });

    return NextResponse.json(updatedEvent, { status: 200 });
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
