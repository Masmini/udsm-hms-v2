//src/app/admin/dashboard/admin-dashboard-client.tsx
"use client";

import { useState } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Paper,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
  IconButton,
  Collapse,
  useMediaQuery,
  useTheme,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Box,
  Pagination,
} from "@mui/material";
import {
  People,
  Group,
  Assignment,
  Event,
  Notifications,
  Dashboard as DashboardIcon,
  Assessment,
  HealthAndSafety,
  ExpandLess,
  ExpandMore,
  Menu,
  Search,
  ChevronLeft, // Import ChevronLeft for collapsing
  ChevronRight, // Import ChevronRight for expanding
} from "@mui/icons-material";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Legend,
  ArcElement,
  Tooltip as ChartTooltip,
} from "chart.js";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Legend,
  ArcElement,
  ChartTooltip
);

interface DashboardData {
  stats: {
    totalUsers: number;
    totalHubs: number;
    totalProjects: number;
    totalEvents: number;
    pendingRequests: number;
  };
  recentActivity: { title: string; description: string; createdAt: string }[];
  actionTypes: string[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function AdminDashboardClient({
  data,
}: {
  data: DashboardData;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  // Set sidebar to always open on large screens, controllable by state on mobile
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [hubsOpen, setHubsOpen] = useState(false);
  const [usersOpen, setUsersOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedAction, setSelectedAction] = useState("");

  // Fetch dynamic analytics data
  const {
    data: analyticsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-dashboard-analytics"],
    queryFn: async () => {
      const response = await fetch("/api/admin/dashboard");
      if (!response.ok) throw new Error("Failed to fetch analytics data");
      return response.json();
    },
    refetchInterval: 60000,
    enabled: !!session?.user?.id,
    retry: 2,
  });

  // Mock analytics data
  const mockAnalyticsData = {
    stats: {
      activeUsers: 1800,
      engagementRate: 72,
      growthRate: 15.3,
    },
    chartData: {
      userGrowth: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
          {
            label: "Users",
            data: [1200, 1500, 1800, 2000, 2200, 2500],
            borderColor: "#1976d2",
            fill: false,
          },
        ],
      },
      hubActivity: {
        labels: ["Tech", "Business", "Arts"],
        datasets: [
          {
            data: [40, 30, 30],
            backgroundColor: ["#1976d2", "#388e3c", "#f57c00"],
          },
        ],
      },
      projectCompletion: {
        labels: ["Tech", "Business", "Arts"],
        datasets: [
          {
            label: "Completion %",
            data: [85, 70, 65],
            backgroundColor: "#1976d2",
          },
        ],
      },
    },
  };

  const analytics = error || !analyticsData ? mockAnalyticsData : analyticsData;

