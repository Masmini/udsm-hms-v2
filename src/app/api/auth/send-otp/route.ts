//src/app/api/auth/send-otp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const emailLower = email.toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: { email: emailLower },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered. Please sign in." },
        { status: 400 }
      );
    }

    const existingOtp = await prisma.oTP.findUnique({
      where: { email: emailLower },
    });
    if (existingOtp && new Date() < existingOtp.expiresAt) {
      return NextResponse.json(
        { message: "OTP already sent. Check your email." },
        { status: 200 }
      );
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expirationTime = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await prisma.oTP.upsert({
      where: { email: emailLower },
      update: { code: otpCode, expiresAt: expirationTime },
      create: { email: emailLower, code: otpCode, expiresAt: expirationTime },
    });

    const mailOptions = {
      from: `"UDSM Hub System" <${process.env.EMAIL_USER}>`,
      to: emailLower,
      subject: "Your OTP Code for Sign-Up",
      text: `Your OTP code is: ${otpCode}. It expires in 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json(
      { message: "OTP sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
