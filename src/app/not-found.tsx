"use client";

import { Box, Typography, Button, Paper, Container } from "@mui/material";
import { Home, ArrowBack, Search } from "@mui/icons-material";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function NotFound() {
  const router = useRouter();
  const { data: session } = useSession();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  const getHomeRoute = () => {
    if (session?.user) {
      if (session.user.role === "ADMIN") {
        return "/admin/dashboard";
      } else {
        return `/dashboard/${session.user.id}`;
      }
    }
    return "/";
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper
          sx={{
            p: 6,
            textAlign: "center",
            bgcolor: "background.paper",
            borderRadius: 3,
          }}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "4rem", md: "6rem" },
                fontWeight: "bold",
                color: "primary.main",
                mb: 2,
              }}
            >
              404
            </Typography>
          </motion.div>

          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Page Not Found
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: 500, mx: "auto" }}
          >
            The page you're looking for doesn't exist or has been moved. Don't
            worry, let's get you back on track!
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="contained"
              size="large"
              startIcon={<ArrowBack />}
              onClick={handleGoBack}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
              }}
            >
              Go Back
            </Button>

            <Button
              variant="outlined"
              size="large"
              startIcon={<Home />}
              component={Link}
              href={getHomeRoute()}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
              }}
            >
              Go Home
            </Button>

            <Button
              variant="outlined"
              size="large"
              startIcon={<Search />}
              component={Link}
              href="/hubs"
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
              }}
            >
              Explore Hubs
            </Button>
          </Box>

          <Box sx={{ mt: 4, pt: 4, borderTop: 1, borderColor: "divider" }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Quick Links
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Button component={Link} href="/hubs" size="small">
                Hubs
              </Button>
              <Button component={Link} href="/events" size="small">
                Events
              </Button>
              <Button component={Link} href="/projects" size="small">
                Projects
              </Button>
              <Button component={Link} href="/programmes" size="small">
                Programmes
              </Button>
            </Box>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
}
