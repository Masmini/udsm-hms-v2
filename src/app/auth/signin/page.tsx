//src/app/auth/signin/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, type SignInInput } from "@/lib/validations";
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
} from "@mui/material";
import { Visibility, VisibilityOff, Google } from "@mui/icons-material";
import Link from "next/link";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
    },
  });

  // Redirect authenticated users
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      console.log("[SignIn Page]: User is authenticated, redirecting...");
      const redirectUrl =
        session.user.role === "ADMIN"
          ? "/admin/dashboard"
          : `/dashboard/${session.user.id}`;
      router.push(redirectUrl);
    }
  }, [status, session, router]);

  useEffect(() => {
    const errorFromUrl = searchParams.get("error");
    const messageFromUrl = searchParams.get("message");
    const emailFromUrl = searchParams.get("email");

    if (errorFromUrl) {
      console.log("[SignIn Page]: Error from URL:", errorFromUrl);
      setError(decodeURIComponent(errorFromUrl));
    }
    if (messageFromUrl) {
      console.log("[SignIn Page]: Message from URL:", messageFromUrl);
      setSuccess(decodeURIComponent(messageFromUrl));
    }
    if (emailFromUrl) {
      console.log("[SignIn Page]: Email from URL:", emailFromUrl);
      setValue("email", decodeURIComponent(emailFromUrl));
    }
    console.log("[SignIn Page]: Cookies:", document.cookie);
  }, [searchParams, setValue]);

  const onSubmit = async (data: SignInInput) => {
    try {
      setIsLoading(true);
      setError("");

      console.log(
        "[SignIn]: Attempting credentials sign-in with email:",
        data.email
      );
      const result = await signIn("credentials", {
        email: data.email.toLowerCase(),
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        console.error("[SignIn]: Sign-in error:", result.error);
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
            console.log("[SignIn]: Redirecting to:", redirectUrl);
            router.push(redirectUrl);
          }
        }, 500);
      }
    } catch (error: any) {
      console.error("[SignIn Error]:", error.message, error.stack);
      setError("An error occurred during sign-in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError("");
      console.log("[SignIn]: Initiating Google sign-in");
      const result = await signIn("google", { redirect: false });
      if (result?.error) {
        console.error("[Google SignIn]: Sign-in error:", result.error);
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
            console.log("[Google SignIn]: Redirecting to:", redirectUrl);
            router.push(redirectUrl);
          }
        }, 500);
      }
    } catch (error: any) {
      console.error("[Google SignIn Error]:", error.message, error.stack);
      setError("Google sign-in failed. Please try again.");
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
            Welcome Back
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in to your UDSM HUBS account
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
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

          <Box sx={{ textAlign: "right", mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <Link href="/auth/forgot-password" style={{ color: "#1976d2" }}>
                Forgot Password?
              </Link>
            </Typography>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isLoading}
            sx={{ mb: 2, py: 1.5 }}
          >
            {isLoading ? <CircularProgress size={24} /> : "Sign In"}
          </Button>
        </form>

        <Divider sx={{ my: 2 }}>
          <Typography variant="body2" color="text.secondary">
            OR
          </Typography>
        </Divider>

        <Button
          fullWidth
          variant="outlined"
          size="large"
          startIcon={<Google />}
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          sx={{ mb: 2, py: 1.5 }}
        >
          Continue with Google
        </Button>

        <Box sx={{ textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Don’t have an account?{" "}
            <Link href="/auth/signup" style={{ color: "#1976d2" }}>
              Sign up
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
