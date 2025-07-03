//src/app/api/hub-leader/projects/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createProjectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  objectives: z.string().optional(),
  hubId: z.string(),
  visibility: z
    .enum(["PUBLIC", "AUTHENTICATED", "HUB_MEMBERS"])
    .default("HUB_MEMBERS"),
  skills: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  budget: z.number().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createProjectSchema.parse(body);

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

    // Create project
    const project = await prisma.project.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        objectives: validatedData.objectives,
        hubId: validatedData.hubId,
        visibility: validatedData.visibility,
        skills: validatedData.skills,
        technologies: validatedData.technologies,
        startDate: validatedData.startDate
          ? new Date(validatedData.startDate)
          : null,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
        budget: validatedData.budget,
        priority: validatedData.priority,
        publishStatus: "PUBLISHED",
        status: "PLANNING",
      },
    });

    // Add creator as project member
    await prisma.projectMember.create({
      data: {
        userId: session.user.id,
        projectId: project.id,
        hubMemberId: hubMember.id,
        role: "LEAD",
      },
    });

    return NextResponse.json({ success: true, project }, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
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

    const projects = await prisma.project.findMany({
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
        tasks: true,
        projectJoinRequests: {
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

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
