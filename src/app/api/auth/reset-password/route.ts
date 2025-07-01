//src/app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, otp, newPassword } = await req.json();
    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { error: "Email, OTP, and new password are required" },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase();
    const otpEntry = await prisma.oTP.findUnique({
      where: { email: emailLower },
    });
    if (!otpEntry || otpEntry.code !== otp || new Date() > otpEntry.expiresAt) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 8 characters and include a letter and a number",
        },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { email: emailLower },
      data: { password: hashedPassword },
    });

    await prisma.oTP.delete({ where: { email: emailLower } });
    return NextResponse.json(
      { message: "Password reset successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
