//src/app/api/hubs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createHubSchema = z.object({
  name: z.string().min(3, "Hub name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  cardBio: z
    .string()
    .max(200, "Card bio must be less than 200 characters")
    .optional(),
  logo: z.string().url().optional(),
  coverImage: z.string().url().optional(),
  categories: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    const skip = (page - 1) * limit;

    const where = {
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
        ],
      }),
      ...(category && {
        categories: {
          some: {
            name: { contains: category, mode: "insensitive" as const },
          },
        },
      }),
    };

    const [hubs, total] = await Promise.all([
      prisma.hub.findMany({
        where,
        skip,
        take: limit,
        include: {
          categories: true,
          _count: {
            select: {
              members: true,
              projects: true,
              programmes: true,
              events: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.hub.count({ where }),
    ]);

    return NextResponse.json({
      hubs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching hubs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createHubSchema.parse(body);

    const hub = await prisma.hub.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        cardBio: validatedData.cardBio,
        logo: validatedData.logo,
        coverImage: validatedData.coverImage,
        categories: {
          connectOrCreate:
            validatedData.categories?.map((categoryName) => ({
              where: { name: categoryName },
              create: { name: categoryName },
            })) || [],
        },
      },
      include: {
        categories: true,
        _count: {
          select: {
            members: true,
            projects: true,
            programmes: true,
            events: true,
          },
        },
      },
    });

    return NextResponse.json(hub, { status: 201 });
  } catch (error) {
    console.error("Error creating hub:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
