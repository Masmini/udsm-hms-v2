//src/app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(["STUDENT", "ADMIN"]),
  degreeProgramme: z.string().optional(),
  skills: z.array(z.string()).optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { email, firstName, lastName, role, degreeProgramme, skills } =
      parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { id: params.id, deletedAt: null },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (existingUser.isGoogleUser && email !== existingUser.email) {
      return NextResponse.json(
        { error: "Cannot change email for Google accounts" },
        { status: 400 }
      );
    }

    // Check for email conflicts
    const emailConflict = await prisma.user.findFirst({
      where: { email, id: { not: params.id }, deletedAt: null },
    });

    if (emailConflict) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      );
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        email,
        firstName,
        lastName,
        role,
        degreeProgramme,
        skills,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        degreeProgramme: true,
        skills: true,
      },
    });

    return NextResponse.json({ success: true, data: user }, { status: 200 });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id, deletedAt: null },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: params.id },
      data: { deletedAt: new Date(), isActive: false },
    });

    return NextResponse.json(
      { success: true, message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
