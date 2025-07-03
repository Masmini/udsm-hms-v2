import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const joinProjectSchema = z.object({
  projectId: z.string(),
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
    const validatedData = joinProjectSchema.parse(body);

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
        { error: "You must be a hub member to join projects" },
        { status: 403 }
      );
    }

    // Check if project exists and belongs to the hub
    const project = await prisma.project.findFirst({
      where: {
        id: validatedData.projectId,
        hubId: validatedData.hubId,
        deletedAt: null,
        publishStatus: "PUBLISHED",
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check if user is already a member or has pending request
    const existingMembership = await prisma.projectMember.findFirst({
      where: {
        userId: session.user.id,
        projectId: validatedData.projectId,
        deletedAt: null,
      },
    });

    const existingRequest = await prisma.projectJoinRequest.findFirst({
      where: {
        userId: session.user.id,
        projectId: validatedData.projectId,
        status: "PENDING",
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: "You are already a member of this project" },
        { status: 400 }
      );
    }

    if (existingRequest) {
      return NextResponse.json(
        { error: "You already have a pending request for this project" },
        { status: 400 }
      );
    }

    // Create join request
    const joinRequest = await prisma.projectJoinRequest.create({
      data: {
        userId: session.user.id,
        projectId: validatedData.projectId,
        hubId: validatedData.hubId,
        message: validatedData.message,
      },
    });

    return NextResponse.json(
      { success: true, request: joinRequest },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating project join request:", error);
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