  // Handlers
  const handleSidebarToggle = () => setSidebarOpen(!sidebarOpen);
  const handleHubsToggle = () => setHubsOpen(!hubsOpen);
  const handleUsersToggle = () => setUsersOpen(!usersOpen);
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (selectedAction) params.set("action", selectedAction);
    params.set("page", "1");
    router.push(`/admin/dashboard?${params.toString()}`);
  };
  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (selectedAction) params.set("action", selectedAction);
    params.set("page", value.toString());
    router.push(`/admin/dashboard?${params.toString()}`);
  };

  // Modified navItems: Removed "Projects" and "Events"
  const navItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/admin/dashboard" },
    {
      text: "Users",
      icon: <People />,
      subItems: [
        { text: "All Users", path: "/admin/users" },
        { text: "Create User", path: "/admin/users/create" },
      ],
    },
    {
      text: "Hubs",
      icon: <Group />,
      subItems: [
        { text: "All Hubs", path: "/admin/hubs" },
        { text: "Create Hub", path: "/admin/hubs/create" },
      ],
    },
    { text: "Audit Logs", icon: <Assessment />, path: "/admin/audit-logs" },
    {
      text: "System Health",
      icon: <HealthAndSafety />,
      path: "/admin/system-health",
    },
  ];

  const stats = [
    {
      title: "Total Users",
      value: data.stats.totalUsers,
      icon: <People />,
      color: "#1976d2",
      change: `+${analytics.stats.growthRate.toFixed(1)}%`,
      href: "/admin/users",
    },
    {
      title: "Active Users",
      value: analytics.stats.activeUsers,
      icon: <People />,
      color: "#0288d1",
      change: `${analytics.stats.engagementRate.toFixed(1)}% Engagement`,
      href: "/admin/users?filter=active",
    },
    {
      title: "Total Hubs",
      value: data.stats.totalHubs,
      icon: <Group />,
      color: "#388e3c",
      href: "/admin/hubs",
    },
    {
      title: "Total Projects",
      value: data.stats.totalProjects,
      icon: <Assignment />,
      color: "#f57c00",
      href: "/admin/projects",
    },
    {
      title: "Total Events",
      value: data.stats.totalEvents,
      icon: <Event />,
      color: "#7b1fa2",
      href: "/admin/events",
    },
    {
      title: "Pending Requests",
      value: data.stats.pendingRequests,
      icon: <Notifications />,
      color: "#d32f2f",
      href: "/admin/requests",
    },
  ];

  // Sidebar is always open (full width) on large screens
  const sidebarWidth = 280;
  const sidebarTransition = theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  });

  const sidebarContent = (
    <Box
      sx={{
        width: "100%", // Box itself takes 100% of Drawer's width
        bgcolor: "var(--sidebar-background)",
        color: "var(--card-foreground)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        pt: isMobile ? 0 : "16px", // Top margin for persistent sidebar
      }}
    >
      <List sx={{ flexGrow: 1, pt: "32px" }}>
        {" "}
        {/* Increased padding-top here for more margin */}
        {navItems.map((item) => (
          <Box key={item.text}>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                href={item.path || "#"}
                selected={pathname === item.path}
                onClick={
                  item.subItems
                    ? item.text === "Hubs"
                      ? handleHubsToggle
                      : handleUsersToggle
                    : undefined
                }
                sx={{
                  mx: 1,
                  my: 0.5,
                  borderRadius: "8px",
                  "&.Mui-selected": {
                    bgcolor: "var(--primary)",
                    color: "var(--primary-foreground)",
                    "&:hover": { bgcolor: "var(--primary)" },
                  },
                  "&:hover": { bgcolor: "var(--secondary)" },
                  justifyContent: "initial", // Always show text
                }}
              >
                <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} /> {/* Always show text */}
                {item.subItems && // Only show arrows when expanded
                  ((item.text === "Hubs" ? hubsOpen : usersOpen) ? (
                    <ExpandLess />
                  ) : (
                    <ExpandMore />
                  ))}
              </ListItemButton>
            </ListItem>
            {item.subItems && (
              <Collapse
                in={item.text === "Hubs" ? hubsOpen : usersOpen}
                timeout="auto"
                unmountOnExit
              >
                <List component="div" disablePadding>
                  {item.subItems.map((subItem) => (
                    <ListItemButton
                      key={subItem.text}
                      sx={{
                        pl: 6, // Adjusted padding for sub-items
                        borderRadius: "8px",
                        mx: 1,
                        justifyContent: "initial",
                      }}
                      component={Link}
                      href={subItem.path}
                      selected={pathname === subItem.path}
                    >
                      <ListItemText primary={subItem.text} />{" "}
                      {/* Always show text */}
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            )}
          </Box>
        ))}
      </List>
      {/* Sidebar collapse/expand arrow inside the sidebar at the bottom - only for mobile */}
      {isMobile && (
        <Box
          sx={{
            p: 1,
            display: "flex",
            justifyContent: sidebarOpen ? "flex-end" : "center",
            alignItems: "center",
            borderTop: `1px solid var(--border)`, // Optional: add a small divider
            bgcolor: "var(--sidebar-background)",
            position: "sticky", // Makes it stick to the bottom of the scrollable area
            bottom: 0,
            width: "100%",
          }}
        >
          <IconButton
            onClick={handleSidebarToggle}
            sx={{
              color: "var(--foreground)",
              "&:hover": {
                bgcolor: "var(--secondary)",
              },
            }}
          >
            {sidebarOpen ? <ChevronLeft /> : <ChevronRight />}
          </IconButton>
        </Box>
      )}
    </Box>
  );

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          bgcolor: "var(--background)",
        }}
      >
        <CircularProgress size={60} sx={{ color: "var(--primary)" }} />
      </Box>
    );
  }

  if (error) {
    toast.error("Failed to load analytics data; using fallback metrics");
  }

  return (
    <Box
      sx={{ display: "flex", bgcolor: "var(--background)", minHeight: "100vh" }}
    >
      {/* Sidebar Toggle for Mobile */}
      {isMobile && (
        <IconButton
          color="inherit"
          aria-label="Open sidebar"
          edge="start"
          onClick={handleSidebarToggle}
          sx={{
            position: "fixed",
            top: 16,
            left: 16,
            zIndex: 1300,
            bgcolor: "var(--primary)",
            color: "var(--primary-foreground)",
            borderRadius: "8px",
            "&:hover": { bgcolor: "var(--primary-dark)" },
          }}
        >
          <Menu />
        </IconButton>
      )}
      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        open={isMobile ? sidebarOpen : true} // Always open on large screens
        onClose={handleSidebarToggle}
        sx={{
          width: sidebarWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: sidebarWidth,
            boxSizing: "border-box",
            bgcolor: "var(--sidebar-background)",
            color: "var(--card-foreground)",
            boxShadow: "2px 0 5px rgba(0, 0, 0, 0.2)",
            borderRight: `1px solid var(--border)`,
            top: isMobile ? "24" : "72px", // Adjust '64px' to your actual header height
            height: "100%",
            transition: sidebarTransition, // Apply transition to the paper for smooth collapse
            zIndex: 1199, // Set z-index below AppNavigation's Breadcrumbs (1200)
            overflowX: "hidden", // Hide horizontal scrollbar during collapse animation
          },
        }}
      >
        {sidebarContent}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 4 },
          transition: theme.transitions.create(["margin-left", "width"], {
            // Transition for both margin and width
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),

          width: !isMobile ? `calc(100% - ${sidebarWidth}px)` : "100%",
          pt: "64px", // Add padding to the main content to clear the header, if needed
        }}
      >
        <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Paper
              sx={{
                p: { xs: 3, md: 4 },
                mb: 4,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                textAlign: "center",
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                Admin Command Center
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Monitor, manage, and optimize UDSM hubs with real-time insights
              </Typography>
            </Paper>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Paper
              sx={{
                p: 3,
                mb: 4,
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
              }}
            >
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Search activity..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    InputProps={{
                      startAdornment: (
                        <Search sx={{ mr: 1, color: "text.secondary" }} />
                      ),
                    }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Action Type</InputLabel>
                    <Select
                      value={selectedAction}
                      onChange={(e) => setSelectedAction(e.target.value)}
                      label="Action Type"
                      sx={{ borderRadius: "8px" }}
                    >
                      <MenuItem value="">All Actions</MenuItem>
                      {data.actionTypes.map((action) => (
                        <MenuItem key={action} value={action}>
                          {action}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleSearch}
                    sx={{
                      bgcolor: "var(--primary)",
                      color: "var(--primary-foreground)",
                      borderRadius: "8px",
                      "&:hover": { bgcolor: "var(--primary-dark)" },
                    }}
                  >
                    Filter
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" color="text.secondary">
                System Overview
              </Typography>
            </Box>
            <Grid container spacing={3}>
              {stats.map((stat, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        cursor: stat.href ? "pointer" : "default",
                        borderRadius: "12px",
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
                        transition: "transform 0.2s, box-shadow 0.2s",
                        "&:hover": stat.href
                          ? {
                              transform: "translateY(-4px)",
                              boxShadow: "0 8px 30px rgba(0, 0, 0, 0.1)",
                            }
                          : {},
                      }}
                      component={stat.href ? Link : "div"}
                      href={stat.href || ""}
                    >
                      <CardContent sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 2 }}
                        >
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: "8px",
                              bgcolor: `${stat.color}20`,
                              color: stat.color,
                              mr: 2,
                            }}
                          >
                            {stat.icon}
                          </Box>
                          <Typography variant="h6" fontWeight="bold">
                            {stat.title}
                          </Typography>
                        </Box>
                        <Typography
                          variant="h5"
                          fontWeight="bold"
                          color={stat.color}
                        >
                          {stat.value.toLocaleString()}
                        </Typography>
                        {stat.change && (
                          <Chip
                            label={stat.change}
                            size="small"
                            color="success"
                            sx={{
                              mt: 2,
                              bgcolor: `${stat.color}20`,
                              color: stat.color,
                            }}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>

          {/* Pending Requests Alert */}
          {data.stats.pendingRequests > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Alert
                severity="warning"
                sx={{
                  my: 4,
                  borderRadius: "12px",
                  bgcolor: "var(--warning)",
                  color: "var(--warning-foreground)",
                  "& .MuiAlert-icon": { color: "var(--warning-foreground)" },
                }}
                action={
                  <Button
                    color="inherit"
                    size="large"
                    component={Link}
                    href="/admin/requests"
                    sx={{
                      bgcolor: "var(--secondary)",
                      color: "var(--foreground)",
                      borderRadius: "8px",
                      "&:hover": { bgcolor: "var(--secondary-dark)" },
                    }}
                  >
                    Review ({data.stats.pendingRequests})
                  </Button>
                }
              >
                <Typography variant="h6" fontWeight="bold">
                  Pending Requests
                </Typography>
                {data.stats.pendingRequests} requests await your review.
              </Alert>
            </motion.div>
          )}

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" color="text.secondary">
                {data.pagination.total} recent activities
              </Typography>
            </Box>
            {data.recentActivity.length === 0 ? (
              <Paper
                sx={{
                  p: 6,
                  textAlign: "center",
                  borderRadius: "12px",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
                }}
              >
                <Assessment
                  sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
                />
                <Typography variant="h5" gutterBottom>
                  No activity found
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Try adjusting your search or filter criteria.
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {data.recentActivity.map((activity, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card
                        sx={{
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          borderRadius: "12px",
                          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
                          transition: "transform 0.2s, box-shadow 0.2s",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.1)",
                          },
                        }}
                      >
                        <CardContent sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            gutterBottom
                          >
                            {activity.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 2, minHeight: 40 }}
                          >
                            {activity.description.substring(0, 100)}...
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(activity.createdAt).toLocaleString()}
                          </Typography>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            )}
            {data.pagination.totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <Pagination
                  count={data.pagination.totalPages}
                  page={data.pagination.page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </Box>
            )}
          </motion.div>

          {/* Analytics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Box sx={{ mb: 3, mt: 6 }}>
              <Typography variant="h6" color="text.secondary">
                System Analytics
              </Typography>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    borderRadius: "12px",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
                    p: { xs: 2, md: 3 },
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      User Growth Trend
                    </Typography>
                    <Box sx={{ minHeight: 200 }}>
                      <Line
                        data={analytics.chartData.userGrowth}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: "top",
                              labels: { color: "var(--foreground)" },
                            },
                            tooltip: {
                              backgroundColor: "var(--card)",
                              bodyColor: "var(--foreground)",
                            },
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              grid: { color: "var(--border)" },
                              ticks: { color: "var(--foreground)" },
                            },
                            x: {
                              grid: { display: false },
                              ticks: { color: "var(--foreground)" },
                            },
                          },
                        }}
                        height={200}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    borderRadius: "12px",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
                    p: { xs: 2, md: 3 },
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Hub Activity Distribution
                    </Typography>
                    <Box sx={{ minHeight: 200 }}>
                      <Doughnut
                        data={analytics.chartData.hubActivity}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: "bottom",
                              labels: { color: "var(--foreground)" },
                            },
                            tooltip: {
                              backgroundColor: "var(--card)",
                              bodyColor: "var(--foreground)",
                            },
                          },
                        }}
                        height={200}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card
                  sx={{
                    borderRadius: "12px",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
                    p: { xs: 2, md: 3 },
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Project Completion Rates
                    </Typography>
                    <Box sx={{ minHeight: 200 }}>
                      <Bar
                        data={analytics.chartData.projectCompletion}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: "top",
                              labels: { color: "var(--foreground)" },
                            },
                            tooltip: {
                              backgroundColor: "var(--card)",
                              bodyColor: "var(--foreground)",
                            },
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              max: 100,
                              grid: { color: "var(--border)" },
                              ticks: {
                                color: "var(--foreground)",
                                callback: (value) => `${value}%`,
                              },
                            },
                            x: {
                              grid: { display: false },
                              ticks: { color: "var(--foreground)" },
                            },
                          },
                        }}
                        height={200}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
}
