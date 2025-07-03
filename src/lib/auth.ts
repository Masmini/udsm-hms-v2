// src/lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Extend NextAuth types
declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    profilePicture?: string | null;
    isGoogleUser: boolean;
    redirectUrl?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      profilePicture?: string | null;
      isGoogleUser: boolean;
    };
    redirectUrl?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    profilePicture?: string | null;
    isGoogleUser: boolean;
    redirectUrl?: string;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          console.log(
            "[Authorize]: Starting credentials authorization for email:",
            credentials?.email
          );
          if (!credentials?.email || !credentials?.password) {
            console.error("[Authorize]: Missing email or password");
            throw new Error("Email and password are required");
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase() },
            select: {
              id: true,
              email: true,
              password: true,
              firstName: true,
              lastName: true,
              role: true,
              profilePicture: true,
              isGoogleUser: true,
              deletedAt: true,
            },
          });

          if (!user || user.deletedAt) {
            console.error(
              "[Authorize]: User not found or deactivated for email:",
              credentials.email
            );
            throw new Error("User not found or account deactivated");
          }

          if (user.isGoogleUser) {
            console.error(
              "[Authorize]: User attempted credentials login but is Google user:",
              user.id
            );
            throw new Error("Please sign in with Google");
          }

          if (!user.password) {
            console.error("[Authorize]: Password not set for user:", user.id);
            throw new Error(
              "Password not set. Use Google sign-in or reset password."
            );
          }

          console.log("[Authorize]: Comparing passwords for user:", user.id);
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );
          if (!isPasswordValid) {
            console.error("[Authorize]: Invalid password for user:", user.id);
            throw new Error("Invalid password");
          }

          console.log("[Authorize]: User authenticated successfully:", user.id);
          return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            profilePicture: user.profilePicture ?? undefined,
            isGoogleUser: user.isGoogleUser,
            redirectUrl:
              user.role === "ADMIN"
                ? "/admin/dashboard"
                : `/dashboard/${user.id}`,
          };
        } catch (error: any) {
          console.error("[Authorize Error]:", error.message, error.stack);
          throw new Error(error.message || "Authentication failed");
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope:
            "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.role = user.role;
        token.profilePicture = user.profilePicture;
        token.isGoogleUser = user.isGoogleUser;
        token.redirectUrl = user.redirectUrl;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          email: token.email,
          firstName: token.firstName,
          lastName: token.lastName,
          role: token.role,
          profilePicture: token.profilePicture,
          isGoogleUser: token.isGoogleUser,
        };
        session.redirectUrl = token.redirectUrl;
      }
      console.log("[Session Callback]: Session data:", session);
      return session;
    },
    async signIn({ user, account, profile }) {
      try {
        console.log(
          "[SignIn]: Processing sign-in for provider:",
          account?.provider,
          "user:",
          user.email
        );
        if (account?.provider === "google") {
          const email = user.email!.toLowerCase();
          console.log("[SignIn]: Looking up Google user with email:", email);
          const existingUser = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              role: true,
              firstName: true,
              lastName: true,
              profilePicture: true,
              isGoogleUser: true,
              password: true,
              deletedAt: true,
            },
          });

          if (existingUser) {
            if (existingUser.deletedAt) {
              console.error(
                "[SignIn]: Account deactivated for user:",
                existingUser.id
              );
              throw new Error("Your account has been deactivated or deleted.");
            }
            if (existingUser.password && !existingUser.isGoogleUser) {
              console.error(
                "[SignIn]: User has password but not marked as Google user:",
                existingUser.id
              );
              throw new Error(
                "An account with this email already exists with a password. Please sign in with your email and password."
              );
            }
            if (!existingUser.isGoogleUser) {
              console.log(
                "[SignIn]: Updating user to Google user:",
                existingUser.id
              );
              await prisma.user.update({
                where: { id: existingUser.id },
                data: { isGoogleUser: true },
              });
            }
            user.id = existingUser.id;
            user.role = existingUser.role;
            user.firstName = existingUser.firstName;
            user.lastName = existingUser.lastName;
            user.profilePicture = existingUser.profilePicture ?? undefined;
            user.isGoogleUser = true;
            user.redirectUrl =
              existingUser.role === "ADMIN"
                ? "/admin/dashboard"
                : `/dashboard/${existingUser.id}`;
          } else {
            console.log(
              "[SignIn]: Creating new Google user with email:",
              email
            );
            const newUser = await prisma.user.create({
              data: {
                email,
                firstName:
                  (profile as any)?.given_name ||
                  user.name?.split(" ")[0] ||
                  "",
                lastName:
                  (profile as any)?.family_name ||
                  user.name?.split(" ")[1] ||
                  "",
                profilePicture: user.image ?? undefined,
                role: "STUDENT",
                isGoogleUser: true,
              },
            });
            user.id = newUser.id;
            user.role = newUser.role;
            user.firstName = newUser.firstName;
            user.lastName = newUser.lastName;
            user.profilePicture = newUser.profilePicture ?? undefined;
            user.isGoogleUser = true;
            user.redirectUrl = `/dashboard/${newUser.id}`;

            console.log(
              "[SignIn]: Creating welcome notification for new user:",
              newUser.id
            );
            await prisma.notification.create({
              data: {
                userId: newUser.id,
                title: "Welcome to UDSM Hub System",
                message:
                  "Thank you for joining! Explore hubs, projects, and programmes.",
                type: "SYSTEM",
                priority: "MEDIUM",
                actionUrl: `/dashboard/${newUser.id}`,
              },
            });
          }

          if (account) {
            const accountKey = {
              provider: "google",
              providerAccountId: account.providerAccountId,
            };
            console.log(
              "[SignIn]: Checking existing Google account:",
              account.providerAccountId
            );
            const existingAccount = await prisma.account.findUnique({
              where: { provider_providerAccountId: accountKey },
            });
            if (!existingAccount) {
              console.log(
                "[SignIn]: Creating new Google account for user:",
                user.id
              );
              await prisma.account.create({
                data: {
                  userId: user.id!,
                  provider: "google",
                  providerAccountId: account.providerAccountId,
                  type: "oauth",
                  access_token: account.access_token,
                  refresh_token: account.refresh_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                },
              });
            } else if (existingAccount.userId !== user.id) {
              console.error(
                "[SignIn]: Google account linked to different user:",
                existingAccount.userId
              );
              throw new Error(
                "This Google account is already linked to another user. Please sign in with that account or contact support."
              );
            }
          }
        }

        const dbUser = await prisma.user.findUnique({
          where: { email: user.email!.toLowerCase() },
          select: { id: true, role: true },
        });

        if (!dbUser) {
          console.error("[SignIn]: User not found in database:", user.email);
          throw new Error("User not found in database");
        }

        user.redirectUrl =
          dbUser.role === "ADMIN"
            ? "/admin/dashboard"
            : `/dashboard/${dbUser.id}`;
        console.log("[SignIn]: Setting redirectUrl in user:", user.redirectUrl);
        return true; // Indicate successful authentication
      } catch (error: any) {
        console.error("[SignIn Error]:", error.message, error.stack);
        return `/auth/signin?error=${encodeURIComponent(
          error.message || "Sign-in failed"
        )}`;
      }
    },
    async redirect({ url, baseUrl }) {
      console.log("[Redirect Callback]: url:", url, "baseUrl:", baseUrl);
      try {
        // If the url is a relative path, prepend baseUrl
        if (url.startsWith("/")) {
          return `${baseUrl}${url}`;
        }
        // If the url is absolute and matches the baseUrl's origin, return it
        const parsedUrl = new URL(url);
        if (parsedUrl.origin === baseUrl) {
          return url;
        }
        // Fallback to the root URL
        return baseUrl;
      } catch (error) {
        console.error("[Redirect Callback]: Invalid URL:", url, error);
        return baseUrl; // Fallback to baseUrl if URL is invalid
      }
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  cookies: {
    sessionToken: {
      name: `${
        process.env.NODE_ENV === "production" ? "__Secure-" : ""
      }next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60,
      },
    },
  },
};
