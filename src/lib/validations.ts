//src/lib/validations.ts
import { z } from "zod";

// User validation schemas
export const signUpSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  degreeProgramme: z.string().optional(),
});

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  degreeProgramme: z.string().optional(),
  skills: z.array(z.string()).optional(),
  profilePicture: z.string().url().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().min(1, "OTP is required").optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/\d/, "Password must include a number")
    .optional(),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

// Hub validation schemas
export const createHubSchema = z.object({
  name: z.string().min(3, "Hub name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  cardBio: z
    .string()
    .max(200, "Card bio must be less than 200 characters")
    .optional(),
  logo: z.string().url().optional(),
  coverImage: z.string().url().optional(),
  categories: z.array(z.string()).optional(),
});

// Project validation schemas
export const createProjectSchema = z.object({
  title: z.string().min(3, "Project title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  objectives: z.string().min(10, "Objectives must be at least 10 characters"),
  coverImage: z.string().url().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  visibility: z.enum([
    "PUBLIC",
    "AUTHENTICATED",
    "HUB_MEMBERS",
    "PROGRAMME_MEMBERS",
  ]),
  skills: z.array(z.string()).optional(),
});

// Event validation schemas
export const createEventSchema = z.object({
  title: z.string().min(3, "Event title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  eventType: z.string().min(1, "Event type is required"),
  startDate: z.date(),
  endDate: z.date().optional(),
  capacity: z.number().positive().optional(),
  visibility: z.enum(["PUBLIC", "AUTHENTICATED", "HUB_MEMBERS"]),
  coverImage: z.string().url().optional(),
});

// Programme validation schemas
export const createProgrammeSchema = z.object({
  title: z.string().min(3, "Programme title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  coverImage: z.string().url().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateHubInput = z.infer<typeof createHubSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type CreateProgrammeInput = z.infer<typeof createProgrammeSchema>;
