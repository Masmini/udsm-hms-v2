//src/components/ui/page-loader.tsx
"use client";

import React from "react";
import { Box, CircularProgress, Typography, Skeleton } from "@mui/material";
import { motion } from "framer-motion";

interface PageLoaderProps {
  message?: string;
  variant?: "spinner" | "skeleton";
}

export function PageLoader({
  message = "Loading...",
  variant = "spinner",
}: PageLoaderProps) {
  if (variant === "skeleton") {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
        <Skeleton variant="text" height={40} sx={{ mb: 1 }} />
        <Skeleton variant="text" height={40} sx={{ mb: 1 }} />
        <Skeleton variant="text" height={40} width="60%" />
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "50vh",
          gap: 2,
        }}
      >
        <CircularProgress size={48} thickness={4} />
        <Typography variant="h6" color="text.secondary">
          {message}
        </Typography>
      </Box>
    </motion.div>
  );
}
