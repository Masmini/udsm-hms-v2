//src/app/api/auth/forgot-password/route.ts
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
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required and must be a string" },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: emailLower } });
    if (!user) {
      return NextResponse.json(
        { error: "Email not registered" },
        { status: 400 }
      );
    }
    if (user.isGoogleUser) {
      return NextResponse.json(
        {
          error:
            "This account uses Google sign-in. Please use Google to sign in.",
        },
        { status: 400 }
      );
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expirationTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.oTP.upsert({
      where: { email: emailLower },
      update: {
        code: otpCode,
        expiresAt: expirationTime,
        createdAt: new Date(),
      },
      create: {
        email: emailLower,
        code: otpCode,
        expiresAt: expirationTime,
      },
    });

    const mailOptions = {
      from: `"UDSM Hub System" <${process.env.EMAIL_USER}>`,
      to: emailLower,
      subject: "Your OTP Code for Password Reset",
      text: `Your OTP code is: ${otpCode}. It expires in 10 minutes.`,
      html: `
        <h2>Password Reset OTP</h2>
        <p>Your OTP code is: <strong>${otpCode}</strong></p>
        <p>It expires in 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
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
