import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const responseSchema = z.object({
  action: z.enum(["approve", "edit", "deny"]),
  message: z.string().optional(),
  editedData: z
    .object({
      title: z.string().optional(),
      content: z.string().optional(),
    })
    .optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { suggestionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = responseSchema.parse(body);

    // Get the suggestion and verify permissions
    const suggestion = await prisma.projectSuggestion.findUnique({
      where: { id: params.suggestionId },
      include: {
        project: {
          include: {
            hub: true,
          },
        },
        user: true,
      },
    });

    if (!suggestion) {
      return NextResponse.json(
        { error: "Suggestion not found" },
        { status: 404 }
      );
    }

    // Verify user is hub leader
    const hubMember = await prisma.hubMember.findFirst({
      where: {
        userId: session.user.id,
        hubId: suggestion.project.hubId,
        role: "HUB_LEADER",
        isActive: true,
        deletedAt: null,
      },
    });

    if (!hubMember) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    let updateData: any = {
      status: validatedData.action === "approve" ? "APPROVED" : "REJECTED",
    };

    // If editing, update the suggestion content
    if (validatedData.action === "edit" && validatedData.editedData) {
      updateData = {
        ...updateData,
        title: validatedData.editedData.title || suggestion.title,
        content: validatedData.editedData.content || suggestion.content,
        status: "PENDING", // Keep as pending for user to accept/decline
      };
    }

    // Update the suggestion
    const updatedSuggestion = await prisma.projectSuggestion.update({
      where: { id: params.suggestionId },
      data: updateData,
    });

    // Create notification for the user
    await prisma.notification.create({
      data: {
        userId: suggestion.userId,
        title: `Project Suggestion ${
          validatedData.action === "approve"
            ? "Approved"
            : validatedData.action === "edit"
            ? "Edited"
            : "Denied"
        }`,
        message:
          validatedData.message ||
          `Your project suggestion "${suggestion.title}" has been ${validatedData.action}d by the hub leader.`,
        type: "PROJECT_UPDATE",
        actionUrl: `/dashboard/${suggestion.userId}/my-projects`,
      },
    });

    // If approved, create the actual project
    if (validatedData.action === "approve") {
      const project = await prisma.project.create({
        data: {
          title: suggestion.title,
          description: suggestion.content,
          hubId: suggestion.project.hubId,
          publishStatus: "PUBLISHED",
          status: "PLANNING",
          visibility: "HUB_MEMBERS",
        },
      });

      // Add the suggester as a project member
      await prisma.projectMember.create({
        data: {
          userId: suggestion.userId,
          projectId: project.id,
          role: "MEMBER",
        },
      });
    }

    return NextResponse.json({ success: true, suggestion: updatedSuggestion });
  } catch (error) {
    console.error("Error responding to suggestion:", error);
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
