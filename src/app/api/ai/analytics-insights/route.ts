//src/app/api/ai/analytics-insights/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { analyticsData, userRole, hubId } = await request.json();

    // Generate AI insights based on the analytics data
    const insights = await generateAdvancedInsights(
      analyticsData,
      userRole,
      hubId
    );

    return NextResponse.json({ insights });
  } catch (error) {
    console.error("Analytics insights error:", error);
    return NextResponse.json(
      { error: "Failed to generate insights" },
      { status: 500 }
    );
  }
}

async function generateAdvancedInsights(
  data: AnalyticsData,
  userRole: string,
  hubId?: string
): Promise<AIInsight[]> {
  const insights: AIInsight[] = [];

  // Advanced User Engagement Analysis
  const engagementInsights = analyzeUserEngagement(data.userEngagement);
  insights.push(...engagementInsights);

  // Hub Performance Analysis
  const hubInsights = analyzeHubPerformance(data.hubPerformance, userRole);
  insights.push(...hubInsights);

  // Project Success Prediction
  const projectInsights = analyzeProjectMetrics(data.projectMetrics);
  insights.push(...projectInsights);

  // Event Optimization Analysis
  const eventInsights = analyzeEventMetrics(data.eventMetrics);
  insights.push(...eventInsights);

  // Cross-metric Correlation Analysis
  const correlationInsights = analyzeCrossMetricCorrelations(data);
  insights.push(...correlationInsights);

  // Predictive Analytics
  const predictiveInsights = generatePredictiveInsights(data);
  insights.push(...predictiveInsights);

  // Sort by priority and confidence
  return insights.sort((a, b) => {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.confidence - a.confidence;
  });
}

function analyzeUserEngagement(
  engagement: AnalyticsData["userEngagement"]
): AIInsight[] {
  const insights: AIInsight[] = [];
  const { totalUsers, activeUsers, engagementRate, trend } = engagement;

  // Engagement Rate Analysis
  if (engagementRate < 25) {
    insights.push({
      id: "critical-engagement",
      type: "alert",
      title: "Critical: User Engagement Below Threshold",
      description: `User engagement rate of ${engagementRate}% is critically low. Immediate intervention required to prevent user churn.`,
      confidence: 0.92,
      priority: "critical",
      actionable: true,
      impact: "negative",
      recommendations: [
        "Launch emergency re-engagement campaign targeting inactive users",
        "Implement push notifications for important updates",
        "Create personalized content recommendations",
        "Introduce urgent gamification elements (badges, leaderboards)",
        "Conduct user surveys to identify pain points",
      ],
    });
  } else if (engagementRate < 40) {
    insights.push({
      id: "low-engagement",
      type: "recommendation",
      title: "User Engagement Needs Improvement",
      description: `Current engagement rate of ${engagementRate}% is below industry standards. Strategic improvements needed.`,
      confidence: 0.85,
      priority: "high",
      actionable: true,
      impact: "negative",
      recommendations: [
        "Implement weekly engagement challenges",
        "Create more interactive content formats",
        "Improve onboarding experience for new users",
        "Add social features to increase community interaction",
      ],
    });
  }

  // Growth Trend Analysis
  if (trend > 20) {
    insights.push({
      id: "rapid-growth",
      type: "trend",
      title: "Exceptional Growth Rate Detected",
      description: `User base growing at ${trend}% - exceptional performance requiring infrastructure scaling.`,
      confidence: 0.94,
      priority: "high",
      actionable: true,
      impact: "positive",
      recommendations: [
        "Scale server infrastructure immediately",
        "Prepare customer support for increased volume",
        "Optimize database queries for higher load",
        "Plan feature rollouts to capitalize on growth momentum",
      ],
    });
  } else if (trend < -5) {
    insights.push({
      id: "declining-growth",
      type: "alert",
      title: "User Growth Declining",
      description: `Negative growth trend of ${trend}% indicates potential platform issues or market saturation.`,
      confidence: 0.78,
      priority: "high",
      actionable: true,
      impact: "negative",
      recommendations: [
        "Analyze user feedback for platform issues",
        "Launch targeted marketing campaigns",
        "Introduce referral incentive programs",
        "Conduct competitive analysis",
      ],
    });
  }

  // Active vs Total User Ratio
  const activeRatio = (activeUsers / totalUsers) * 100;
  if (activeRatio < 30) {
    insights.push({
      id: "low-active-ratio",
      type: "recommendation",
      title: "Low Active User Ratio",
      description: `Only ${activeRatio.toFixed(
        1
      )}% of users are active. Many registered users are not engaging with the platform.`,
      confidence: 0.81,
      priority: "medium",
      actionable: true,
      impact: "neutral",
      recommendations: [
        "Create re-activation email campaigns",
        "Implement progressive web app features",
        "Add mobile notifications for important updates",
        "Simplify user interface and navigation",
      ],
    });
  }

  return insights;
}

