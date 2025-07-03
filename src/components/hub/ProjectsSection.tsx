"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Button,
  LinearProgress,
  Avatar,
  AvatarGroup,
  Skeleton,
  IconButton,
  TextField,
  Divider,
} from "@mui/material";
import {
  FolderOpen,
  Calendar,
  Users,
  Target,
  TrendingUp,
  MessageCircle,
  Send,
  Code,
  Lightbulb,
} from "lucide-react";
import { motion } from "framer-motion";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { useNotification } from "@/components/providers/notification-provider";
import { useSession } from "next-auth/react";

interface Project {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  status: string;
  priority: string;
  completionRate: number;
  startDate?: string;
  endDate?: string;
  skills: string[];
  technologies: string[];
  members: Array<{
    user: {
      id: string;
      firstName: string;
      lastName: string;
      profilePicture?: string;
    };
  }>;
  _count: {
    members: number;
    tasks: number;
  };
  commentsCount?: number;
}

interface ProjectsSectionProps {
  hubId: string;
  isHubMember: boolean;
}

export default function ProjectsSection({
  hubId,
  isHubMember,
}: ProjectsSectionProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { showNotification } = useNotification();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(
    new Set()
  );
  const [commentTexts, setCommentTexts] = useState<{ [key: string]: string }>(
    {}
  );

  useEffect(() => {
    fetchProjects();
  }, [hubId]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/hubs/${hubId}/projects`);
      if (response.ok) {
        const data = await response.json();
        setProjects(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      showNotification("Failed to load projects", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleComment = async (projectId: string) => {
    if (!session?.user?.id) {
      showNotification("Please sign in to comment", "warning");
      return;
    }

    const commentText = commentTexts[projectId]?.trim();
    if (!commentText) return;

    try {
      const response = await fetch(`/api/projects/${projectId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          content: commentText,
        }),
      });

      if (response.ok) {
        setCommentTexts((prev) => ({ ...prev, [projectId]: "" }));
        showNotification("Comment added successfully!", "success");

        // Update comment count
        setProjects((prevProjects) =>
          prevProjects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  commentsCount: (project.commentsCount || 0) + 1,
                }
              : project
          )
        );
      }
    } catch (error) {
      showNotification("Failed to add comment", "error");
    }
  };

  const toggleComments = (projectId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedComments(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PLANNING":
        return "info";
      case "IN_PROGRESS":
        return "primary";
      case "ON_HOLD":
        return "warning";
      case "COMPLETED":
        return "success";
      case "CANCELLED":
        return "error";
      default:
        return "default";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "LOW":
        return "success";
      case "MEDIUM":
        return "warning";
      case "HIGH":
        return "error";
      case "URGENT":
        return "error";
      default:
        return "default";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} md={6} lg={4} key={i}>
              <Card>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" height={32} />
                  <Skeleton variant="text" height={20} />
                  <Skeleton variant="text" height={20} width="60%" />
                  <Skeleton variant="rectangular" height={8} sx={{ mt: 2 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (projects.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <FolderOpen size={48} color="#ccc" />
        <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
          No projects found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This hub hasn't created any projects yet.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {projects.map((project, index) => {
          const isCommentExpanded = expandedComments.has(project.id);

          return (
            <Grid item xs={12} md={6} lg={4} key={project.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 4,
                    },
                  }}
                >
                  {project.coverImage && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={project.coverImage}
                      alt={project.title}
                      sx={{ objectFit: "cover" }}
                    />
                  )}

                  <CardContent
                    sx={{ flex: 1, display: "flex", flexDirection: "column" }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 2,
                      }}
                    >
                      <Chip
                        label={project.status.replace("_", " ")}
                        color={getStatusColor(project.status) as any}
                        size="small"
                        sx={{ textTransform: "capitalize" }}
                      />
                      <Chip
                        label={project.priority}
                        color={getPriorityColor(project.priority) as any}
                        variant="outlined"
                        size="small"
                      />
                    </Box>

                    <Typography variant="h6" component="h3" gutterBottom>
                      {project.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {project.description}
                    </Typography>

                    {/* Progress */}
                    <Box sx={{ mb: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Progress
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {Math.round(project.completionRate)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={project.completionRate}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>

                    {/* Project Info */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <Users size={16} />
                      <Typography variant="body2" color="text.secondary">
                        {project._count.members} members
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      <Target size={16} />
                      <Typography variant="body2" color="text.secondary">
                        {project._count.tasks} tasks
                      </Typography>
                    </Box>

                    {/* Dates */}
                    {project.startDate && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <Calendar size={16} />
                        <Typography variant="body2" color="text.secondary">
                          Started: {formatDate(project.startDate)}
                        </Typography>
                      </Box>
                    )}

                    {project.endDate && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 2,
                        }}
                      >
                        <Calendar size={16} />
                        <Typography variant="body2" color="text.secondary">
                          Due: {formatDate(project.endDate)}
                        </Typography>
                      </Box>
                    )}

                    {/* Skills & Technologies */}
                    {project.skills.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          Skills:
                        </Typography>
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                        >
                          {project.skills.slice(0, 3).map((skill) => (
                            <Chip
                              key={skill}
                              label={skill}
                              size="small"
                              variant="outlined"
                              icon={<Lightbulb size={12} />}
                            />
                          ))}
                          {project.skills.length > 3 && (
                            <Chip
                              label={`+${project.skills.length - 3}`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </Box>
                    )}

                    {project.technologies.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          Technologies:
                        </Typography>
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                        >
                          {project.technologies.slice(0, 3).map((tech) => (
                            <Chip
                              key={tech}
                              label={tech}
                              size="small"
                              color="primary"
                              variant="outlined"
                              icon={<Code size={12} />}
                            />
                          ))}
                          {project.technologies.length > 3 && (
                            <Chip
                              label={`+${project.technologies.length - 3}`}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </Box>
                    )}

                    {/* Team Members */}
                    {project.members.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          Team:
                        </Typography>
                        <AvatarGroup
                          max={4}
                          sx={{ justifyContent: "flex-start" }}
                        >
                          {project.members.map((member) => (
                            <Avatar
                              key={member.user.id}
                              src={member.user.profilePicture}
                              sx={{ width: 32, height: 32 }}
                              title={`${member.user.firstName} ${member.user.lastName}`}
                            >
                              {member.user.firstName.charAt(0)}
                            </Avatar>
                          ))}
                        </AvatarGroup>
                      </Box>
                    )}

                    <Box sx={{ mt: "auto" }}>
                      {/* Comment Section */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 2,
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => toggleComments(project.id)}
                        >
                          <MessageCircle size={20} />
                        </IconButton>
                        <Typography variant="body2" color="text.secondary">
                          {project.commentsCount || 0} comments
                        </Typography>
                      </Box>

                      {isCommentExpanded && (
                        <Box sx={{ mb: 2 }}>
                          <Divider sx={{ mb: 2 }} />
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Avatar
                              src={session?.user?.profilePicture || undefined}
                              sx={{ width: 32, height: 32 }}
                            >
                              {session?.user?.firstName?.charAt(0)}
                            </Avatar>
                            <TextField
                              fullWidth
                              size="small"
                              placeholder="Write a comment..."
                              value={commentTexts[project.id] || ""}
                              onChange={(e) =>
                                setCommentTexts((prev) => ({
                                  ...prev,
                                  [project.id]: e.target.value,
                                }))
                              }
                              onKeyPress={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  handleComment(project.id);
                                }
                              }}
                              InputProps={{
                                endAdornment: (
                                  <IconButton
                                    size="small"
                                    onClick={() => handleComment(project.id)}
                                    disabled={!commentTexts[project.id]?.trim()}
                                  >
                                    <Send size={16} />
                                  </IconButton>
                                ),
                              }}
                            />
                          </Box>
                        </Box>
                      )}

                      <EnhancedButton
                        variant="contained"
                        fullWidth
                        onClick={() => router.push(`/projects/${project.id}`)}
                        size="small"
                      >
                        View Details
                      </EnhancedButton>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
