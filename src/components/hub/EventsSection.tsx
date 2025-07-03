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
  IconButton,
  TextField,
  Avatar,
  Divider,
  Skeleton,
} from "@mui/material";
import {
  Calendar,
  MapPin,
  Users,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { useNotification } from "@/components/providers/notification-provider";
import { useSession } from "next-auth/react";

interface Event {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  startDate: string;
  endDate?: string;
  venue?: string;
  eventType: string;
  capacity?: number;
  _count: {
    registrations: number;
  };
  likesCount?: number;
  commentsCount?: number;
}

interface EventsSectionProps {
  hubId: string;
  isHubMember: boolean;
}

export default function EventsSection({
  hubId,
  isHubMember,
}: EventsSectionProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { showNotification } = useNotification();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(
    new Set()
  );
  const [commentTexts, setCommentTexts] = useState<{ [key: string]: string }>(
    {}
  );
  const [likedEvents, setLikedEvents] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchEvents();
  }, [hubId]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/hubs/${hubId}/events`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      showNotification("Failed to load events", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (eventId: string) => {
    if (!session?.user?.id) {
      showNotification("Please sign in to like events", "warning");
      return;
    }

    try {
      const isLiked = likedEvents.has(eventId);
      const response = await fetch(`/api/events/${eventId}/like`, {
        method: isLiked ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session.user.id }),
      });

      if (response.ok) {
        const newLikedEvents = new Set(likedEvents);
        if (isLiked) {
          newLikedEvents.delete(eventId);
        } else {
          newLikedEvents.add(eventId);
        }
        setLikedEvents(newLikedEvents);

        // Update events with new like count
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event.id === eventId
              ? {
                  ...event,
                  likesCount: (event.likesCount || 0) + (isLiked ? -1 : 1),
                }
              : event
          )
        );
      }
    } catch (error) {
      showNotification("Failed to update like", "error");
    }
  };

  const handleComment = async (eventId: string) => {
    if (!session?.user?.id) {
      showNotification("Please sign in to comment", "warning");
      return;
    }

    const commentText = commentTexts[eventId]?.trim();
    if (!commentText) return;

    try {
      const response = await fetch(`/api/events/${eventId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          content: commentText,
        }),
      });

      if (response.ok) {
        setCommentTexts((prev) => ({ ...prev, [eventId]: "" }));
        showNotification("Comment added successfully!", "success");

        // Update comment count
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event.id === eventId
              ? {
                  ...event,
                  commentsCount: (event.commentsCount || 0) + 1,
                }
              : event
          )
        );
      }
    } catch (error) {
      showNotification("Failed to add comment", "error");
    }
  };

  const toggleComments = (eventId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedComments(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEventStatus = (startDate: string, endDate?: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : start;

    if (now < start) return { status: "upcoming", color: "primary" };
    if (now >= start && now <= end)
      return { status: "ongoing", color: "success" };
    return { status: "ended", color: "default" };
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

  if (events.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Calendar size={48} color="#ccc" />
        <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
          No events found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This hub hasn't created any events yet.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {events.map((event, index) => {
          const eventStatus = getEventStatus(event.startDate, event.endDate);
          const isCommentExpanded = expandedComments.has(event.id);
          const isLiked = likedEvents.has(event.id);

          return (
            <Grid item xs={12} md={6} lg={4} key={event.id}>
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
                  {event.coverImage && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={event.coverImage}
                      alt={event.title}
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
                        label={eventStatus.status}
                        color={eventStatus.color as any}
                        size="small"
                        sx={{ textTransform: "capitalize" }}
                      />
                      <Chip
                        label={event.eventType}
                        variant="outlined"
                        size="small"
                      />
                    </Box>

                    <Typography variant="h6" component="h3" gutterBottom>
                      {event.title}
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
                      {event.description}
                    </Typography>

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
                        {formatDate(event.startDate)}
                      </Typography>
                    </Box>

                    {event.venue && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <MapPin size={16} />
                        <Typography variant="body2" color="text.secondary">
                          {event.venue}
                        </Typography>
                      </Box>
                    )}

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      <Users size={16} />
                      <Typography variant="body2" color="text.secondary">
                        {event._count.registrations} registered
                        {event.capacity && ` / ${event.capacity} max`}
                      </Typography>
                    </Box>

                    <Box sx={{ mt: "auto" }}>
                      {/* Engagement Actions */}
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
                          onClick={() => handleLike(event.id)}
                          color={isLiked ? "error" : "default"}
                        >
                          <Heart
                            size={20}
                            fill={isLiked ? "currentColor" : "none"}
                          />
                        </IconButton>
                        <Typography variant="body2" color="text.secondary">
                          {event.likesCount || 0}
                        </Typography>

                        <IconButton
                          size="small"
                          onClick={() => toggleComments(event.id)}
                        >
                          <MessageCircle size={20} />
                        </IconButton>
                        <Typography variant="body2" color="text.secondary">
                          {event.commentsCount || 0}
                        </Typography>
                      </Box>

                      {/* Comment Section */}
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
                              value={commentTexts[event.id] || ""}
                              onChange={(e) =>
                                setCommentTexts((prev) => ({
                                  ...prev,
                                  [event.id]: e.target.value,
                                }))
                              }
                              onKeyPress={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  handleComment(event.id);
                                }
                              }}
                              InputProps={{
                                endAdornment: (
                                  <IconButton
                                    size="small"
                                    onClick={() => handleComment(event.id)}
                                    disabled={!commentTexts[event.id]?.trim()}
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
                        onClick={() => router.push(`/events/${event.id}`)}
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
