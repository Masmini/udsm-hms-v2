//src/components/ui/enhanced-button.tsx
"use client";

import React, { useState } from "react";
import { Button, ButtonProps, CircularProgress, Tooltip } from "@mui/material";
import { motion } from "framer-motion";

interface EnhancedButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
  tooltip?: string;
  hapticFeedback?: boolean;
}

export function EnhancedButton({
  loading = false,
  loadingText = "Loading...",
  tooltip,
  hapticFeedback = true,
  children,
  disabled,
  onClick,
  ...props
}: EnhancedButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (hapticFeedback && "vibrate" in navigator) {
      navigator.vibrate(50);
    }

    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);

    if (onClick && !loading && !disabled) {
      onClick(event);
    }
  };

  const ButtonComponent = (
    <motion.div
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Button
        {...props}
        disabled={disabled || loading}
        onClick={handleClick}
        startIcon={
          loading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            props.startIcon
          )
        }
        sx={{
          ...props.sx,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: "-100%",
            width: "100%",
            height: "100%",
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
            transition: "left 0.5s",
          },
          "&:hover::before": {
            left: "100%",
          },
          transform: isPressed ? "scale(0.98)" : "scale(1)",
          transition: "transform 0.1s ease",
        }}
      >
        {loading ? loadingText : children}
      </Button>
    </motion.div>
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip} arrow>
        {ButtonComponent}
      </Tooltip>
    );
  }

  return ButtonComponent;
}
