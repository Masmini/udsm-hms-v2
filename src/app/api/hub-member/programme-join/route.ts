//src/app/api/hub-member/programme-join/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const joinProgrammeSchema = z.object({
  programmeId: z.string(),
  hubId: z.string(),
  message: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = joinProgrammeSchema.parse(body);

    // Verify user is a member of the hub
    const hubMember = await prisma.hubMember.findFirst({
      where: {
        userId: session.user.id,
        hubId: validatedData.hubId,
        isActive: true,
        deletedAt: null,
      },
    });

    if (!hubMember) {
      return NextResponse.json(
        { error: "You must be a hub member to join programmes" },
        { status: 403 }
      );
    }

    // Check if programme exists and belongs to the hub
    const programme = await prisma.programme.findFirst({
      where: {
        id: validatedData.programmeId,
        hubId: validatedData.hubId,
        deletedAt: null,
      },
    });

    if (!programme) {
      return NextResponse.json(
        { error: "Programme not found" },
        { status: 404 }
      );
    }

    // Check if user is already a member or has pending request
    const existingMembership = await prisma.programmeMember.findFirst({
      where: {
        userId: session.user.id,
        programmeId: validatedData.programmeId,
      },
    });

    const existingRequest = await prisma.programmeJoinRequest.findFirst({
      where: {
        userId: session.user.id,
        programmeId: validatedData.programmeId,
        status: "PENDING",
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: "You are already a member of this programme" },
        { status: 400 }
      );
    }

    if (existingRequest) {
      return NextResponse.json(
        { error: "You already have a pending request for this programme" },
        { status: 400 }
      );
    }

    // Check capacity if set
    if (programme.maxParticipants) {
      const memberCount = await prisma.programmeMember.count({
        where: {
          programmeId: validatedData.programmeId,
          status: "ACTIVE",
        },
      });

      if (memberCount >= programme.maxParticipants) {
        return NextResponse.json(
          { error: "Programme is at full capacity" },
          { status: 400 }
        );
      }
    }

    // Create join request
    const joinRequest = await prisma.programmeJoinRequest.create({
      data: {
        userId: session.user.id,
        programmeId: validatedData.programmeId,
        hubId: validatedData.hubId,
        message: validatedData.message,
      },
    });

    return NextResponse.json(
      { success: true, request: joinRequest },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating programme join request:", error);
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
