//src/app/admin/dashboard/admin-dashboard-client.tsx
"use client";

import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Paper,
  Chip,
  Button,
} from "@mui/material";
import {
  People,
  Group,
  Assignment,
  Event,
  TrendingUp,
  Warning,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import Link from "next/link";

interface DashboardData {
  stats: {
    totalUsers: number;
    totalHubs: number;
    totalProjects: number;
    totalEvents: number;
    pendingRequests: number;
  };
  recentUsers: any[];
  recentHubs: any[];
}

export default function AdminDashboardClient({
  data,
}: {
  data: DashboardData;
}) {
  const stats = [
    {
      title: "Total Users",
      value: data.stats.totalUsers,
      icon: <People />,
      color: "#1976d2",
      href: "/admin/users",
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
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper
          sx={{
            p: 3,
            mb: 4,
            background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
            color: "white",
          }}
        >
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Admin Dashboard
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            UDSM Hub Management System Overview
          </Typography>
        </Paper>
      </motion.div>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card
                sx={{
                  height: "100%",
                  cursor: "pointer",
                  transition: "transform 0.2s",
                  "&:hover": { transform: "translateY(-4px)" },
                }}
                component={Link}
                href={stat.href}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 2,
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
                  <Typography variant="h3" fontWeight="bold" color={stat.color}>
                    {stat.value}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Pending Requests Alert */}
      {data.stats.pendingRequests > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card
            sx={{
              mb: 4,
              bgcolor: "warning.light",
              color: "warning.contrastText",
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Warning sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      Pending Requests
                    </Typography>
                    <Typography variant="body2">
                      {data.stats.pendingRequests} membership requests need your
                      attention
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  color="warning"
                  component={Link}
                  href="/admin/requests"
                >
                  Review Requests
                </Button>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Recent Users
                </Typography>
                <List>
                  {data.recentUsers.map((user, index) => (
                    <ListItem
                      key={user.id}
                      divider={index < data.recentUsers.length - 1}
                    >
                      <ListItemAvatar>
                        <Avatar src={user.profilePicture}>
                          {user.firstName[0]}
                          {user.lastName[0]}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${user.firstName} ${user.lastName}`}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {user.email}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mt: 0.5,
                              }}
                            >
                              <Chip
                                label={user.role}
                                size="small"
                                color={
                                  user.role === "ADMIN" ? "error" : "primary"
                                }
                                sx={{ mr: 1 }}
                              />
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {new Date(user.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
                <Button
                  fullWidth
                  variant="outlined"
                  component={Link}
                  href="/admin/users"
                  sx={{ mt: 2 }}
                >
                  View All Users
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Recent Hubs
                </Typography>
                <List>
                  {data.recentHubs.map((hub, index) => (
                    <ListItem
                      key={hub.id}
                      divider={index < data.recentHubs.length - 1}
                    >
                      <ListItemAvatar>
                        <Avatar src={hub.logo}>{hub.name[0]}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={hub.name}
                        secondary={
                          <Box>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              noWrap
                            >
                              {hub.description}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mt: 0.5,
                              }}
                            >
                              <Chip
                                label={`${hub._count.members} members`}
                                size="small"
                                color="primary"
                                sx={{ mr: 1 }}
                              />
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {new Date(hub.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
                <Button
                  fullWidth
                  variant="outlined"
                  component={Link}
                  href="/admin/hubs"
                  sx={{ mt: 2 }}
                >
                  View All Hubs
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Container>
  );
}
