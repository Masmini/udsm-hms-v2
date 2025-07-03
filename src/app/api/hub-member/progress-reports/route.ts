//src/app/api/hub-member/progress-reports/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const progressReportSchema = z.object({
  projectId: z.string(),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  attachments: z.array(z.string()).default([]),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = progressReportSchema.parse(body);

    // Verify user is a member of the project
    const projectMember = await prisma.projectMember.findFirst({
      where: {
        userId: session.user.id,
        projectId: validatedData.projectId,
        deletedAt: null,
      },
    });

    if (!projectMember) {
      return NextResponse.json(
        { error: "You are not a member of this project" },
        { status: 403 }
      );
    }

    // Create progress report
    const progressReport = await prisma.progressReport.create({
      data: {
        projectId: validatedData.projectId,
        userId: session.user.id,
        title: validatedData.title,
        content: validatedData.content,
        attachments: validatedData.attachments,
      },
    });

    return NextResponse.json(
      { success: true, report: progressReport },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating progress report:", error);
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
    const projectId = url.searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID required" },
        { status: 400 }
      );
    }

    // Verify user is a member of the project
    const projectMember = await prisma.projectMember.findFirst({
      where: {
        userId: session.user.id,
        projectId: projectId,
        deletedAt: null,
      },
    });

    if (!projectMember) {
      return NextResponse.json(
        { error: "You are not a member of this project" },
        { status: 403 }
      );
    }

    const reports = await prisma.progressReport.findMany({
      where: {
        projectId: projectId,
        userId: session.user.id,
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Error fetching progress reports:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
