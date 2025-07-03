//src/app/api/admin/hubs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createHubSchema = z.object({
  name: z.string().min(2, "Hub name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  cardBio: z.string().min(5, "Card bio must be at least 5 characters"),
  logo: z.string().optional(),
  coverImage: z.string().optional(),
  categories: z.array(z.string()).min(1, "At least one category is required"),
  vision: z.string().min(10, "Vision must be at least 10 characters"),
  mission: z.string().min(10, "Mission must be at least 10 characters"),
  objectives: z.array(z.string()).min(1, "At least one objective is required"),
  contactEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  location: z.string().optional(),
  establishedDate: z.string().optional(),
  socialLinks: z
    .object({
      twitter: z.string().optional(),
      linkedin: z.string().optional(),
      facebook: z.string().optional(),
      instagram: z.string().optional(),
    })
    .optional(),
  newCategories: z.array(z.string()).optional(),
  hubLeaderId: z.string().uuid("Invalid Hub Leader ID"),
  hubSupervisorId: z.string().uuid("Invalid Hub Supervisor ID"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("[Hub Creation]: Received data:", body);

    const parsed = createHubSchema.safeParse(body);

    if (!parsed.success) {
      console.log("[Hub Creation]: Validation errors:", parsed.error.errors);
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const {
      name,
      description,
      cardBio,
      logo,
      coverImage,
      categories,
      vision,
      mission,
      objectives,
      contactEmail,
      website,
      location,
      establishedDate,
      socialLinks,
      newCategories = [],
      hubLeaderId,
      hubSupervisorId,
    } = parsed.data;

    // Check if hub with this name already exists
    const existingHub = await prisma.hub.findUnique({
      where: { name },
    });

    if (existingHub) {
      return NextResponse.json(
        { error: "Hub with this name already exists" },
        { status: 409 }
      );
    }

    // Verify that the selected users exist and are active
    const [hubLeader, hubSupervisor] = await Promise.all([
      prisma.user.findUnique({
        where: { id: hubLeaderId, isActive: true },
      }),
      prisma.user.findUnique({
        where: { id: hubSupervisorId, isActive: true },
      }),
    ]);

    if (!hubLeader) {
      return NextResponse.json(
        { error: "Selected Hub Leader does not exist or is inactive" },
        { status: 400 }
      );
    }

    if (!hubSupervisor) {
      return NextResponse.json(
        { error: "Selected Hub Supervisor does not exist or is inactive" },
        { status: 400 }
      );
    }

    if (hubLeaderId === hubSupervisorId) {
      return NextResponse.json(
        { error: "Hub Leader and Supervisor cannot be the same user" },
        { status: 400 }
      );
    }

    // Map categories (names or IDs) to valid category IDs
    const categoryIds: string[] = [];
    const allCategoryNames = [...categories, ...newCategories];

    for (const category of allCategoryNames) {
      let categoryId: string | undefined;

      const existingCategoryById = await prisma.category.findUnique({
        where: { id: category },
      });

      if (existingCategoryById) {
        categoryId = existingCategoryById.id;
      } else {
        const existingCategoryByName = await prisma.category.findFirst({
          where: { name: category },
        });

        if (existingCategoryByName) {
          categoryId = existingCategoryByName.id;
        } else {
          const newCategory = await prisma.category.create({
            data: {
              name: category,
              description: null,
              color: "#1976d2",
            },
          });
          categoryId = newCategory.id;
        }
      }

      if (!categoryIds.includes(categoryId)) {
        categoryIds.push(categoryId);
      }
    }

    // Verify that all category IDs exist
    const categoryRecords = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
    });

    if (categoryRecords.length !== categoryIds.length) {
      return NextResponse.json(
        { error: "One or more categories could not be processed" },
        { status: 400 }
      );
    }

    // Create the hub and assign Hub Leader and Supervisor
    const hub = await prisma.hub.create({
      data: {
        name,
        description,
        cardBio,
        logo: logo || null,
        coverImage: coverImage || null,
        vision,
        mission,
        objectives,
        contactEmail: contactEmail || null,
        website: website || null,
        location: location || null,
        establishedDate: establishedDate ? new Date(establishedDate) : null,
        socialLinks: socialLinks || {},
        categories: {
          connect: categoryIds.map((id) => ({ id })),
        },
        isActive: true,
        members: {
          create: [
            {
              userId: hubLeaderId,
              role: "HUB_LEADER",
              isActive: true,
            },
            {
              userId: hubSupervisorId,
              role: "SUPERVISOR",
              isActive: true,
            },
          ],
        },
      },
      include: {
        categories: true,
        members: true,
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

    // Create hub analytics record
    await prisma.hubAnalytics.create({
      data: {
        hubId: hub.id,
        totalMembers: 2, // Hub Leader and Supervisor
        activeMembers: 2,
        totalProjects: 0,
        completedProjects: 0,
        totalEvents: 0,
        totalProgrammes: 0,
        engagementRate: 0.0,
        growthRate: 0.0,
      },
    });

    // Create audit log
    const ipAddress =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        userEmail: session.user.email,
        action: "CREATE",
        entityType: "HUB",
        entityId: hub.id,
        details: {
          hubName: hub.name,
          categories: categoryRecords.map((c) => c.name),
          hubLeaderId,
          hubSupervisorId,
          createdBy: `${session.user.firstName} ${session.user.lastName}`,
        },
        ipAddress,
        userAgent,
        success: true,
      },
    });

    console.log("[Hub Creation]: Hub created successfully:", hub.id);

    return NextResponse.json(
      {
        success: true,
        data: hub,
        message: "Hub created successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[Hub Creation Error]:", error.message, error.stack);

    try {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        const ipAddress =
          req.headers.get("x-forwarded-for") ||
          req.headers.get("x-real-ip") ||
          "unknown";
        const userAgent = req.headers.get("user-agent") || "unknown";

        await prisma.auditLog.create({
          data: {
            userId: session.user.id,
            userEmail: session.user.email,
            action: "CREATE",
            entityType: "HUB",
            details: {
              error: error.message,
              attemptedBy: `${session.user.firstName} ${session.user.lastName}`,
            },
            ipAddress,
            userAgent,
            success: false,
          },
        });
      }
    } catch (auditError) {
      console.error("[Audit Log Error]:", auditError);
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