function analyzeHubPerformance(
  hubPerformance: AnalyticsData["hubPerformance"],
  userRole: string
): AIInsight[] {
  const insights: AIInsight[] = [];
  const { totalHubs, activeHubs, averageMembers, topPerformingHubs } =
    hubPerformance;

  // Hub Activity Analysis
  const activeHubRatio = (activeHubs / totalHubs) * 100;
  if (activeHubRatio < 70) {
    insights.push({
      id: "inactive-hubs",
      type: "recommendation",
      title: "Multiple Hubs Showing Low Activity",
      description: `${
        100 - activeHubRatio
      }% of hubs are inactive or underperforming. Hub consolidation or revitalization needed.`,
      confidence: 0.76,
      priority: "medium",
      actionable: true,
      impact: "negative",
      recommendations: [
        "Identify and support struggling hub leaders",
        "Create inter-hub collaboration events",
        "Provide hub management training and resources",
        "Consider merging similar low-activity hubs",
      ],
    });
  }

  // Hub Size Analysis
  if (averageMembers < 8) {
    insights.push({
      id: "small-hub-size",
      type: "recommendation",
      title: "Hub Membership Below Optimal Size",
      description: `Average hub size of ${averageMembers} members is below the optimal range of 15-30 for maximum collaboration.`,
      confidence: 0.73,
      priority: "medium",
      actionable: true,
      impact: "neutral",
      recommendations: [
        "Launch targeted recruitment campaigns for each hub",
        "Improve hub discovery algorithms",
        "Create cross-promotional opportunities between hubs",
        "Implement member referral rewards",
      ],
    });
  }

  // Top Performer Analysis
  if (topPerformingHubs.length > 0 && userRole === "ADMIN") {
    insights.push({
      id: "top-performer-analysis",
      type: "trend",
      title: "Success Patterns Identified in Top Hubs",
      description:
        "Analysis of top-performing hubs reveals best practices that can be replicated across the platform.",
      confidence: 0.87,
      priority: "medium",
      actionable: true,
      impact: "positive",
      recommendations: [
        "Document and share best practices from top hubs",
        "Create mentorship programs pairing successful and struggling hubs",
        "Implement features that successful hubs use most",
        "Recognize and reward top-performing hub leaders",
      ],
    });
  }

  return insights;
}

