//src/app/api/hubs/[hubId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { hubId: string } }
) {
  try {
    const hubId = params.hubId;
    console.log(`[API] Fetching hub with ID: ${hubId}`);

    if (!hubId) {
      console.warn("[API] Hub ID is missing");
      return NextResponse.json(
        { error: "Hub ID is required" },
        { status: 400 }
      );
    }

    const hub = await prisma.hub.findUnique({
      where: { id: hubId, deletedAt: null },
      include: {
        categories: true,
        members: {
          where: { deletedAt: null, isActive: true },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePicture: true,
                email: true,
                skills: true,
              },
            },
          },
        },
        projects: {
          where: { deletedAt: null, publishStatus: "PUBLISHED" },
          select: {
            id: true,
            title: true,
            description: true,
            coverImage: true,
            visibility: true,
            publishStatus: true,
            createdAt: true,
          },
        },
        programmes: {
          where: { deletedAt: null, publishStatus: "PUBLISHED" },
          select: {
            id: true,
            title: true,
            description: true,
            coverImage: true,
            publishStatus: true,
            createdAt: true,
          },
        },
        events: {
          where: { deletedAt: null, publishStatus: "PUBLISHED" },
          select: {
            id: true,
            title: true,
            description: true,
            coverImage: true,
            visibility: true,
            publishStatus: true,
            startDate: true,
            endDate: true,
          },
        },
        news: {
          where: { visibility: "PUBLIC", publishStatus: "PUBLISHED" },
          select: {
            id: true,
            title: true,
            excerpt: true,
            image: true,
            createdAt: true,
            author: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        _count: {
          select: {
            members: { where: { isActive: true, deletedAt: null } },
            projects: {
              where: { publishStatus: "PUBLISHED", deletedAt: null },
            },
            programmes: {
              where: { publishStatus: "PUBLISHED", deletedAt: null },
            },
            events: { where: { publishStatus: "PUBLISHED", deletedAt: null } },
          },
        },
      },
    });

    if (!hub) {
      console.warn(`[API] Hub not found for ID: ${hubId}`);
      return NextResponse.json({ error: "Hub not found" }, { status: 404 });
    }

    console.log(`[API] Hub found: ${hub.name}`);
    return NextResponse.json({ data: hub }, { status: 200 });
  } catch (error) {
    console.error("[API] Error fetching hub:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
