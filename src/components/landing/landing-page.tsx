// src/components/landing/landing-page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Stack,
  Chip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Users,
  BookOpen,
  Calendar,
  Target,
  ChevronRight,
  Star,
  Award,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Define the array of hero images
const heroImages = [
  "/hero-illustration-1.png",
  "/hero-illustration-2.png",
  "/hero-illustration-3.png",
  // Add more image paths as needed
];

const features = [
  {
    icon: Users,
    title: "Connect with Hubs",
    description:
      "Join communities that match your interests and collaborate with like-minded students.",
    color: "#225dcd",
  },
  {
    icon: BookOpen,
    title: "Explore Programmes",
    description:
      "Engage in structured learning opportunities and skill development programs.",
    color: "#14b8a6",
  },
  {
    icon: Target,
    title: "Work on Projects",
    description:
      "Collaborate on innovative projects with peers and build your portfolio.",
    color: "#f59e0b",
  },
  {
    icon: Calendar,
    title: "Attend Events",
    description:
      "Participate in workshops, seminars, and networking events to grow your network.",
    color: "#ef4444",
  },
];

const stats = [
  { label: "Active Students", value: "2,500+", icon: Users },
  { label: "Research Hubs", value: "50+", icon: Target },
  { label: "Projects Completed", value: "300+", icon: Award },
  { label: "Success Rate", value: "95%", icon: TrendingUp },
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Computer Science Student",
    content:
      "The UDSM Hub Management System has transformed how I collaborate with my peers. I've been able to join amazing projects and develop skills I never thought possible.",
    avatar: "/avatars/sarah.jpg",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Engineering Student",
    content:
      "Through this platform, I found a team for my final year project and we've created something truly innovative. The connections I've made here are invaluable.",
    avatar: "/avatars/michael.jpg",
    rating: 5,
  },
  {
    name: "Aisha Mwangi",
    role: "Business Student",
    content:
      "The events and workshops organized through the hubs have given me practical skills that complement my academic learning perfectly.",
    avatar: "/avatars/aisha.jpg",
    rating: 5,
  },
];