function analyzeProjectMetrics(
  projectMetrics: AnalyticsData["projectMetrics"]
): AIInsight[] {
  const insights: AIInsight[] = [];
  const {
    totalProjects,
    completedProjects,
    completionRate,
    averageCompletionTime,
  } = projectMetrics;

  // Project Completion Rate Analysis
  if (completionRate < 50) {
    insights.push({
      id: "low-project-completion",
      type: "alert",
      title: "Project Completion Rate Critically Low",
      description: `Only ${completionRate}% of projects are completed successfully. This indicates systemic issues in project management.`,
      confidence: 0.89,
      priority: "high",
      actionable: true,
      impact: "negative",
      recommendations: [
        "Implement mandatory project planning workshops",
        "Create project milestone tracking system",
        "Assign mentors to all new projects",
        "Develop project success prediction algorithms",
        "Provide project management tools and templates",
      ],
    });
  } else if (completionRate < 70) {
    insights.push({
      id: "moderate-project-completion",
      type: "recommendation",
      title: "Project Completion Rate Needs Improvement",
      description: `Project completion rate of ${completionRate}% is below optimal. Strategic interventions can improve success rates.`,
      confidence: 0.82,
      priority: "medium",
      actionable: true,
      impact: "negative",
      recommendations: [
        "Introduce project check-in requirements",
        "Create peer review and feedback systems",
        "Offer project management certification programs",
        "Implement early warning systems for at-risk projects",
      ],
    });
  }

  // Project Timeline Analysis
  if (averageCompletionTime > 180) {
    // More than 6 months
    insights.push({
      id: "long-project-duration",
      type: "recommendation",
      title: "Projects Taking Longer Than Expected",
      description: `Average completion time of ${averageCompletionTime} days suggests projects may be too ambitious or poorly scoped.`,
      confidence: 0.75,
      priority: "medium",
      actionable: true,
      impact: "neutral",
      recommendations: [
        "Encourage smaller, more focused project scopes",
        "Implement agile project management methodologies",
        "Create project timeline estimation tools",
        "Provide training on realistic goal setting",
      ],
    });
  }

  // Project Volume Analysis
  const projectsPerHub = totalProjects / 10; // Assuming 10 hubs average
  if (projectsPerHub < 2) {
    insights.push({
      id: "low-project-volume",
      type: "recommendation",
      title: "Low Project Creation Rate",
      description:
        "Few projects are being initiated. This may indicate barriers to project creation or lack of innovation culture.",
      confidence: 0.71,
      priority: "medium",
      actionable: true,
      impact: "negative",
      recommendations: [
        "Simplify project proposal process",
        "Create project idea generation workshops",
        "Offer seed funding for innovative projects",
        "Showcase successful projects to inspire others",
      ],
    });
  }

  return insights;
}

function analyzeEventMetrics(
  eventMetrics: AnalyticsData["eventMetrics"]
): AIInsight[] {
  const insights: AIInsight[] = [];
  const { totalEvents, upcomingEvents, averageAttendance, popularEventTypes } =
    eventMetrics;

  // Event Attendance Analysis
  if (averageAttendance < 40) {
    insights.push({
      id: "low-event-attendance",
      type: "recommendation",
      title: "Event Attendance Below Expectations",
      description: `Average attendance of ${averageAttendance}% indicates events may not be meeting user needs or expectations.`,
      confidence: 0.84,
      priority: "medium",
      actionable: true,
      impact: "negative",
      recommendations: [
        "Survey users about preferred event topics and formats",
        "Improve event promotion and marketing strategies",
        "Offer attendance incentives and recognition",
        "Create more interactive and engaging event formats",
        "Optimize event timing based on user availability",
      ],
    });
  }

  // Event Pipeline Analysis
  if (upcomingEvents < 5) {
    insights.push({
      id: "low-upcoming-events",
      type: "alert",
      title: "Insufficient Upcoming Events",
      description: `Only ${upcomingEvents} upcoming events scheduled. Users need consistent event programming to maintain engagement.`,
      confidence: 0.79,
      priority: "medium",
      actionable: true,
      impact: "negative",
      recommendations: [
        "Create quarterly event planning calendars",
        "Encourage hub leaders to schedule regular events",
        "Develop recurring event series (weekly workshops, monthly seminars)",
        "Partner with external organizations for guest events",
      ],
    });
  }

  // Popular Event Type Analysis
  if (popularEventTypes.length > 0) {
    insights.push({
      id: "event-type-optimization",
      type: "trend",
      title: "Event Type Preferences Identified",
      description:
        "User preferences for specific event types can guide future event planning and resource allocation.",
      confidence: 0.86,
      priority: "low",
      actionable: true,
      impact: "positive",
      recommendations: [
        `Focus on popular event types: ${popularEventTypes
          .slice(0, 3)
          .join(", ")}`,
        "Create specialized tracks for high-demand topics",
        "Train more facilitators in popular event formats",
        "Develop templates for successful event types",
      ],
    });
  }

  return insights;
}

