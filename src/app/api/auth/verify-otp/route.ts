//src/app/api/auth/verify-otp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();
    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
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

    await prisma.oTP.delete({ where: { email: emailLower } });
    return NextResponse.json(
      { message: "OTP verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
