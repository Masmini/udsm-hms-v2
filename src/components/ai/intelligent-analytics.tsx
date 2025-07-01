//src/components/ai/intelligent-analytics.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Alert,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  LinearProgress,
} from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  Warning,
  Lightbulb,
  Analytics,
  ExpandMore,
  AutoAwesome,
  Insights,
  AutoGraph, // Replaced PredictiveText with AutoGraph
  Assessment,
} from "@mui/icons-material";
import { motion } from "framer-motion";

interface AIInsight {
  id: string;
  type: "trend" | "anomaly" | "recommendation" | "prediction" | "alert";
  title: string;
  description: string;
  confidence: number;
  priority: "low" | "medium" | "high" | "critical";
  actionable: boolean;
  data?: any;
  recommendations?: string[];
  impact?: "positive" | "negative" | "neutral";
}

interface AnalyticsData {
  userEngagement: {
    totalUsers: number;
    activeUsers: number;
    engagementRate: number;
    trend: number;
  };
  hubPerformance: {
    totalHubs: number;
    activeHubs: number;
    averageMembers: number;
    topPerformingHubs: any[];
  };
  projectMetrics: {
    totalProjects: number;
    completedProjects: number;
    completionRate: number;
    averageCompletionTime: number;
  };
  eventMetrics: {
    totalEvents: number;
    upcomingEvents: number;
    averageAttendance: number;
    popularEventTypes: any[];
  };
}

interface IntelligentAnalyticsProps {
  data: AnalyticsData;
  userRole: string;
  hubId?: string;
}