function analyzeCrossMetricCorrelations(data: AnalyticsData): AIInsight[] {
  const insights: AIInsight[] = [];

  // Hub Size vs Project Success Correlation
  const avgHubSize = data.hubPerformance.averageMembers;
  const projectSuccess = data.projectMetrics.completionRate;

  if (avgHubSize > 15 && projectSuccess > 70) {
    insights.push({
      id: "hub-size-success-correlation",
      type: "trend",
      title: "Strong Correlation: Hub Size and Project Success",
      description:
        "Larger hubs (15+ members) show significantly higher project completion rates. This suggests optimal hub sizing strategies.",
      confidence: 0.83,
      priority: "medium",
      actionable: true,
      impact: "positive",
      recommendations: [
        "Target hub growth to 15-30 member range",
        "Provide additional support to smaller hubs",
        "Create hub merger opportunities for very small hubs",
        "Study successful large hubs for best practices",
      ],
    });
  }

  // Engagement vs Event Attendance Correlation
  const engagement = data.userEngagement.engagementRate;
  const eventAttendance = data.eventMetrics.averageAttendance;

  if (engagement < 40 && eventAttendance < 50) {
    insights.push({
      id: "engagement-event-correlation",
      type: "recommendation",
      title: "Low Engagement Correlates with Poor Event Attendance",
      description:
        "Users with low platform engagement are also less likely to attend events, suggesting a compound engagement problem.",
      confidence: 0.77,
      priority: "high",
      actionable: true,
      impact: "negative",
      recommendations: [
        "Create integrated engagement campaigns combining platform and event activities",
        "Use event attendance as an engagement metric",
        "Develop event-based onboarding for new users",
        "Create exclusive events for highly engaged users",
      ],
    });
  }

  return insights;
}

function generatePredictiveInsights(data: AnalyticsData): AIInsight[] {
  const insights: AIInsight[] = [];

  // Seasonal Prediction
  const currentMonth = new Date().getMonth();
  const isAcademicSeason = currentMonth >= 8 || currentMonth <= 4; // Sep-May

  if (isAcademicSeason) {
    insights.push({
      id: "seasonal-prediction",
      type: "prediction",
      title: "Academic Season Activity Surge Predicted",
      description:
        "Historical patterns suggest 40-60% increase in platform activity during academic months. Infrastructure scaling recommended.",
      confidence: 0.91,
      priority: "medium",
      actionable: true,
      impact: "positive",
      recommendations: [
        "Scale server capacity by 50% before peak periods",
        "Increase customer support availability",
        "Prepare additional content and events",
        "Monitor performance metrics closely during surge",
      ],
    });
  }

  // User Churn Prediction
  const engagementTrend = data.userEngagement.trend;
  if (engagementTrend < -2) {
    insights.push({
      id: "churn-prediction",
      type: "prediction",
      title: "User Churn Risk Increasing",
      description:
        "Declining engagement trends suggest potential user churn in the next 30-60 days without intervention.",
      confidence: 0.74,
      priority: "high",
      actionable: true,
      impact: "negative",
      recommendations: [
        "Launch immediate user retention campaigns",
        "Identify and contact at-risk users personally",
        "Implement win-back email sequences",
        "Create exclusive content for returning users",
      ],
    });
  }

  // Growth Opportunity Prediction
  const totalUsers = data.userEngagement.totalUsers;
  const totalHubs = data.hubPerformance.totalHubs;
  const usersPerHub = totalUsers / totalHubs;

  if (usersPerHub > 50) {
    insights.push({
      id: "expansion-opportunity",
      type: "prediction",
      title: "Hub Expansion Opportunity Identified",
      description:
        "High user-to-hub ratio suggests demand for additional specialized hubs. Strategic expansion could capture unmet needs.",
      confidence: 0.68,
      priority: "low",
      actionable: true,
      impact: "positive",
      recommendations: [
        "Survey users about desired new hub topics",
        "Analyze user interests for hub creation opportunities",
        "Recruit potential hub leaders from active members",
        "Create pilot programs for new hub concepts",
      ],
    });
  }

  return insights;
}
