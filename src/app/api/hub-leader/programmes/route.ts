import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createProgrammeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  coverImage: z.string().optional(),
  duration: z.string().optional(),
  certificationType: z.string().optional(),
  maxParticipants: z.number().optional(),
  applicationDeadline: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  prerequisites: z.array(z.string()).default([]),
  learningOutcomes: z.array(z.string()).default([]),
  curriculum: z
    .array(
      z.object({
        module: z.string(),
        description: z.string(),
        duration: z.string(),
        topics: z.array(z.string()),
      })
    )
    .default([]),
  supervisors: z.array(z.string()).default([]),
  hubId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createProgrammeSchema.parse(body);

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

    // Create programme
    const programme = await prisma.programme.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        coverImage: validatedData.coverImage,
        duration: validatedData.duration,
        certificationType: validatedData.certificationType,
        maxParticipants: validatedData.maxParticipants,
        applicationDeadline: validatedData.applicationDeadline
          ? new Date(validatedData.applicationDeadline)
          : null,
        startDate: validatedData.startDate
          ? new Date(validatedData.startDate)
          : null,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
        prerequisites: validatedData.prerequisites,
        learningOutcomes: validatedData.learningOutcomes,
        curriculum: validatedData.curriculum,
        hubId: validatedData.hubId,
        publishStatus: "PUBLISHED",
      },
    });

    // Add supervisors
    if (validatedData.supervisors.length > 0) {
      await prisma.programme.update({
        where: { id: programme.id },
        data: {
          supervisors: {
            connect: validatedData.supervisors.map((id) => ({ id })),
          },
        },
      });
    }

    return NextResponse.json({ success: true, programme }, { status: 201 });
  } catch (error) {
    console.error("Error creating programme:", error);
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

    const programmes = await prisma.programme.findMany({
      where: {
        hubId: hubId,
        deletedAt: null,
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        supervisors: true,
        programmeJoinRequests: {
          where: { status: "PENDING" },
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ programmes });
  } catch (error) {
    console.error("Error fetching programmes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
