//src/components/ai/ai-recommendation-engine.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  IconButton,
  Skeleton,
} from "@mui/material";
import {
  AutoAwesome,
  Event,
  Assignment,
  School,
  Group,
  TrendingUp,
  Close,
  ThumbUp,
  ThumbDown,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Recommendation {
  id: string;
  type: "event" | "project" | "programme" | "hub" | "user";
  title: string;
  description: string;
  confidence: number;
  reason: string;
  data: any;
  dismissed?: boolean;
}

interface AIRecommendationEngineProps {
  userId: string;
  context?: "dashboard" | "hub" | "project" | "event";
  limit?: number;
}

export default function AIRecommendationEngine({
  userId,
  context = "dashboard",
  limit = 5,
}: AIRecommendationEngineProps) {
  const { data: session } = useSession();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchRecommendations();
  }, [userId, context]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/ai/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          context,
          limit,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = (recommendationId: string) => {
    setDismissedIds((prev) => new Set(prev).add(recommendationId));
    // Optionally send feedback to improve recommendations
    sendFeedback(recommendationId, "dismissed");
  };

  const handleLike = (recommendationId: string) => {
    sendFeedback(recommendationId, "liked");
  };

  const handleDislike = (recommendationId: string) => {
    sendFeedback(recommendationId, "disliked");
    setDismissedIds((prev) => new Set(prev).add(recommendationId));
  };

  const sendFeedback = async (recommendationId: string, feedback: string) => {
    try {
      await fetch("/api/ai/recommendation-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recommendationId,
          feedback,
          userId,
        }),
      });
    } catch (error) {
      console.error("Error sending feedback:", error);
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case "event":
        return <Event />;
      case "project":
        return <Assignment />;
      case "programme":
        return <School />;
      case "hub":
        return <Group />;
      case "user":
        return <Avatar />;
      default:
        return <AutoAwesome />;
    }
  };

  const getRecommendationColor = (confidence: number) => {
    if (confidence > 0.8) return "success";
    if (confidence > 0.6) return "info";
    if (confidence > 0.4) return "warning";
    return "default";
  };

  const visibleRecommendations = recommendations.filter(
    (rec) => !dismissedIds.has(rec.id)
  );

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <AutoAwesome sx={{ mr: 2, color: "primary.main" }} />
            <Typography variant="h6" fontWeight="bold">
              AI Recommendations
            </Typography>
          </Box>
          {[...Array(3)].map((_, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <Skeleton variant="rectangular" height={80} />
            </Box>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (visibleRecommendations.length === 0) {
    return (
      <Card>
        <CardContent sx={{ textAlign: "center", py: 4 }}>
          <AutoAwesome sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Recommendations Available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The AI system is learning your preferences. Check back soon for
            personalized recommendations!
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <AutoAwesome sx={{ mr: 2, color: "primary.main" }} />
          <Typography variant="h6" fontWeight="bold">
            AI Recommendations for You
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Personalized suggestions based on your interests, activity, and goals
        </Typography>

        <List sx={{ p: 0 }}>
          {visibleRecommendations.map((recommendation, index) => (
            <motion.div
              key={recommendation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <ListItem
                sx={{
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 2,
                  mb: 2,
                  p: 2,
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: "primary.main" }}>
                    {getRecommendationIcon(recommendation.type)}
                  </Avatar>
                </ListItemAvatar>

                <ListItemText
                  primary={
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight="medium">
                        {recommendation.title}
                      </Typography>
                      <Chip
                        label={`${Math.round(
                          recommendation.confidence * 100
                        )}% match`}
                        size="small"
                        color={
                          getRecommendationColor(
                            recommendation.confidence
                          ) as any
                        }
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        {recommendation.description}
                      </Typography>
                      <Typography variant="caption" color="primary">
                        💡 {recommendation.reason}
                      </Typography>
                    </Box>
                  }
                />

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    ml: 2,
                  }}
                >
                  <Button
                    variant="contained"
                    size="small"
                    component={Link}
                    href={getRecommendationLink(recommendation)}
                  >
                    View
                  </Button>

                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleLike(recommendation.id)}
                      title="This is helpful"
                    >
                      <ThumbUp fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDislike(recommendation.id)}
                      title="Not interested"
                    >
                      <ThumbDown fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDismiss(recommendation.id)}
                      title="Dismiss"
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </ListItem>
            </motion.div>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ textAlign: "center" }}>
          <Button
            variant="text"
            size="small"
            onClick={fetchRecommendations}
            startIcon={<TrendingUp />}
          >
            Refresh Recommendations
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

function getRecommendationLink(recommendation: Recommendation): string {
  switch (recommendation.type) {
    case "event":
      return `/events/${recommendation.data.id}`;
    case "project":
      return `/projects/${recommendation.data.id}`;
    case "programme":
      return `/programmes/${recommendation.data.id}`;
    case "hub":
      return `/hubs/${recommendation.data.id}`;
    case "user":
      return `/users/${recommendation.data.id}`;
    default:
      return "/";
  }
}
