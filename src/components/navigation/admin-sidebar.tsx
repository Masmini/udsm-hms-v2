// src/components/navigation/admin-sidebar.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Toolbar,
  IconButton,
  Box,
  Typography,
  Divider,
  Chip,
  Avatar,
  Tooltip,
  useMediaQuery,
  useTheme,
  Button,
  CircularProgress,
} from "@mui/material";
import {
  Dashboard,
  People,
  Group,
  Assessment,
  HealthAndSafety,
  ExpandLess,
  ExpandMore,
  Menu,
  AutoAwesome,
  Close,
  ThumbUp,
  ThumbDown,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { aiInsightsService } from "@/lib/ai-insights";

interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  confidence: number;
  priority: "low" | "medium" | "high";
  actionUrl?: string;
}

export default function AdminSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [open, setOpen] = useState(!isMobile);
  const [hubsOpen, setHubsOpen] = useState(false);
  const [usersOpen, setUsersOpen] = useState(false);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>(
    []
  );
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [loadingPath, setLoadingPath] = useState<string | null>(null);

  useEffect(() => {
    // Fetch AI recommendations for the sidebar
    const fetchRecommendations = async () => {
      try {
        const metrics = {
          totalUsers: 2500,
          activeUsers: 1800,
          totalHubs: 12,
          totalProjects: 156,
          totalEvents: 89,
          engagementRate: 72,
          growthRate: 15.3,
        };
        const insights = await aiInsightsService.generateSystemInsights(
          metrics
        );
        setRecommendations(
          insights.slice(0, 3).map((insight, idx) => ({
            id: `insight-${idx}`,
            title: insight.title,
            description: insight.description,
            confidence: insight.confidence,
            priority: insight.priority,
            actionUrl: insight.actionable ? "/admin/dashboard" : undefined,
          }))
        );
      } catch (error) {
        console.error("Error fetching AI recommendations:", error);
      }
    };
    fetchRecommendations();
  }, []);

  useEffect(() => {
    // Reset loading state when pathname changes (navigation complete)
    setLoadingPath(null);
  }, [pathname]);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleHubsToggle = () => {
    setHubsOpen(!hubsOpen);
  };

  const handleUsersToggle = () => {
    setUsersOpen(!usersOpen);
  };

  const handleDismissRecommendation = (id: string) => {
    setDismissedIds((prev) => new Set(prev).add(id));
  };

  const handleFeedback = async (id: string, feedback: "liked" | "disliked") => {
    try {
      await fetch("/api/ai/recommendation-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recommendationId: id,
          feedback,
          userId: session?.user?.id,
        }),
      });
      if (feedback === "disliked") {
        setDismissedIds((prev) => new Set(prev).add(id));
      }
    } catch (error) {
      console.error("Error sending feedback:", error);
    }
  };

  const handleNavigation = (path: string) => {
    if (path !== pathname) {
      setLoadingPath(path); // Set loading state for the clicked path
      router.push(path); // Trigger navigation
    }
  };

  const navItems = [
    {
      text: "Dashboard",
      icon: <Dashboard />,
      path: "/admin/dashboard",
    },
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
    {
      text: "Audit Logs",
      icon: <Assessment />,
      path: "/admin/audit-logs",
    },
    {
      text: "System Health",
      icon: <HealthAndSafety />,
      path: "/admin/system-health",
    },
  ];

  const drawerContent = (
    <Box sx={{ width: 250, overflow: "auto" }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Admin Panel
        </Typography>
        {isMobile && (
          <IconButton onClick={handleDrawerToggle}>
            <Close />
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      <List>
        {navItems.map((item) => (
          <Box key={item.text}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() =>
                  item.subItems
                    ? item.text === "Hubs"
                      ? handleHubsToggle()
                      : handleUsersToggle()
                    : handleNavigation(item.path || "#")
                }
                selected={pathname === item.path}
                disabled={loadingPath === item.path}
                sx={{
                  "&.Mui-selected": {
                    backgroundColor: "primary.light",
                    "&:hover": { backgroundColor: "primary.light" },
                  },
                  "&.Mui-disabled": {
                    opacity: 0.6,
                  },
                }}
              >
                <ListItemIcon>
                  {loadingPath === item.path ? (
                    <CircularProgress size={24} thickness={4} />
                  ) : (
                    item.icon
                  )}
                </ListItemIcon>
                <ListItemText primary={item.text} />
                {item.subItems && (
                  <>
                    {item.text === "Hubs" ? (
                      hubsOpen ? (
                        <ExpandLess />
                      ) : (
                        <ExpandMore />
                      )
                    ) : usersOpen ? (
                      <ExpandLess />
                    ) : (
                      <ExpandMore />
                    )}
                  </>
                )}
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
                      sx={{ pl: 4 }}
                      onClick={() => handleNavigation(subItem.path)}
                      selected={pathname === subItem.path}
                      disabled={loadingPath === subItem.path}
                    >
                      <ListItemIcon>
                        {loadingPath === subItem.path ? (
                          <CircularProgress size={24} thickness={4} />
                        ) : (
                          <Box sx={{ width: 24, height: 24 }} /> // Placeholder to align text
                        )}
                      </ListItemIcon>
                      <ListItemText primary={subItem.text} />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            )}
          </Box>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          AI Insights
        </Typography>
        {recommendations.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No insights available. Check back later.
          </Typography>
        ) : (
          recommendations
            .filter((rec) => !dismissedIds.has(rec.id))
            .map((rec) => (
              <Box sx={{ mb: 2 }} key={rec.id}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <AutoAwesome sx={{ color: "primary.main", mr: 1 }} />
                    <Typography variant="body2" fontWeight="medium">
                      {rec.title}
                    </Typography>
                    <Chip
                      label={`${Math.round(rec.confidence * 100)}%`}
                      size="small"
                      color={
                        rec.priority === "high"
                          ? "error"
                          : rec.priority === "medium"
                          ? "warning"
                          : "success"
                      }
                      sx={{ ml: 1 }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {rec.description}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                    {rec.actionUrl && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleNavigation(rec.actionUrl!)}
                        disabled={loadingPath === rec.actionUrl}
                      >
                        {loadingPath === rec.actionUrl ? (
                          <CircularProgress size={20} thickness={4} />
                        ) : (
                          "View"
                        )}
                      </Button>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => handleFeedback(rec.id, "liked")}
                    >
                      <ThumbUp fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleFeedback(rec.id, "disliked")}
                    >
                      <ThumbDown fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDismissRecommendation(rec.id)}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </Box>
                </motion.div>
              </Box>
            ))
        )}
      </Box>
    </Box>
  );

  return (
    <>
      {isMobile && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ position: "fixed", top: 16, left: 16, zIndex: 1300 }}
        >
          <Menu />
        </IconButton>
      )}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={open}
        onClose={handleDrawerToggle}
        sx={{
          width: 250,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 250,
            boxSizing: "border-box",
            backgroundColor: "background.default",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}
