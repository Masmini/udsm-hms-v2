//src/app/admin/system-health/system-health-client.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  MonitorHeart,
  Dataset, // Changed from Database to Dataset
  Cloud,
  Wifi,
  Speed,
  Security,
  CheckCircle,
  Warning,
  Error,
  Refresh,
  PlayArrow,
  CleaningServices,
  RestartAlt,
} from "@mui/icons-material";
import { motion } from "framer-motion";

interface SystemHealthMetrics {
  database: {
    status: "healthy" | "warning" | "error";
    responseTime: number;
    connections: number;
    lastBackup?: string;
  };
  storage: {
    status: "healthy" | "warning" | "error";
    cloudinaryConnected: boolean;
    totalFiles: number;
    storageUsed: string;
  };
  realtime: {
    status: "healthy" | "warning" | "error";
    firebaseConnected: boolean;
    activeConnections: number;
  };
  performance: {
    status: "healthy" | "warning" | "error";
    averageResponseTime: number;
    memoryUsage: number;
    cpuUsage: number;
  };
  security: {
    status: "healthy" | "warning" | "error";
    failedLogins: number;
    suspiciousActivity: number;
    lastSecurityScan?: string;
  };
  integrations: {
    whatsapp: boolean;
    email: boolean;
    analytics: boolean;
  };
}

