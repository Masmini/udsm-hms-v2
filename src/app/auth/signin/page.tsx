//src/app/auth/signin/page.tsx
"use client";

import { useState, useEffect } from "react";
import { signIn, getSession } from "next-auth/react";
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

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
  });

  useEffect(() => {
    const errorFromUrl = searchParams.get("error");
    const messageFromUrl = searchParams.get("message");
    if (errorFromUrl) {
      switch (errorFromUrl) {
        case "User not found or account deactivated":
          setError(
            "Account not found or deactivated. Please sign up or contact support."
          );
          break;
        case "Please sign in with Google":
          setError(
            "This account uses Google sign-in. Please use the Google button."
          );
          break;
        case "Invalid password":
          setError("Incorrect email or password. Please try again.");
          break;
        case "Password not set. Use Google sign-in or reset password.":
          setError(
            "Password not set. Use Google sign-in or reset your password."
          );
          break;
        default:
          setError("An authentication error occurred. Please try again.");
      }
    }
    if (messageFromUrl) {
      setSuccess(decodeURIComponent(messageFromUrl));
    }
  }, [searchParams]);

  const onSubmit = async (data: SignInInput) => {
    try {
      setIsLoading(true);
      setError("");

      const result = await signIn("credentials", {
        email: data.email.toLowerCase(),
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        return;
      }

      // Get session to determine redirect
      const session = await getSession();
      if (session?.user) {
        if (session.user.role === "ADMIN") {
          router.push("/admin/dashboard");
        } else {
          router.push(`/dashboard/${session.user.id}`);
        }
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      setError("Google sign-in failed. Please try again.");
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
