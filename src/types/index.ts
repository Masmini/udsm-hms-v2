//src/types/index.ts
import { Prisma } from "@prisma/client";

// src/types/index.ts
export type Category = Prisma.CategoryGetPayload<{}>;

// User Types
export type UserWithDetails = Prisma.UserGetPayload<{
  include: {
    hubs: {
      include: {
        hub: true;
      };
    };
    programmes: {
      include: {
        programme: true;
      };
    };
    attendanceBadges: {
      include: {
        event: true;
      };
    };
  };
}>;

export type UserProfile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  role: "STUDENT" | "ADMIN";
  degreeProgramme?: string;
  skills: string[];
  isGoogleUser: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// Hub Types
export type HubWithDetails = Prisma.HubGetPayload<{
  include: {
    categories: true;
    members: {
      include: {
        user: true;
      };
    };
    projects: true;
    programmes: true;
    events: true;
    _count: {
      select: {
        members: true;
        projects: true;
        programmes: true;
        events: true;
      };
    };
  };
}>;

export type HubMemberWithUser = Prisma.HubMemberGetPayload<{
  include: {
    user: true;
    hub: true;
  };
}>;

// Project Types
export type ProjectWithDetails = Prisma.ProjectGetPayload<{
  include: {
    hub: true;
    members: {
      include: {
        user: true;
      };
    };
    tasks: {
      include: {
        assignee: true;
      };
    };
    progressReports: {
      include: {
        user: true;
      };
    };
    projectFiles: true;
    announcements: {
      include: {
        creator: true;
      };
    };
    discussions: {
      include: {
        creator: true;
      };
    };
    supervisors: true;
    projectJoinRequests: {
      include: {
        user: true;
      };
    };
    projectAnalytics: true;
    media: true;
  };
}>;

// Event Types
export type EventWithDetails = Prisma.EventGetPayload<{
  include: {
    hub: true;
    registrations: {
      include: {
        user: true;
      };
    };
    attendanceBadges: {
      include: {
        user: true;
      };
    };
    eventFeedbacks: {
      include: {
        user: true;
      };
    };
    media: true;
  };
}>;

// Programme Types
export type ProgrammeWithDetails = Prisma.ProgrammeGetPayload<{
  include: {
    hub: true;
    members: {
      include: {
        user: true;
      };
    };
    supervisors: true;
    programmeJoinRequests: {
      include: {
        user: true;
      };
    };
    Media: true;
  };
}>;

// Request Types
export type JoinRequest =
  | Prisma.HubMembershipRequestGetPayload<{
      include: {
        user: true;
        hub: true;
      };
    }>
  | Prisma.ProjectJoinRequestGetPayload<{
      include: {
        user: true;
        project: true;
        hub: true;
      };
    }>
  | Prisma.ProgrammeJoinRequestGetPayload<{
      include: {
        user: true;
        programme: true;
        hub: true;
      };
    }>
  | Prisma.EventRegistrationGetPayload<{
      include: {
        user: true;
        event: true;
      };
    }>;

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface CreateProjectForm {
  title: string;
  description: string;
  objectives: string;
  coverImage?: string;
  startDate?: Date;
  endDate?: Date;
  visibility: "PUBLIC" | "AUTHENTICATED" | "HUB_MEMBERS" | "PROGRAMME_MEMBERS";
  skills: string[];
  initialMembers: string[];
  initialTasks: {
    name: string;
    description?: string;
    dueDate?: Date;
    assigneeId?: string;
  }[];
}

export interface CreateEventForm {
  title: string;
  description: string;
  eventType: string;
  startDate: Date;
  endDate?: Date;
  capacity?: number;
  visibility: "PUBLIC" | "AUTHENTICATED" | "HUB_MEMBERS";
  coverImage?: string;
  requiresRegistration: boolean;
}

export interface CreateProgrammeForm {
  title: string;
  description: string;
  coverImage?: string;
  startDate?: Date;
  endDate?: Date;
}

// Analytics Types
export interface DashboardAnalytics {
  totalUsers: number;
  totalHubs: number;
  totalProjects: number;
  totalEvents: number;
  activeUsers: number;
  recentActivities: ActivityItem[];
  chartData: {
    userGrowth: ChartDataPoint[];
    hubActivity: ChartDataPoint[];
    projectCompletion: ChartDataPoint[];
  };
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface ActivityItem {
  id: string;
  type: "USER_JOINED" | "PROJECT_CREATED" | "EVENT_CREATED" | "HUB_CREATED";
  title: string;
  description: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: Date;
  entityId?: string;
  entityType?: string;
}

// Navigation Types
export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType;
  badge?: number;
  children?: NavItem[];
}

// Theme Types
export type ThemeMode = "light" | "dark" | "system";

// File Upload Types
export interface UploadedFile {
  url: string;
  fileName: string;
  type: string;
  size: number;
}

// Notification Types
export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: Date;
  link?: string;
  metadata?: Record<string, any>;
}

// Search Types
export interface SearchFilters {
  query?: string;
  category?: string;
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  sortBy?: "relevance" | "date" | "popularity";
  sortOrder?: "asc" | "desc";
}

export interface SearchResult {
  id: string;
  type: "hub" | "project" | "event" | "programme" | "user";
  title: string;
  description: string;
  image?: string;
  url: string;
  metadata?: Record<string, any>;
}