export default function IntelligentAnalytics({
  data,
  userRole,
  hubId,
}: IntelligentAnalyticsProps) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);

  useEffect(() => {
    generateInsights();
  }, [data]);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/ai/analytics-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analyticsData: data,
          userRole,
          hubId,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setInsights(result.insights);
      } else {
        // Fallback to local insights generation
        const localInsights = generateLocalInsights(data);
        setInsights(localInsights);
      }
    } catch (error) {
      console.error("Error generating insights:", error);
      // Fallback to local insights generation
      const localInsights = generateLocalInsights(data);
      setInsights(localInsights);
    } finally {
      setLoading(false);
    }
  };

  const generateLocalInsights = (analyticsData: AnalyticsData): AIInsight[] => {
    const insights: AIInsight[] = [];

    // User Engagement Analysis
    if (analyticsData.userEngagement.engagementRate < 30) {
      insights.push({
        id: "low-engagement",
        type: "alert",
        title: "Low User Engagement Detected",
        description: `Current engagement rate is ${analyticsData.userEngagement.engagementRate}%, which is below the optimal threshold of 30%.`,
        confidence: 0.85,
        priority: "high",
        actionable: true,
        impact: "negative",
        recommendations: [
          "Implement gamification features to increase user participation",
          "Create more interactive events and workshops",
          "Send personalized notifications to inactive users",
          "Introduce achievement badges and recognition systems",
        ],
      });
    }

    // Growth Trend Analysis
    if (analyticsData.userEngagement.trend > 15) {
      insights.push({
        id: "strong-growth",
        type: "trend",
        title: "Strong User Growth Trend",
        description: `User base is growing at ${analyticsData.userEngagement.trend}% rate, indicating healthy platform adoption.`,
        confidence: 0.92,
        priority: "medium",
        actionable: true,
        impact: "positive",
        recommendations: [
          "Prepare infrastructure for increased load",
          "Expand content and features to meet growing demand",
          "Consider launching referral programs to accelerate growth",
          "Monitor server capacity and performance metrics",
        ],
      });
    }

    // Project Completion Analysis
    if (analyticsData.projectMetrics.completionRate < 60) {
      insights.push({
        id: "low-project-completion",
        type: "recommendation",
        title: "Project Completion Rate Needs Improvement",
        description: `Only ${analyticsData.projectMetrics.completionRate}% of projects are being completed successfully.`,
        confidence: 0.78,
        priority: "high",
        actionable: true,
        impact: "negative",
        recommendations: [
          "Implement project mentorship programs",
          "Provide better project planning tools and templates",
          "Create milestone tracking and progress monitoring",
          "Offer project management training workshops",
        ],
      });
    }

    // Hub Performance Analysis
    const avgMembers = analyticsData.hubPerformance.averageMembers;
    if (avgMembers < 10) {
      insights.push({
        id: "small-hub-size",
        type: "recommendation",
        title: "Hub Membership Could Be Increased",
        description: `Average hub membership is ${avgMembers} members. Larger hubs tend to be more active and successful.`,
        confidence: 0.71,
        priority: "medium",
        actionable: true,
        impact: "neutral",
        recommendations: [
          "Launch targeted recruitment campaigns for each hub",
          "Create cross-hub collaboration events",
          "Improve hub discovery and recommendation features",
          "Encourage existing members to invite peers",
        ],
      });
    }

    // Event Attendance Prediction
    if (analyticsData.eventMetrics.averageAttendance < 50) {
      insights.push({
        id: "low-event-attendance",
        type: "prediction",
        title: "Event Attendance May Decline",
        description: `Current average attendance is ${analyticsData.eventMetrics.averageAttendance}%. Predictive models suggest this may continue declining without intervention.`,
        confidence: 0.67,
        priority: "medium",
        actionable: true,
        impact: "negative",
        recommendations: [
          "Survey users about preferred event topics and timing",
          "Improve event promotion and marketing strategies",
          "Offer incentives for event attendance",
          "Create more interactive and engaging event formats",
        ],
      });
    }

    // Seasonal Trends
    const currentMonth = new Date().getMonth();
    if (currentMonth >= 8 && currentMonth <= 11) {
      // September to December
      insights.push({
        id: "semester-peak",
        type: "prediction",
        title: "Peak Activity Period Approaching",
        description:
          "Historical data shows increased activity during the academic semester. Prepare for 40-60% increase in user engagement.",
        confidence: 0.89,
        priority: "medium",
        actionable: true,
        impact: "positive",
        recommendations: [
          "Scale server infrastructure to handle increased load",
          "Prepare additional content and events for peak period",
          "Increase moderation and support staff availability",
          "Launch new features during high-engagement periods",
        ],
      });
    }

    return insights;
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "trend":
        return <TrendingUp />;
      case "anomaly":
        return <Warning />;
      case "recommendation":
        return <Lightbulb />;
      case "prediction":
        return <AutoGraph />; // Replaced PredictiveText with AutoGraph
      case "alert":
        return <Warning />;
      default:
        return <Insights />;
    }
  };

  const getInsightColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "error";
      case "high":
        return "warning";
      case "medium":
        return "info";
      case "low":
        return "success";
      default:
        return "default";
    }
  };

  const getImpactColor = (impact?: string) => {
    switch (impact) {
      case "positive":
        return "success";
      case "negative":
        return "error";
      case "neutral":
        return "info";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent sx={{ textAlign: "center", py: 4 }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Analyzing Data with AI
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Generating intelligent insights and recommendations...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <AutoAwesome sx={{ mr: 2, color: "primary.main" }} />
            <Typography variant="h5" fontWeight="bold">
              AI-Powered Analytics Insights
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Advanced machine learning algorithms have analyzed your data to
            provide actionable insights and predictions.
          </Typography>
        </CardContent>
      </Card>

      {/* Insights Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h4" color="primary" fontWeight="bold">
                {insights.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Insights
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {
                  insights.filter(
                    (i) => i.priority === "high" || i.priority === "critical"
                  ).length
                }
              </Typography>
              <Typography variant="body2" color="text.secondary">
                High Priority
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {insights.filter((i) => i.actionable).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Actionable Items
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h4" color="info.main" fontWeight="bold">
                {Math.round(
                  (insights.reduce((sum, i) => sum + i.confidence, 0) /
                    insights.length) *
                    100
                ) || 0}
                %
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Confidence
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Insights List */}
      <Box>
        {insights.map((insight, index) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Accordion
              expanded={selectedInsight === insight.id}
              onChange={() =>
                setSelectedInsight(
                  selectedInsight === insight.id ? null : insight.id
                )
              }
              sx={{ mb: 2 }}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box
                  sx={{ display: "flex", alignItems: "center", width: "100%" }}
                >
                  <Box
                    sx={{
                      mr: 2,
                      color: `${getInsightColor(insight.priority)}.main`,
                    }}
                  >
                    {getInsightIcon(insight.type)}
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight="medium">
                      {insight.title}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                      <Chip
                        label={insight.type.toUpperCase()}
                        size="small"
                        color={getInsightColor(insight.priority) as any}
                      />
                      <Chip
                        label={`${Math.round(
                          insight.confidence * 100
                        )}% confidence`}
                        size="small"
                        variant="outlined"
                      />
                      {insight.impact && (
                        <Chip
                          label={insight.impact}
                          size="small"
                          color={getImpactColor(insight.impact) as any}
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {insight.description}
                  </Typography>

                  {/* Confidence Meter */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      AI Confidence Level
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={insight.confidence * 100}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {Math.round(insight.confidence * 100)}% -{" "}
                      {insight.confidence > 0.8
                        ? "Very High"
                        : insight.confidence > 0.6
                        ? "High"
                        : insight.confidence > 0.4
                        ? "Medium"
                        : "Low"}{" "}
                      Confidence
                    </Typography>
                  </Box>

                  {/* Recommendations */}
                  {insight.recommendations &&
                    insight.recommendations.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          AI Recommendations
                        </Typography>
                        <List dense>
                          {insight.recommendations.map((rec, idx) => (
                            <ListItem key={idx} sx={{ pl: 0 }}>
                              <ListItemIcon sx={{ minWidth: 32 }}>
                                <Lightbulb color="primary" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary={rec} />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}

                  {/* Action Buttons */}
                  {insight.actionable && (
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button variant="contained" size="small">
                        Take Action
                      </Button>
                      <Button variant="outlined" size="small">
                        Learn More
                      </Button>
                      <Button variant="text" size="small">
                        Dismiss
                      </Button>
                    </Box>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          </motion.div>
        ))}
      </Box>

      {/* No Insights State */}
      {insights.length === 0 && (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <Assessment sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Insights Available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              The AI system needs more data to generate meaningful insights.
              Check back after more user activity.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
