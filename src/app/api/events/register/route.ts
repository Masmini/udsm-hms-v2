import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const registerEventSchema = z.object({
  eventId: z.string(),
  hubId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = registerEventSchema.parse(body);

    // Check if event exists and belongs to the hub
    const event = await prisma.event.findFirst({
      where: {
        id: validatedData.eventId,
        hubId: validatedData.hubId,
        deletedAt: null,
        publishStatus: "PUBLISHED",
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check if event is upcoming
    if (new Date(event.startDate) <= new Date()) {
      return NextResponse.json(
        { error: "Cannot register for past events" },
        { status: 400 }
      );
    }

    // Check if user is hub leader or supervisor
    const hubMembership = await prisma.hubMember.findFirst({
      where: {
        userId: session.user.id,
        hubId: validatedData.hubId,
        role: { in: ["HUB_LEADER", "SUPERVISOR"] },
        isActive: true,
        deletedAt: null,
      },
    });

    if (hubMembership) {
      return NextResponse.json(
        {
          error:
            "Hub leaders and supervisors cannot register for events they manage",
        },
        { status: 403 }
      );
    }

    // Check if user is already registered
    const existingRegistration = await prisma.eventRegistration.findFirst({
      where: {
        userId: session.user.id,
        eventId: validatedData.eventId,
        deletedAt: null,
      },
    });

    if (existingRegistration) {
      return NextResponse.json(
        { error: "You are already registered for this event" },
        { status: 400 }
      );
    }

    // Check capacity if set
    if (event.capacity) {
      const registrationCount = await prisma.eventRegistration.count({
        where: {
          eventId: validatedData.eventId,
          status: "APPROVED",
        },
      });

      if (registrationCount >= event.capacity) {
        return NextResponse.json(
          { error: "Event is at full capacity" },
          { status: 400 }
        );
      }
    }

    // Create event registration
    const registration = await prisma.eventRegistration.create({
      data: {
        userId: session.user.id,
        eventId: validatedData.eventId,
      },
    });

    return NextResponse.json({ success: true, registration }, { status: 201 });
  } catch (error) {
    console.error("Error creating event registration:", error);
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