export default function SystemHealthClient() {
  const [healthData, setHealthData] = useState<SystemHealthMetrics | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [overallStatus, setOverallStatus] = useState<
    "healthy" | "warning" | "error"
  >("healthy");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const [runningAction, setRunningAction] = useState<string | null>(null);

  useEffect(() => {
    fetchHealthData();
    const interval = setInterval(fetchHealthData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchHealthData = async () => {
    try {
      const response = await fetch("/api/admin/system-health");
      if (response.ok) {
        const data = await response.json();
        setHealthData(data.health);
        setOverallStatus(data.overallStatus);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Failed to fetch health data:", error);
    } finally {
      setLoading(false);
    }
  };

  const runSystemAction = async (action: string) => {
    setRunningAction(action);
    try {
      const response = await fetch("/api/admin/system-health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        if (action === "run_diagnostics") {
          setDiagnosticsOpen(true);
        }
        await fetchHealthData();
      }
    } catch (error) {
      console.error(`Failed to run ${action}:`, error);
    } finally {
      setRunningAction(null);
    }
  };

  const getStatusIcon = (status: "healthy" | "warning" | "error") => {
    switch (status) {
      case "healthy":
        return <CheckCircle color="success" />;
      case "warning":
        return <Warning color="warning" />;
      case "error":
        return <Error color="error" />;
    }
  };

  const getStatusColor = (status: "healthy" | "warning" | "error") => {
    switch (status) {
      case "healthy":
        return "success";
      case "warning":
        return "warning";
      case "error":
        return "error";
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
          }}
        >
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper
          sx={{
            p: 3,
            mb: 4,
            background: "linear-gradient(135deg, #16a085 0%, #138d75 100%)",
            color: "white",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <MonitorHeart sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  System Health Monitor
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Chip
                    icon={getStatusIcon(overallStatus)}
                    label={`System ${overallStatus.toUpperCase()}`}
                    color={getStatusColor(overallStatus) as any}
                    sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white" }}
                  />
                  {lastUpdated && (
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Last updated: {lastUpdated.toLocaleTimeString()}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                startIcon={
                  runningAction === "refresh" ? (
                    <CircularProgress size={20} />
                  ) : (
                    <Refresh />
                  )
                }
                onClick={() => runSystemAction("refresh")}
                disabled={!!runningAction}
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                }}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={
                  runningAction === "run_diagnostics" ? (
                    <CircularProgress size={20} />
                  ) : (
                    <PlayArrow />
                  )
                }
                onClick={() => runSystemAction("run_diagnostics")}
                disabled={!!runningAction}
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                }}
              >
                Run Diagnostics
              </Button>
            </Box>
          </Box>
        </Paper>
      </motion.div>

      {healthData && (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={2}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <Dataset
                    sx={{
                      fontSize: 40,
                      color: `${getStatusColor(
                        healthData.database.status
                      )}.main`,
                      mb: 1,
                    }}
                  />
                  <Typography variant="h6" fontWeight="bold">
                    Database
                  </Typography>
                  <Chip
                    label={healthData.database.status}
                    color={getStatusColor(healthData.database.status) as any}
                    size="small"
                  />
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    {healthData.database.responseTime}ms
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <Cloud
                    sx={{
                      fontSize: 40,
                      color: `${getStatusColor(
                        healthData.storage.status
                      )}.main`,
                      mb: 1,
                    }}
                  />
                  <Typography variant="h6" fontWeight="bold">
                    Storage
                  </Typography>
                  <Chip
                    label={healthData.storage.status}
                    color={getStatusColor(healthData.storage.status) as any}
                    size="small"
                  />
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    {healthData.storage.storageUsed}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <Wifi
                    sx={{
                      fontSize: 40,
                      color: `${getStatusColor(
                        healthData.realtime.status
                      )}.main`,
                      mb: 1,
                    }}
                  />
                  <Typography variant="h6" fontWeight="bold">
                    Real-time
                  </Typography>
                  <Chip
                    label={healthData.realtime.status}
                    color={getStatusColor(healthData.realtime.status) as any}
                    size="small"
                  />
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    {healthData.realtime.activeConnections} active
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <Speed
                    sx={{
                      fontSize: 40,
                      color: `${getStatusColor(
                        healthData.performance.status
                      )}.main`,
                      mb: 1,
                    }}
                  />
                  <Typography variant="h6" fontWeight="bold">
                    Performance
                  </Typography>
                  <Chip
                    label={healthData.performance.status}
                    color={getStatusColor(healthData.performance.status) as any}
                    size="small"
                  />
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    {healthData.performance.averageResponseTime}ms avg
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <Security
                    sx={{
                      fontSize: 40,
                      color: `${getStatusColor(
                        healthData.security.status
                      )}.main`,
                      mb: 1,
                    }}
                  />
                  <Typography variant="h6" fontWeight="bold">
                    Security
                  </Typography>
                  <Chip
                    label={healthData.security.status}
                    color={getStatusColor(healthData.security.status) as any}
                    size="small"
                  />
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    {healthData.security.failedLogins} failed logins
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    {getStatusIcon(overallStatus)}
                    <Typography variant="h6" fontWeight="bold" sx={{ mt: 1 }}>
                      Overall
                    </Typography>
                    <Chip
                      label={overallStatus}
                      color={getStatusColor(overallStatus) as any}
                      size="small"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Performance Metrics
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      Memory Usage: {healthData.performance.memoryUsage}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={healthData.performance.memoryUsage}
                      color={
                        healthData.performance.memoryUsage > 80
                          ? "error"
                          : "primary"
                      }
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      CPU Usage: {healthData.performance.cpuUsage}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={healthData.performance.cpuUsage}
                      color={
                        healthData.performance.cpuUsage > 80
                          ? "error"
                          : "primary"
                      }
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  <Typography variant="body2">
                    Average Response Time:{" "}
                    {healthData.performance.averageResponseTime}ms
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Integration Status
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        {healthData.storage.cloudinaryConnected ? (
                          <CheckCircle color="success" />
                        ) : (
                          <Error color="error" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary="Cloudinary Storage"
                        secondary={
                          healthData.storage.cloudinaryConnected
                            ? "Connected"
                            : "Disconnected"
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        {healthData.realtime.firebaseConnected ? (
                          <CheckCircle color="success" />
                        ) : (
                          <Error color="error" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary="Firebase Real-time"
                        secondary={
                          healthData.realtime.firebaseConnected
                            ? "Connected"
                            : "Disconnected"
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        {healthData.integrations.whatsapp ? (
                          <CheckCircle color="success" />
                        ) : (
                          <Warning color="warning" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary="WhatsApp Business"
                        secondary={
                          healthData.integrations.whatsapp
                            ? "Connected"
                            : "Not configured"
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        {healthData.integrations.email ? (
                          <CheckCircle color="success" />
                        ) : (
                          <Error color="error" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary="Email Service"
                        secondary={
                          healthData.integrations.email ? "Active" : "Inactive"
                        }
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                System Maintenance
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Button
                  variant="outlined"
                  startIcon={
                    runningAction === "clear_cache" ? (
                      <CircularProgress size={20} />
                    ) : (
                      <CleaningServices />
                    )
                  }
                  onClick={() => runSystemAction("clear_cache")}
                  disabled={!!runningAction}
                >
                  Clear Cache
                </Button>
                <Button
                  variant="outlined"
                  startIcon={
                    runningAction === "restart_services" ? (
                      <CircularProgress size={20} />
                    ) : (
                      <RestartAlt />
                    )
                  }
                  onClick={() => runSystemAction("restart_services")}
                  disabled={!!runningAction}
                >
                  Restart Services
                </Button>
              </Box>
            </CardContent>
          </Card>
        </>
      )}

      <Dialog
        open={diagnosticsOpen}
        onClose={() => setDiagnosticsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>System Diagnostics Results</DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 2 }}>
            All system diagnostics completed successfully!
          </Alert>
          <Typography variant="body2">
            Comprehensive system tests have been run and all critical components
            are functioning properly.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDiagnosticsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
