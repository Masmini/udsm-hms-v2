//src/app/api/ai/recommendations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Recommendation {
  id: string;
  type: "event" | "project" | "programme" | "hub" | "user";
  title: string;
  description: string;
  confidence: number;
  reason: string;
  data: any;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, context, limit = 5 } = await request.json();

    // Get user profile and activity data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        hubs: {
          include: { hub: true },
        },
        programmes: {
          include: { programme: true },
        },
        eventRegistrations: {
          include: { event: true },
        },
        projectMembers: {
          include: { project: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate personalized recommendations
    const recommendations = await generatePersonalizedRecommendations(
      user,
      context,
      limit
    );

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error("Recommendations API error:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}

async function generatePersonalizedRecommendations(
  user: any,
  context: string,
  limit: number
): Promise<Recommendation[]> {
  const recommendations: Recommendation[] = [];

  // Get user's interests and skills
  const userSkills = user.skills || [];
  const userInterests = user.interests || [];
  const userHubs = user.hubs.map((h: any) => h.hub);
  const userProgrammes = user.programmes.map((p: any) => p.programme);

  // Event Recommendations
  const eventRecs = await generateEventRecommendations(
    user,
    userSkills,
    userHubs
  );
  recommendations.push(...eventRecs);

  // Project Recommendations
  const projectRecs = await generateProjectRecommendations(
    user,
    userSkills,
    userHubs
  );
  recommendations.push(...projectRecs);

  // Programme Recommendations
  const programmeRecs = await generateProgrammeRecommendations(
    user,
    userSkills,
    userProgrammes
  );
  recommendations.push(...programmeRecs);

  // Hub Recommendations
  const hubRecs = await generateHubRecommendations(
    user,
    userSkills,
    userInterests,
    userHubs
  );
  recommendations.push(...hubRecs);

  // User/Collaboration Recommendations
  const userRecs = await generateUserRecommendations(
    user,
    userSkills,
    userHubs
  );
  recommendations.push(...userRecs);

  // Sort by confidence and return top recommendations
  return recommendations
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, limit);
}

async function generateEventRecommendations(
  user: any,
  userSkills: string[],
  userHubs: any[]
): Promise<Recommendation[]> {
  const recommendations: Recommendation[] = [];

  // Get upcoming events
  const upcomingEvents = await prisma.event.findMany({
    where: {
      startDate: { gte: new Date() },
      publishStatus: "PUBLISHED",
      deletedAt: null,
      OR: [
        { visibility: "PUBLIC" },
        { visibility: "AUTHENTICATED" },
        {
          AND: [
            { visibility: "HUB_MEMBERS" },
            { hubId: { in: userHubs.map((h) => h.id) } },
          ],
        },
      ],
    },
    include: {
      hub: true,
      registrations: {
        where: { userId: user.id },
      },
    },
    take: 20,
  });

  // Filter out events user is already registered for
  const availableEvents = upcomingEvents.filter(
    (event) => event.registrations.length === 0
  );

  for (const event of availableEvents) {
    let confidence = 0.3; // Base confidence
    let reason = "Upcoming event in your area of interest";

    // Boost confidence based on user's hub membership
    if (userHubs.some((hub) => hub.id === event.hubId)) {
      confidence += 0.4;
      reason = "Event from your hub community";
    }

    // Boost confidence based on event type and user skills
    const eventSkills = event.tags || [];
    const skillMatch = eventSkills.filter((skill) =>
      userSkills.some(
        (userSkill) =>
          userSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(userSkill.toLowerCase())
      )
    ).length;

    if (skillMatch > 0) {
      confidence += skillMatch * 0.15;
      reason = `Matches your skills: ${userSkills.slice(0, 2).join(", ")}`;
    }

    // Boost confidence for workshop/learning events
    if (
      event.eventType.toLowerCase().includes("workshop") ||
      event.eventType.toLowerCase().includes("training")
    ) {
      confidence += 0.1;
    }

    if (confidence > 0.4) {
      recommendations.push({
        id: `event-${event.id}`,
        type: "event",
        title: event.title,
        description: event.description.substring(0, 100) + "...",
        confidence: Math.min(confidence, 0.95),
        reason,
        data: event,
      });
    }
  }

  return recommendations;
}

async function generateProjectRecommendations(
  user: any,
  userSkills: string[],
  userHubs: any[]
): Promise<Recommendation[]> {
  const recommendations: Recommendation[] = [];

  // Get available projects from user's hubs
  const availableProjects = await prisma.project.findMany({
    where: {
      hubId: { in: userHubs.map((h) => h.id) },
      publishStatus: "PUBLISHED",
      deletedAt: null,
      status: { in: ["PLANNING", "IN_PROGRESS"] },
      members: {
        none: { userId: user.id },
      },
    },
    include: {
      hub: true,
      members: true,
    },
    take: 15,
  });

  for (const project of availableProjects) {
    let confidence = 0.4; // Base confidence for hub projects
    let reason = "Project from your hub community";

    // Boost confidence based on skill match
    const projectSkills = project.skills || [];
    const skillMatch = projectSkills.filter((skill) =>
      userSkills.some(
        (userSkill) =>
          userSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(userSkill.toLowerCase())
      )
    ).length;

    if (skillMatch > 0) {
      confidence += skillMatch * 0.2;
      reason = `Perfect match for your skills: ${userSkills
        .slice(0, 2)
        .join(", ")}`;
    }

    // Boost confidence for projects needing members
    if (project.members.length < 5) {
      confidence += 0.1;
      reason += " - Looking for team members";
    }

    // Boost confidence for newer projects
    const daysSinceCreated = Math.floor(
      (Date.now() - new Date(project.createdAt).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    if (daysSinceCreated < 30) {
      confidence += 0.1;
    }

    if (confidence > 0.5) {
      recommendations.push({
        id: `project-${project.id}`,
        type: "project",
        title: project.title,
        description: project.description.substring(0, 100) + "...",
        confidence: Math.min(confidence, 0.95),
        reason,
        data: project,
      });
    }
  }

  return recommendations;
}

async function generateProgrammeRecommendations(
  user: any,
  userSkills: string[],
  userProgrammes: any[]
): Promise<Recommendation[]> {
  const recommendations: Recommendation[] = [];

  // Get available programmes
  const availableProgrammes = await prisma.programme.findMany({
    where: {
      publishStatus: "PUBLISHED",
      deletedAt: null,
      startDate: { gte: new Date() },
      members: {
        none: { userId: user.id },
      },
    },
    include: {
      hub: true,
      members: true,
    },
    take: 10,
  });

  for (const programme of availableProgrammes) {
    let confidence = 0.3; // Base confidence
    let reason = "Available learning programme";

    // Boost confidence based on programme content and user skills
    const programmeTitle = programme.title.toLowerCase();
    const programmeDesc = programme.description.toLowerCase();

    const relevantSkills = userSkills.filter(
      (skill) =>
        programmeTitle.includes(skill.toLowerCase()) ||
        programmeDesc.includes(skill.toLowerCase())
    );

    if (relevantSkills.length > 0) {
      confidence += relevantSkills.length * 0.25;
      reason = `Builds on your ${relevantSkills.slice(0, 2).join(", ")} skills`;
    }

    // Boost confidence for programmes with few members (more attention)
    if (programme.members.length < 10) {
      confidence += 0.15;
      reason += " - Small cohort, more personalized attention";
    }

    // Boost confidence for programmes starting soon
    const daysUntilStart = Math.floor(
      (new Date(programme.startDate!).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24)
    );
    if (daysUntilStart < 30 && daysUntilStart > 0) {
      confidence += 0.1;
      reason += " - Starting soon";
    }

    if (confidence > 0.4) {
      recommendations.push({
        id: `programme-${programme.id}`,
        type: "programme",
        title: programme.title,
        description: programme.description.substring(0, 100) + "...",
        confidence: Math.min(confidence, 0.95),
        reason,
        data: programme,
      });
    }
  }

  return recommendations;
}

async function generateHubRecommendations(
  user: any,
  userSkills: string[],
  userInterests: string[],
  userHubs: any[]
): Promise<Recommendation[]> {
  const recommendations: Recommendation[] = [];

  // Get hubs user is not a member of
  const availableHubs = await prisma.hub.findMany({
    where: {
      deletedAt: null,
      members: {
        none: { userId: user.id },
      },
    },
    include: {
      categories: true,
      members: true,
      _count: {
        select: {
          projects: true,
          events: true,
          programmes: true,
        },
      },
    },
    take: 10,
  });

  for (const hub of availableHubs) {
    let confidence = 0.2; // Base confidence
    let reason = "Active hub community";

    // Boost confidence based on hub categories and user interests
    const hubCategories = hub.categories.map((c) => c.name.toLowerCase());
    const interestMatch = hubCategories.filter((category) =>
      userInterests.some(
        (interest) =>
          interest.toLowerCase().includes(category) ||
          category.includes(interest.toLowerCase())
      )
    ).length;

    if (interestMatch > 0) {
      confidence += interestMatch * 0.3;
      reason = `Matches your interests in ${hubCategories
        .slice(0, 2)
        .join(", ")}`;
    }

    // Boost confidence based on hub activity
    const totalActivity =
      hub._count.projects + hub._count.events + hub._count.programmes;
    if (totalActivity > 5) {
      confidence += 0.2;
      reason += " - Very active community";
    }

    // Boost confidence for hubs with moderate size (not too big, not too small)
    if (hub.members.length >= 10 && hub.members.length <= 50) {
      confidence += 0.15;
    }

    if (confidence > 0.4) {
      recommendations.push({
        id: `hub-${hub.id}`,
        type: "hub",
        title: hub.name,
        description: hub.cardBio || hub.description.substring(0, 100) + "...",
        confidence: Math.min(confidence, 0.95),
        reason,
        data: hub,
      });
    }
  }

  return recommendations;
}

async function generateUserRecommendations(
  user: any,
  userSkills: string[],
  userHubs: any[]
): Promise<Recommendation[]> {
  const recommendations: Recommendation[] = [];

  // Find users with similar skills in the same hubs
  const similarUsers = await prisma.user.findMany({
    where: {
      id: { not: user.id },
      deletedAt: null,
      hubs: {
        some: {
          hubId: { in: userHubs.map((h) => h.id) },
        },
      },
    },
    include: {
      hubs: {
        include: { hub: true },
      },
      projectMembers: {
        include: { project: true },
      },
    },
    take: 20,
  });

  for (const otherUser of similarUsers) {
    let confidence = 0.1; // Base confidence
    let reason = "Member of your hub community";

    // Boost confidence based on skill similarity
    const otherUserSkills = otherUser.skills || [];
    const commonSkills = userSkills.filter((skill) =>
      otherUserSkills.some(
        (otherSkill) =>
          skill.toLowerCase().includes(otherSkill.toLowerCase()) ||
          otherSkill.toLowerCase().includes(skill.toLowerCase())
      )
    );

    if (commonSkills.length > 0) {
      confidence += commonSkills.length * 0.2;
      reason = `Shares your skills: ${commonSkills.slice(0, 2).join(", ")}`;
    }

    // Boost confidence for active project contributors
    if (otherUser.projectMembers.length > 2) {
      confidence += 0.2;
      reason += " - Active project contributor";
    }

    // Boost confidence for users in multiple shared hubs
    const sharedHubs = userHubs.filter((userHub) =>
      otherUser.hubs.some((otherHub) => otherHub.hubId === userHub.id)
    );

    if (sharedHubs.length > 1) {
      confidence += 0.15;
      reason += ` - Active in ${sharedHubs.length} shared hubs`;
    }

    if (confidence > 0.4) {
      recommendations.push({
        id: `user-${otherUser.id}`,
        type: "user",
        title: `${otherUser.firstName} ${otherUser.lastName}`,
        description: `${
          otherUser.degreeProgramme || "Student"
        } with expertise in ${otherUserSkills.slice(0, 2).join(", ")}`,
        confidence: Math.min(confidence, 0.95),
        reason,
        data: otherUser,
      });
    }
  }

  return recommendations;
}
