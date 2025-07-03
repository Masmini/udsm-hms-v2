//src/app/auth/signup/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema, type SignUpInput } from "@/lib/validations";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import { Visibility, VisibilityOff, Google } from "@mui/icons-material";
import Link from "next/link";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";

const steps = [
  "Personal Information",
  "Email",
  "Verify OTP",
  "Account Details",
];

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeStep, setActiveStep] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [otp, setOtp] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    getValues,
    setValue,
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
  });

  // Redirect authenticated users
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      console.log("[SignUp Page]: User is authenticated, redirecting...");
      const redirectUrl =
        session.user.role === "ADMIN"
          ? "/admin/dashboard"
          : `/dashboard/${session.user.id}`;
      router.push(redirectUrl);
    }
  }, [status, session, router]);

  useEffect(() => {
    const emailFromUrl = searchParams.get("email");
    if (emailFromUrl) {
      setValue("email", decodeURIComponent(emailFromUrl));
      setActiveStep(2);
    }
  }, [searchParams, setValue]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendTimer]);

  const handleNextToEmail = async () => {
    const isValid = await trigger(["firstName", "lastName"]);
    if (isValid) {
      setError("");
      setActiveStep(1);
    }
  };

  const handleSendOTP = async () => {
    const isValid = await trigger(["email"]);
    if (!isValid) return;

    setIsLoading(true);
    setError("");
    try {
      const email = getValues("email").toLowerCase();
      console.log("[SignUp]: Sending OTP to:", email);
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      setOtpSent(true);
      setActiveStep(2);
      setResendTimer(90);
    } catch (err: any) {
      console.error("[SignUp OTP Error]:", err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      setError("Please enter the OTP.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      console.log("[SignUp]: Verifying OTP for:", getValues("email"));
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: getValues("email").toLowerCase(), otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid OTP");
      setOtpVerified(true);
      setActiveStep(3);
    } catch (err: any) {
      console.error("[SignUp Verify OTP Error]:", err.message);
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
      console.log("[SignUp]: Resending OTP to:", getValues("email"));
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: getValues("email").toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resend OTP");
      setResendTimer(90);
    } catch (err: any) {
      console.error("[SignUp Resend OTP Error]:", err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: SignUpInput) => {
    if (!otpVerified) {
      setError("Please verify your OTP first.");
      return;
    }
    try {
      setIsLoading(true);
      setError("");

      console.log("[SignUp]: Sending signup request for:", data.email);
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email.toLowerCase(),
          password: data.password,
          degreeProgramme: data.degreeProgramme || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create account");
      }

      const { redirectUrl } = await response.json();
      console.log("[SignUp]: Received redirectUrl:", redirectUrl);

      // Attempt to sign in the user after signup
      const signInResult = await signIn("credentials", {
        email: data.email.toLowerCase(),
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        console.error("[SignUp SignIn]: Sign-in error:", signInResult.error);
        router.push(
          `/auth/signin?message=${encodeURIComponent(
            "Account created successfully. Please sign in."
          )}&email=${encodeURIComponent(data.email)}`
        );
      } else {
        // Wait for session to be updated
        const interval = setInterval(async () => {
          const session = await import("next-auth/react").then((mod) =>
            mod.getSession()
          );
          if (session?.user) {
            clearInterval(interval);
            console.log("[SignUp]: Redirecting to:", redirectUrl);
            router.push(redirectUrl);
          }
        }, 500);
      }
    } catch (error: any) {
      console.error("[SignUp Error]:", error.message, error.stack);
      setError(error.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError("");
      console.log("[SignUp]: Initiating Google sign-in");
      const result = await signIn("google", { redirect: false });
      if (result?.error) {
        console.error("[Google SignUp]: Sign-in error:", result.error);
        setError(result.error);
      } else {
        // Wait for session to be updated
        const interval = setInterval(async () => {
          const session = await import("next-auth/react").then((mod) =>
            mod.getSession()
          );
          if (session?.user) {
            clearInterval(interval);
            const redirectUrl =
              session.user.role === "ADMIN"
                ? "/admin/dashboard"
                : `/dashboard/${session.user.id}`;
            console.log("[Google SignUp]: Redirecting to:", redirectUrl);
            router.push(redirectUrl);
          }
        }, 500);
      }
    } catch (error: any) {
      console.error("[Google SignUp Error]:", error.message, error.stack);
      setError("Google sign-in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

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
          maxWidth: 500,
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
            Join UDSM HUBS
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create your account to get started
          </Typography>
        </Box>

        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {activeStep === 0 && (
          <Box>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<Google />}
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              sx={{ mb: 3, py: 1.5 }}
            >
              Continue with Google
            </Button>

            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>

            <TextField
              {...register("firstName")}
              label="First Name"
              fullWidth
              margin="normal"
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
              disabled={isLoading}
            />

            <TextField
              {...register("lastName")}
              label="Last Name"
              fullWidth
              margin="normal"
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
              disabled={isLoading}
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleNextToEmail}
              disabled={isLoading}
              sx={{ mt: 3, py: 1.5 }}
            >
              {isLoading ? <CircularProgress size={24} /> : "Next"}
            </Button>
          </Box>
        )}

        {activeStep === 1 && (
          <Box>
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

            <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setActiveStep(0)}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleSendOTP}
                disabled={isLoading}
                sx={{ py: 1.5 }}
              >
                {isLoading ? <CircularProgress size={24} /> : "Send OTP"}
              </Button>
            </Box>
          </Box>
        )}

        {activeStep === 2 && otpSent && (
          <Box>
            <Typography sx={{ mb: 2, textAlign: "center" }}>
              Enter OTP sent to {getValues("email")}
            </Typography>
            <TextField
              label="OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              fullWidth
              margin="normal"
              disabled={isLoading}
            />

            <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setActiveStep(1)}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleVerifyOTP}
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
          </Box>
        )}

        {activeStep === 3 && otpVerified && (
          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              {...register("password")}
              label="Password"
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

            <TextField
              {...register("degreeProgramme")}
              label="Degree Programme (Optional)"
              fullWidth
              margin="normal"
              error={!!errors.degreeProgramme}
              helperText={errors.degreeProgramme?.message}
              disabled={isLoading}
            />

            <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setActiveStep(2)}
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
                {isLoading ? <CircularProgress size={24} /> : "Create Account"}
              </Button>
            </Box>
          </form>
        )}

        {activeStep < 3 && (
          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{" "}
              <Link href="/auth/signin" style={{ color: "#1976d2" }}>
                Sign in
              </Link>
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
