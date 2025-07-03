import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { eventId } = params;
    const { userId } = await request.json();

    // Verify the user is registering for themselves or is admin
    if (userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Can only register for yourself" },
        { status: 403 }
      );
    }

    // Check if event exists and is active
    const event = await prisma.event.findUnique({
      where: {
        id: eventId,
        deletedAt: null,
        publishStatus: "PUBLISHED",
      },
      include: {
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
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    // Check if event has capacity and is full
    if (event.capacity && event._count.registrations >= event.capacity) {
      return NextResponse.json(
        { success: false, error: "Event is full" },
        { status: 400 }
      );
    }

    // Check if already registered
    const existingRegistration = await prisma.eventRegistration.findFirst({
      where: {
        eventId,
        userId,
        deletedAt: null,
      },
    });

    if (existingRegistration) {
      return NextResponse.json(
        { success: false, error: "Already registered for this event" },
        { status: 400 }
      );
    }

    // Create registration
    const registration = await prisma.eventRegistration.create({
      data: {
        eventId,
        userId,
        status: "APPROVED", // Auto-approve for now
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePicture: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            venue: true,
          },
        },
      },
    });

    // Create notification for user
    await prisma.notification.create({
      data: {
        userId,
        title: "Event Registration Confirmed",
        message: `You have successfully registered for "${event.title}"`,
        type: "EVENT_REMINDER",
        priority: "MEDIUM",
        actionUrl: `/events/${eventId}`,
        metadata: {
          eventId,
          registrationId: registration.id,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: registration,
      message: "Successfully registered for event",
    });
  } catch (error) {
    console.error("Error registering for event:", error);
    return NextResponse.json(
      { success: false, error: "Failed to register for event" },
      { status: 500 }
    );
  }
}
