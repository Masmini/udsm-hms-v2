//src/lib/ai-insights.ts
// AI-powered insights and analytics
interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  totalHubs: number;
  totalProjects: number;
  totalEvents: number;
  engagementRate: number;
  growthRate: number;
}

export interface AIInsight {
  type: "trend" | "recommendation" | "alert" | "prediction";
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  priority: "low" | "medium" | "high";
  data?: any;
}

export class AIInsightsService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || "";
    this.baseUrl = "https://api.openai.com/v1";
  }

  async generateSystemInsights(metrics: SystemMetrics): Promise<AIInsight[]> {
    try {
      const prompt = `
        Analyze the following UDSM Hub Management System metrics and provide actionable insights:
        
        Total Users: ${metrics.totalUsers}
        Active Users: ${metrics.activeUsers}
        Total Hubs: ${metrics.totalHubs}
        Total Projects: ${metrics.totalProjects}
        Total Events: ${metrics.totalEvents}
        Engagement Rate: ${metrics.engagementRate}%
        Growth Rate: ${metrics.growthRate}%
        
        Please provide insights in the following categories:
        1. User engagement trends
        2. Hub performance recommendations
        3. Project success predictions
        4. Event optimization suggestions
        5. System alerts or concerns
        
        Format your response as a JSON array of insights with type, title, description, confidence (0-1), actionable (boolean), and priority.
      `;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content:
                "You are an AI analyst specializing in educational platform analytics. Provide concise, actionable insights.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 2000,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const insights = JSON.parse(data.choices[0].message.content);

      return insights;
    } catch (error) {
      console.error("AI insights error:", error);
      return this.getFallbackInsights(metrics);
    }
  }

  async generateHubRecommendations(hubData: any): Promise<string[]> {
    try {
      const prompt = `
        Based on the following hub data, provide 5 specific recommendations to improve hub performance:
        
        Hub Name: ${hubData.name}
        Members: ${hubData.memberCount}
        Projects: ${hubData.projectCount}
        Events: ${hubData.eventCount}
        Engagement Rate: ${hubData.engagementRate}%
        
        Focus on actionable strategies for growth, engagement, and impact.
      `;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 1000,
          temperature: 0.5,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const recommendations = data.choices[0].message.content
        .split("\n")
        .filter((line: string) => line.trim().length > 0)
        .slice(0, 5);

      return recommendations;
    } catch (error) {
      console.error("AI recommendations error:", error);
      return [
        "Increase member engagement through regular events",
        "Create collaborative projects to foster teamwork",
        "Establish mentorship programs",
        "Develop partnerships with industry leaders",
        "Implement feedback collection systems",
      ];
    }
  }

  private getFallbackInsights(metrics: SystemMetrics): AIInsight[] {
    const insights: AIInsight[] = [];

    // User engagement analysis
    if (metrics.engagementRate < 30) {
      insights.push({
        type: "alert",
        title: "Low User Engagement",
        description:
          "User engagement is below optimal levels. Consider implementing gamification or incentive programs.",
        confidence: 0.8,
        actionable: true,
        priority: "high",
      });
    }

    // Growth rate analysis
    if (metrics.growthRate > 20) {
      insights.push({
        type: "trend",
        title: "Strong Growth Trend",
        description:
          "The platform is experiencing healthy growth. Ensure infrastructure can handle increased load.",
        confidence: 0.9,
        actionable: true,
        priority: "medium",
      });
    }

    // Hub-to-user ratio analysis
    const hubUserRatio = metrics.totalHubs / metrics.totalUsers;
    if (hubUserRatio < 0.1) {
      insights.push({
        type: "recommendation",
        title: "Consider Creating More Hubs",
        description:
          "The hub-to-user ratio suggests there may be demand for more specialized communities.",
        confidence: 0.7,
        actionable: true,
        priority: "medium",
      });
    }

    return insights;
  }

  async predictProjectSuccess(projectData: any): Promise<number> {
    // Simple heuristic-based prediction
    let score = 0.5; // Base score

    // Team size factor
    if (projectData.memberCount >= 3 && projectData.memberCount <= 7) {
      score += 0.2;
    }

    // Timeline factor
    const duration = projectData.endDate - projectData.startDate;
    if (duration >= 30 && duration <= 180) {
      // 1-6 months
      score += 0.15;
    }

    // Skills match factor
    if (projectData.skillsMatch > 0.7) {
      score += 0.15;
    }

    // Hub activity factor
    if (projectData.hubActivityScore > 0.6) {
      score += 0.1;
    }

    return Math.min(score, 1.0);
  }
}

export const aiInsightsService = new AIInsightsService();
