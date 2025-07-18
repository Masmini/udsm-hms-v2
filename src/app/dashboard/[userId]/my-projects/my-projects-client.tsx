"use client";

import { useState } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  Avatar,
  Paper,
  Box,
  TextField,
  InputAdornment,
  LinearProgress,
  AvatarGroup,
} from "@mui/material";
import {
  Assignment,
  Search,
  OpenInNew,
  Task,
  Group,
  TrendingUp,
  CalendarToday,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import Link from "next/link";

interface ProjectMembership {
  id: string;
  role: string;
  joinedAt: Date;
  project: {
    id: string;
    title: string;
    description: string;
    coverImage?: string | null;
    status: string;
    priority: string;
    completionRate: number;
    startDate?: Date | null;
    endDate?: Date | null;
    hub: {
      id: string;
      name: string;
      logo?: string | null;
    };
    tasks: {
      id: string;
      title: string;
      status: string;
      dueDate?: Date | null;
    }[];
    members: {
      user: {
        id: string;
        firstName: string;
        lastName: string;
        profilePicture?: string | null;
      };
    }[];
    progressReports: {
      id: string;
      title: string;
      createdAt: Date;
    }[];
    _count: {
      tasks: number;
      members: number;
    };
  };
}

interface MyProjectsClientProps {
  projectMemberships: ProjectMembership[];
  userId: string;
}

export default function MyProjectsClient({
  projectMemberships,
  userId,
}: MyProjectsClientProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProjects = projectMemberships.filter(
    (membership) =>
      membership.project.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      membership.project.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      membership.project.hub.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "success";
      case "IN_PROGRESS":
        return "primary";
      case "ON_HOLD":
        return "warning";
      case "CANCELLED":
        return "error";
      default:
        return "default";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "error";
      case "HIGH":
        return "warning";
      case "MEDIUM":
        return "info";
      case "LOW":
        return "success";
      default:
        return "default";
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case "DONE":
        return "success";
      case "IN_PROGRESS":
        return "warning";
      case "REVIEW":
        return "info";
      default:
        return "default";
    }
  };

  const totalTasks = projectMemberships.reduce(
    (sum, p) => sum + p.project.tasks.length,
    0
  );
  const completedTasks = projectMemberships.reduce(
    (sum, p) => sum + p.project.tasks.filter((t) => t.status === "DONE").length,
    0
  );

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
            p: 4,
            mb: 4,
            background: "linear-gradient(135deg, #7b1fa2 0%, #4a148c 100%)",
            color: "white",
            textAlign: "center",
          }}
        >
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            My Projects
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Track your project contributions and progress
          </Typography>
        </Paper>
      </motion.div>

      {/* Search and Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Paper sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Search your projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                component={Link}
                href="/projects"
                startIcon={<OpenInNew />}
              >
                Explore All Projects
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </motion.div>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Assignment color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {projectMemberships.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Projects
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Task color="secondary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{totalTasks}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Assigned Tasks
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <TrendingUp color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{completedTasks}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed Tasks
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <TrendingUp color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {totalTasks > 0
                      ? Math.round((completedTasks / totalTasks) * 100)
                      : 0}
                    %
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completion Rate
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Projects Grid */}
      <Grid container spacing={3}>
        {filteredProjects.map((membership, index) => (
          <Grid item xs={12} md={6} lg={4} key={membership.id}>
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
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
                  },
                }}
              >
                {membership.project.coverImage ? (
                  <CardMedia
                    component="img"
                    height="160"
                    image={membership.project.coverImage}
                    alt={membership.project.title}
                    sx={{ objectFit: "cover" }}
                  />
                ) : (
                  <Box
                    sx={{
                      height: 160,
                      bgcolor: "primary.main",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Assignment sx={{ fontSize: 48, color: "white" }} />
                  </Box>
                )}

                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar
                      src={membership.project.hub.logo ?? undefined}
                      sx={{ width: 24, height: 24, mr: 1 }}
                    >
                      {membership.project.hub.name[0]}
                    </Avatar>
                    <Typography variant="caption" color="text.secondary">
                      {membership.project.hub.name}
                    </Typography>
                  </Box>

                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {membership.project.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2, minHeight: 40 }}
                  >
                    {membership.project.description.substring(0, 100)}...
                  </Typography>

                  {/* Status and Priority */}
                  <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                    <Chip
                      label={membership.project.status.replace("_", " ")}
                      size="small"
                      color={getStatusColor(membership.project.status) as any}
                    />
                    <Chip
                      label={membership.project.priority}
                      size="small"
                      color={
                        getPriorityColor(membership.project.priority) as any
                      }
                      variant="outlined"
                    />
                  </Box>

                  {/* Progress */}
                  <Box sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Progress
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {membership.project.completionRate}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={membership.project.completionRate}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>

                  {/* Team Members */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <AvatarGroup
                      max={4}
                      sx={{
                        "& .MuiAvatar-root": {
                          width: 24,
                          height: 24,
                          fontSize: "0.75rem",
                        },
                      }}
                    >
                      {membership.project.members.map((member) => (
                        <Avatar
                          key={member.user.id}
                          src={member.user.profilePicture ?? undefined}
                          alt={`${member.user.firstName} ${member.user.lastName}`}
                        >
                          {member.user.firstName[0]}
                        </Avatar>
                      ))}
                    </AvatarGroup>
                    <Typography variant="caption" color="text.secondary">
                      {membership.project._count.members} members
                    </Typography>
                  </Box>

                  {/* My Tasks */}
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      gutterBottom
                    >
                      My Tasks ({membership.project.tasks.length})
                    </Typography>
                    {membership.project.tasks.slice(0, 2).map((task) => (
                      <Box
                        key={task.id}
                        sx={{ display: "flex", alignItems: "center", mb: 0.5 }}
                      >
                        <Chip
                          label={task.status.replace("_", " ")}
                          size="small"
                          color={getTaskStatusColor(task.status) as any}
                          sx={{ mr: 1, minWidth: 60 }}
                        />
                        <Typography variant="caption" sx={{ flexGrow: 1 }}>
                          {task.title.substring(0, 30)}...
                        </Typography>
                      </Box>
                    ))}
                    {membership.project.tasks.length > 2 && (
                      <Typography variant="caption" color="text.secondary">
                        +{membership.project.tasks.length - 2} more tasks
                      </Typography>
                    )}
                  </Box>

                  {/* Dates */}
                  {membership.project.startDate && (
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <CalendarToday
                        sx={{ fontSize: 14, mr: 1, color: "text.secondary" }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        Started:{" "}
                        {new Date(
                          membership.project.startDate
                        ).toLocaleDateString()}
                      </Typography>
                    </Box>
                  )}

                  <Button
                    fullWidth
                    variant="contained"
                    component={Link}
                    href={`/dashboard/${userId}/my-projects/${membership.project.id}`}
                    sx={{ mt: "auto" }}
                  >
                    View Project
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Paper sx={{ p: 6, textAlign: "center" }}>
            <Assignment sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              {searchTerm ? "No projects found" : "No projects yet"}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {searchTerm
                ? "Try adjusting your search criteria."
                : "Join projects to collaborate and build your portfolio."}
            </Typography>
            <Button
              variant="contained"
              component={Link}
              href="/projects"
              size="large"
            >
              Explore Projects
            </Button>
          </Paper>
        </motion.div>
      )}
    </Container>
  );
}
