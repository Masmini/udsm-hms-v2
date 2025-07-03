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
  Avatar,
  AvatarGroup,
  Skeleton,
  IconButton,
  TextField,
  Divider,
} from "@mui/material";
import {
  BookOpen,
  Calendar,
  Users,
  Clock,
  Award,
  MessageCircle,
  Send,
  CheckCircle,
  GraduationCap,
} from "lucide-react";
import { motion } from "framer-motion";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { useNotification } from "@/components/providers/notification-provider";
import { useSession } from "next-auth/react";

interface Programme {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  duration?: string;
  certificationType?: string;
  maxParticipants?: number;
  applicationDeadline?: string;
  startDate?: string;
  endDate?: string;
  prerequisites: string[];
  learningOutcomes: string[];
  members: Array<{
    user: {
      id: string;
      firstName: string;
      lastName: string;
      profilePicture?: string;
    };
    progress: number;
  }>;
  supervisors: Array<{
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  }>;
  _count: {
    members: number;
  };
  commentsCount?: number;
}

interface ProgrammesSectionProps {
  hubId: string;
  isHubMember: boolean;
}

export default function ProgrammesSection({
  hubId,
  isHubMember,
}: ProgrammesSectionProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { showNotification } = useNotification();

  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(
    new Set()
  );
  const [commentTexts, setCommentTexts] = useState<{ [key: string]: string }>(
    {}
  );

  useEffect(() => {
    fetchProgrammes();
  }, [hubId]);

  const fetchProgrammes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/hubs/${hubId}/programmes`);
      if (response.ok) {
        const data = await response.json();
        setProgrammes(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching programmes:", error);
      showNotification("Failed to load programmes", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleComment = async (programmeId: string) => {
    if (!session?.user?.id) {
      showNotification("Please sign in to comment", "warning");
      return;
    }

    const commentText = commentTexts[programmeId]?.trim();
    if (!commentText) return;

    try {
      const response = await fetch(`/api/programmes/${programmeId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          content: commentText,
        }),
      });

      if (response.ok) {
        setCommentTexts((prev) => ({ ...prev, [programmeId]: "" }));
        showNotification("Comment added successfully!", "success");

        // Update comment count
        setProgrammes((prevProgrammes) =>
          prevProgrammes.map((programme) =>
            programme.id === programmeId
              ? {
                  ...programme,
                  commentsCount: (programme.commentsCount || 0) + 1,
                }
              : programme
          )
        );
      }
    } catch (error) {
      showNotification("Failed to add comment", "error");
    }
  };

  const toggleComments = (programmeId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(programmeId)) {
      newExpanded.delete(programmeId);
    } else {
      newExpanded.add(programmeId);
    }
    setExpandedComments(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getApplicationStatus = (deadline?: string) => {
    if (!deadline) return { status: "open", color: "success" };

    const now = new Date();
    const deadlineDate = new Date(deadline);

    if (now > deadlineDate) return { status: "closed", color: "error" };

    const daysLeft = Math.ceil(
      (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysLeft <= 7) return { status: "closing soon", color: "warning" };

    return { status: "open", color: "success" };
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
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (programmes.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <BookOpen size={48} color="#ccc" />
        <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
          No programmes found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This hub hasn't created any programmes yet.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {programmes.map((programme, index) => {
          const isCommentExpanded = expandedComments.has(programme.id);
          const applicationStatus = getApplicationStatus(
            programme.applicationDeadline
          );

          return (
            <Grid item xs={12} md={6} lg={4} key={programme.id}>
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
                  {programme.coverImage && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={programme.coverImage}
                      alt={programme.title}
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
                        label={applicationStatus.status}
                        color={applicationStatus.color as any}
                        size="small"
                        sx={{ textTransform: "capitalize" }}
                      />
                      {programme.certificationType && (
                        <Chip
                          label={programme.certificationType}
                          variant="outlined"
                          size="small"
                          icon={<Award size={12} />}
                        />
                      )}
                    </Box>

                    <Typography variant="h6" component="h3" gutterBottom>
                      {programme.title}
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
                      {programme.description}
                    </Typography>

                    {/* Programme Info */}
                    {programme.duration && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <Clock size={16} />
                        <Typography variant="body2" color="text.secondary">
                          Duration: {programme.duration}
                        </Typography>
                      </Box>
                    )}

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
                        {programme._count.members} participants
                        {programme.maxParticipants &&
                          ` / ${programme.maxParticipants} max`}
                      </Typography>
                    </Box>

                    {/* Dates */}
                    {programme.applicationDeadline && (
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
                          Apply by: {formatDate(programme.applicationDeadline)}
                        </Typography>
                      </Box>
                    )}

                    {programme.startDate && (
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
                          Starts: {formatDate(programme.startDate)}
                        </Typography>
                      </Box>
                    )}

                    {/* Prerequisites */}
                    {programme.prerequisites.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          Prerequisites:
                        </Typography>
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                        >
                          {programme.prerequisites.slice(0, 2).map((prereq) => (
                            <Chip
                              key={prereq}
                              label={prereq}
                              size="small"
                              variant="outlined"
                              icon={<CheckCircle size={12} />}
                            />
                          ))}
                          {programme.prerequisites.length > 2 && (
                            <Chip
                              label={`+${programme.prerequisites.length - 2}`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </Box>
                    )}

                    {/* Learning Outcomes */}
                    {programme.learningOutcomes.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          Learning Outcomes:
                        </Typography>
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                        >
                          {programme.learningOutcomes
                            .slice(0, 2)
                            .map((outcome) => (
                              <Chip
                                key={outcome}
                                label={outcome}
                                size="small"
                                color="primary"
                                variant="outlined"
                                icon={<GraduationCap size={12} />}
                              />
                            ))}
                          {programme.learningOutcomes.length > 2 && (
                            <Chip
                              label={`+${
                                programme.learningOutcomes.length - 2
                              }`}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </Box>
                    )}

                    {/* Supervisors */}
                    {programme.supervisors.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          Instructors:
                        </Typography>
                        <AvatarGroup
                          max={3}
                          sx={{ justifyContent: "flex-start" }}
                        >
                          {programme.supervisors.map((supervisor) => (
                            <Avatar
                              key={supervisor.id}
                              src={supervisor.profilePicture}
                              sx={{ width: 32, height: 32 }}
                              title={`${supervisor.firstName} ${supervisor.lastName}`}
                            >
                              {supervisor.firstName.charAt(0)}
                            </Avatar>
                          ))}
                        </AvatarGroup>
                      </Box>
                    )}

                    {/* Participants */}
                    {programme.members.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          Participants:
                        </Typography>
                        <AvatarGroup
                          max={4}
                          sx={{ justifyContent: "flex-start" }}
                        >
                          {programme.members.map((member) => (
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
                          onClick={() => toggleComments(programme.id)}
                        >
                          <MessageCircle size={20} />
                        </IconButton>
                        <Typography variant="body2" color="text.secondary">
                          {programme.commentsCount || 0} comments
                        </Typography>
                      </Box>

                      {isCommentExpanded && (
                        <Box sx={{ mb: 2 }}>
                          <Divider sx={{ mb: 2 }} />
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Avatar
                              src={session?.user?.profilePicture ?? undefined}
                              sx={{ width: 32, height: 32 }}
                            >
                              {session?.user?.firstName?.charAt(0)}
                            </Avatar>
                            <TextField
                              fullWidth
                              size="small"
                              placeholder="Write a comment..."
                              value={commentTexts[programme.id] || ""}
                              onChange={(e) =>
                                setCommentTexts((prev) => ({
                                  ...prev,
                                  [programme.id]: e.target.value,
                                }))
                              }
                              onKeyPress={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  handleComment(programme.id);
                                }
                              }}
                              InputProps={{
                                endAdornment: (
                                  <IconButton
                                    size="small"
                                    onClick={() => handleComment(programme.id)}
                                    disabled={
                                      !commentTexts[programme.id]?.trim()
                                    }
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
                        onClick={() =>
                          router.push(`/programmes/${programme.id}`)
                        }
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
