//src/app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { signIn } from "next-auth/react"; // Note: For server-side, use next-auth directly

const signUpSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/\d/, "Password must include a number"),
  degreeProgramme: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = signUpSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email.toLowerCase() },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered. Please sign in." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 12);
    const user = await prisma.user.create({
      data: {
        email: validatedData.email.toLowerCase(),
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        degreeProgramme: validatedData.degreeProgramme,
        role: "STUDENT",
        isGoogleUser: false,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    // Verify user.id
    if (!user.id) {
      throw new Error("Failed to generate user ID");
    }

    // Create a welcome notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "Welcome to UDSM Hub System",
        message:
          "Thank you for joining! Explore hubs, projects, and programmes.",
        type: "SYSTEM",
        priority: "MEDIUM",
        actionUrl: "/home/dashboard",
      },
    });

    return NextResponse.json(
      {
        message: "User created successfully",
        user,
        redirectUrl: `/dashboard/${user.id}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