export function LandingPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");

  // Handle testimonial rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Handle hero image rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => {
        if (direction === "forward") {
          if (prevIndex === heroImages.length - 1) {
            // Reached the last image, switch to backward
            setDirection("backward");
            return prevIndex - 1;
          }
          return prevIndex + 1;
        } else {
          // direction === "backward"
          if (prevIndex === 0) {
            // Reached the first image, switch to forward
            setDirection("forward");
            return prevIndex + 1;
          }
          return prevIndex - 1;
        }
      });
    }, 3000); // Change image every 3 seconds
    return () => clearInterval(timer);
  }, [direction]);

  return (
    <Box
      sx={{
        overflow: "hidden",
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      {/* Hero Section */}
      <Box
        sx={{
          minHeight: "100vh",
          background:
            theme.palette.mode === "dark"
              ? `linear-gradient(135deg, ${theme.palette.primary.main}30 0%, ${theme.palette.secondary.main}30 100%)`
              : `linear-gradient(135deg, ${theme.palette.primary.main}20 0%, ${theme.palette.secondary.main}20 100%)`,
          display: "flex",
          alignItems: "center",
          position: "relative",
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: "2.5rem", md: "4rem" },
                    background:
                      theme.palette.mode === "dark"
                        ? `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`
                        : `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    mb: 2,
                  }}
                >
                  Welcome to UDSM HUBS
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    color: "text.secondary",
                    mb: 4,
                    maxWidth: 600,
                    lineHeight: 1.6,
                  }}
                >
                  Connect with hubs, explore events, collaborate on projects,
                  and engage with programmes. Your gateway to academic
                  excellence and innovation.
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Button
                    component={Link}
                    href="/auth/signin"
                    variant="contained"
                    size="large"
                    endIcon={<ChevronRight />}
                    sx={{
                      py: 2,
                      px: 4,
                      fontSize: "1.1rem",
                      borderRadius: 3,
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    component={Link}
                    href="/auth/signup"
                    variant="outlined"
                    size="large"
                    sx={{
                      py: 2,
                      px: 4,
                      fontSize: "1.1rem",
                      borderRadius: 3,
                      borderColor: "primary.main",
                      color: "primary.main",
                      "&:hover": {
                        borderColor: "primary.dark",
                        bgcolor:
                          theme.palette.mode === "dark"
                            ? "rgba(96, 165, 250, 0.1)"
                            : "rgba(34, 93, 205, 0.1)",
                      },
                    }}
                  >
                    Sign Up
                  </Button>
                </Stack>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Box
                  sx={{
                    position: "relative",
                    borderRadius: 4,
                    overflow: "hidden",
                    boxShadow:
                      theme.palette.mode === "dark"
                        ? "0 20px 40px rgba(0,0,0,0.3)"
                        : "0 20px 40px rgba(0,0,0,0.1)",
                    width: "100%",
                    height: { xs: 300, md: 400 }, // Adjust height for responsiveness
                  }}
                >
                  <motion.div
                    key={currentImageIndex}
                    initial={{
                      opacity: 0,
                      x: direction === "forward" ? 50 : -50,
                    }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction === "forward" ? -50 : 50 }}
                    transition={{ duration: 0.5 }}
                    style={{
                      position: "absolute",
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    <Image
                      src={heroImages[currentImageIndex]}
                      alt={`Hero Illustration ${currentImageIndex + 1}`}
                      fill
                      style={{
                        objectFit: "cover",
                        borderRadius: 16,
                      }}
                    />
                  </motion.div>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: 8, bgcolor: "background.paper" }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card
                    sx={{
                      textAlign: "center",
                      p: 3,
                      borderRadius: 3,
                      background: "transparent",
                      boxShadow: "none",
                      bgcolor: "background.paper",
                    }}
                  >
                    <stat.icon
                      size={48}
                      color={theme.palette.primary.main}
                      style={{ marginBottom: 16 }}
                    />
                    <Typography variant="h3" fontWeight="bold" color="primary">
                      {stat.value}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 10, bgcolor: "background.default" }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Typography
              variant="h2"
              textAlign="center"
              fontWeight="bold"
              color="primary"
              sx={{ mb: 2 }}
            >
              Discover What You Can Do
            </Typography>
            <Typography
              variant="h6"
              textAlign="center"
              color="text.secondary"
              sx={{ mb: 6, maxWidth: 600, mx: "auto" }}
            >
              Explore the features that make UDSM HUBS the perfect platform for
              academic collaboration
            </Typography>
          </motion.div>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card
                    sx={{
                      height: "100%",
                      p: 3,
                      borderRadius: 3,
                      transition: "all 0.3s ease",
                      bgcolor: "background.paper",
                      border:
                        theme.palette.mode === "dark"
                          ? "1px solid #334155"
                          : "none",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow:
                          theme.palette.mode === "dark"
                            ? "0 12px 24px rgba(0,0,0,0.3)"
                            : "0 12px 24px rgba(0,0,0,0.15)",
                      },
                    }}
                  >
                    <CardContent sx={{ p: 0 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: `${feature.color}20`,
                            mr: 2,
                          }}
                        >
                          <feature.icon size={32} color={feature.color} />
                        </Box>
                        <Typography
                          variant="h5"
                          fontWeight="bold"
                          color="text.primary"
                        >
                          {feature.title}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        lineHeight={1.7}
                      >
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ py: 10, bgcolor: "background.paper" }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Typography
              variant="h2"
              textAlign="center"
              fontWeight="bold"
              color="primary"
              sx={{ mb: 2 }}
            >
              What Students Say
            </Typography>
            <Typography
              variant="h6"
              textAlign="center"
              color="text.secondary"
              sx={{ mb: 6 }}
            >
              Real experiences from our amazing student community
            </Typography>
          </motion.div>

          <Box sx={{ maxWidth: 800, mx: "auto" }}>
            <motion.div
              key={currentTestimonial}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              <Card
                sx={{
                  p: 4,
                  textAlign: "center",
                  borderRadius: 3,
                  bgcolor: "background.paper",
                  border:
                    theme.palette.mode === "dark"
                      ? "1px solid #334155"
                      : "none",
                  background:
                    theme.palette.mode === "dark"
                      ? `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.secondary.main}15)`
                      : `linear-gradient(135deg, ${theme.palette.primary.main}10, ${theme.palette.secondary.main}10)`,
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                  {[...Array(testimonials[currentTestimonial].rating)].map(
                    (_, i) => (
                      <Star
                        key={i}
                        size={24}
                        fill={theme.palette.warning.main}
                        color={theme.palette.warning.main}
                      />
                    )
                  )}
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 3,
                    fontStyle: "italic",
                    lineHeight: 1.7,
                    color: "text.primary",
                  }}
                >
                  "{testimonials[currentTestimonial].content}"
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="text.primary">
                  {testimonials[currentTestimonial].name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {testimonials[currentTestimonial].role}
                </Typography>
              </Card>
            </motion.div>

            <Box
              sx={{ display: "flex", justifyContent: "center", mt: 3, gap: 1 }}
            >
              {testimonials.map((_, index) => (
                <Box
                  key={index}
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    bgcolor:
                      index === currentTestimonial
                        ? theme.palette.primary.main
                        : theme.palette.divider,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onClick={() => setCurrentTestimonial(index)}
                />
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: 10,
          background:
            theme.palette.mode === "dark"
              ? `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`
              : `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          color: "white",
        }}
      >
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Box textAlign="center">
              <Typography variant="h2" fontWeight="bold" sx={{ mb: 2 }}>
                Ready to Get Started?
              </Typography>
              <Typography
                variant="h6"
                sx={{ mb: 4, opacity: 0.9, maxWidth: 600, mx: "auto" }}
              >
                Join thousands of students who are already collaborating,
                learning, and growing together
              </Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                justifyContent="center"
              >
                <Button
                  component={Link}
                  href="/auth/signup"
                  variant="contained"
                  size="large"
                  sx={{
                    py: 2,
                    px: 6,
                    fontSize: "1.1rem",
                    bgcolor: "white",
                    color: theme.palette.primary.main,
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.9)",
                    },
                  }}
                >
                  Create Account
                </Button>
                <Button
                  component={Link}
                  href="/hubs"
                  variant="outlined"
                  size="large"
                  sx={{
                    py: 2,
                    px: 6,
                    fontSize: "1.1rem",
                    borderColor: "white",
                    color: "white",
                    "&:hover": {
                      borderColor: "white",
                      bgcolor: "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  Explore Hubs
                </Button>
              </Stack>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          py: 6,
          bgcolor: theme.palette.mode === "dark" ? "#0f172a" : "#1e293b",
          color: "white",
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                UDSM HUBS
              </Typography>
              <Typography
                variant="body2"
                sx={{ opacity: 0.8, lineHeight: 1.7 }}
              >
                Empowering students through collaboration, innovation, and
                academic excellence.
              </Typography>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Quick Links
              </Typography>
              <Stack spacing={1}>
                <Link
                  href="/about"
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    textDecoration: "none",
                  }}
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    textDecoration: "none",
                  }}
                >
                  Contact
                </Link>
                <Link
                  href="/help"
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    textDecoration: "none",
                  }}
                >
                  Help
                </Link>
              </Stack>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Features
              </Typography>
              <Stack spacing={1}>
                <Link
                  href="/hubs"
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    textDecoration: "none",
                  }}
                >
                  Hubs
                </Link>
                <Link
                  href="/projects"
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    textDecoration: "none",
                  }}
                >
                  Projects
                </Link>
                <Link
                  href="/events"
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    textDecoration: "none",
                  }}
                >
                  Events
                </Link>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                University of Dar es Salaam
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                © {new Date().getFullYear()} UDSM Hub Management System. All
                rights reserved.
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
