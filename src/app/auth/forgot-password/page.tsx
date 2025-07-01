//src/app/auth/forgot-password/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Link from "next/link";
import Image from "next/image";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().min(1, "OTP is required").optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/\d/, "Password must include a number")
    .optional(),
});

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordClient() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const handleSendOTP = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email.toLowerCase() }),
      });
      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.error || "Failed to send OTP");
      setOtpSent(true);
      setStep(2);
    } catch (err: any) {
      setError(
        err.message === "Email not registered"
          ? "This email is not registered. Please sign up."
          : err.message
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email.toLowerCase(),
          otp: data.otp,
        }),
      });
      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.error || "Invalid OTP");
      setStep(3);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email.toLowerCase(),
          otp: data.otp,
          newPassword: data.password,
        }),
      });
      const responseData = await res.json();
      if (!res.ok)
        throw new Error(responseData.error || "Failed to reset password");
      router.push("/auth/signin?message=Password reset successfully");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: getValues("email").toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resend OTP");
      setResendTimer(90);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        p: 2,
      }}
    >
      <Paper
        elevation={24}
        sx={{
          p: 4,
          maxWidth: 400,
          width: "100%",
          borderRadius: 3,
        }}
      >
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Image
            src="/logo.png"
            alt="UDSM Logo"
            width={60}
            height={60}
            style={{ marginBottom: 16 }}
          />
          <Typography
            variant="h4"
            fontWeight="bold"
            color="primary"
            gutterBottom
          >
            Forgot Password
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Reset your password to regain access
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error.includes("not registered") ? (
              <>
                This email is not registered. Please{" "}
                <Link href="/auth/signup" style={{ color: "#1976d2" }}>
                  sign up here
                </Link>
                .
              </>
            ) : (
              error
            )}
          </Alert>
        )}

        {step === 1 && (
          <form onSubmit={handleSubmit(handleSendOTP)}>
            <TextField
              {...register("email")}
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              error={!!errors.email}
              helperText={errors.email?.message}
              disabled={isLoading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ mt: 2, py: 1.5 }}
            >
              {isLoading ? <CircularProgress size={24} /> : "Send OTP"}
            </Button>
          </form>
        )}

        {step === 2 && otpSent && (
          <form onSubmit={handleSubmit(handleVerifyOTP)}>
            <Typography sx={{ mb: 2, textAlign: "center" }}>
              Enter OTP sent to {getValues("email")}
            </Typography>
            <TextField
              {...register("otp")}
              label="OTP"
              fullWidth
              margin="normal"
              error={!!errors.otp}
              helperText={errors.otp?.message}
              disabled={isLoading}
            />
            <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setStep(1)}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{ py: 1.5 }}
              >
                {isLoading ? <CircularProgress size={24} /> : "Verify OTP"}
              </Button>
            </Box>
            <Button
              fullWidth
              variant="text"
              onClick={handleResendOTP}
              disabled={isLoading || resendTimer > 0}
              sx={{ mt: 1 }}
            >
              Resend OTP {resendTimer > 0 ? `(${resendTimer}s)` : ""}
            </Button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleSubmit(handleResetPassword)}>
            <TextField
              {...register("password")}
              label="New Password"
              type={showPassword ? "text" : "password"}
              fullWidth
              margin="normal"
              error={!!errors.password}
              helperText={errors.password?.message}
              disabled={isLoading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setStep(2)}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{ py: 1.5 }}
              >
                {isLoading ? <CircularProgress size={24} /> : "Reset Password"}
              </Button>
            </Box>
          </form>
        )}

        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Back to{" "}
            <Link href="/auth/signin" style={{ color: "#1976d2" }}>
              Sign In
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
