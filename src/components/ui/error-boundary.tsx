"use client";

import React from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import { ErrorOutline, Refresh } from "@mui/icons-material";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "50vh",
            p: 3,
          }}
        >
          <Paper
            sx={{
              p: 4,
              textAlign: "center",
              maxWidth: 500,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "error.light",
            }}
          >
            <ErrorOutline
              sx={{
                fontSize: 64,
                color: "error.main",
                mb: 2,
              }}
            />
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              We encountered an unexpected error. Please try refreshing the page
              or contact support if the problem persists.
            </Typography>
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={() => window.location.reload()}
              sx={{ mr: 2 }}
            >
              Refresh Page
            </Button>
            <Button
              variant="outlined"
              onClick={() => this.setState({ hasError: false })}
            >
              Try Again
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
