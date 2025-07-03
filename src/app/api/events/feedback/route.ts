import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const feedbackSchema = z.object({
  eventId: z.string(),
  rating: z.number().min(1).max(5),
  content: z.string().optional(),
  suggestions: z.string().optional(),
  wouldRecommend: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = feedbackSchema.parse(body);

    // Check if user attended the event
    const registration = await prisma.eventRegistration.findFirst({
      where: {
        userId: session.user.id,
        eventId: validatedData.eventId,
        status: "APPROVED",
        attended: true,
      },
    });

    if (!registration) {
      return NextResponse.json(
        { error: "You must have attended this event to provide feedback" },
        { status: 403 }
      );
    }

    // Check if feedback already exists
    const existingFeedback = await prisma.eventFeedback.findFirst({
      where: {
        userId: session.user.id,
        eventId: validatedData.eventId,
      },
    });

    if (existingFeedback) {
      return NextResponse.json(
        { error: "You have already provided feedback for this event" },
        { status: 400 }
      );
    }

    // Create feedback
    const feedback = await prisma.eventFeedback.create({
      data: {
        userId: session.user.id,
        eventId: validatedData.eventId,
        rating: validatedData.rating,
        content: validatedData.content,
        suggestions: validatedData.suggestions,
        wouldRecommend: validatedData.wouldRecommend,
      },
    });

    return NextResponse.json({ success: true, feedback }, { status: 201 });
  } catch (error) {
    console.error("Error creating event feedback:", error);
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
