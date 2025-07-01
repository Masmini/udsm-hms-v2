//src/lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

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
        if (!credentials?.email || !credentials?.password) {
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
          throw new Error("User not found or account deactivated");
        }

        if (user.isGoogleUser) {
          throw new Error("Please sign in with Google");
        }

        if (!user.password) {
          throw new Error(
            "Password not set. Use Google sign-in or reset password."
          );
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          profilePicture: user.profilePicture ?? undefined,
          isGoogleUser: user.isGoogleUser,
        };
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
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          const email = user.email!.toLowerCase();
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
              throw new Error("Your account has been deactivated or deleted.");
            }
            if (existingUser.password && !existingUser.isGoogleUser) {
              throw new Error(
                "An account with this email already exists with a password. Please sign in with your email and password."
              );
            }
            if (!existingUser.isGoogleUser) {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: { isGoogleUser: true },
              });
            }
            user.id = existingUser.id;
            user.role = existingUser.role;
            user.firstName = existingUser.firstName;
            user.lastName = existingUser.lastName;
            user.profilePicture = existingUser.profilePicture ?? undefined; // Fix: Convert null to undefined
            user.isGoogleUser = true;
          } else {
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
                profilePicture: user.image ?? undefined, // Ensure consistency
                role: "STUDENT",
                isGoogleUser: true,
              },
            });
            user.id = newUser.id;
            user.role = newUser.role;
            user.firstName = newUser.firstName;
            user.lastName = newUser.lastName;
            user.profilePicture = newUser.profilePicture ?? undefined; // Ensure consistency
            user.isGoogleUser = true;

            // Create welcome notification
            await prisma.notification.create({
              data: {
                userId: newUser.id,
                title: "Welcome to UDSM Hub System",
                message:
                  "Thank you for joining! Explore hubs, projects, and programmes.",
                type: "SYSTEM",
                priority: "MEDIUM",
                actionUrl: "/home/dashboard",
              },
            });
          }

          // Link Google account to Account model
          if (account) {
            const accountKey = {
              provider: "google",
              providerAccountId: account.providerAccountId,
            };
            const existingAccount = await prisma.account.findUnique({
              where: { provider_providerAccountId: accountKey },
            });
            if (!existingAccount) {
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
              throw new Error(
                "This Google account is already linked to another user. Please sign in with that account or contact support."
              );
            }
          }
        } catch (error: any) {
          console.error("Error handling Google sign-in:", error);
          throw new Error(error.message || "Google sign-in failed");
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.profilePicture = user.profilePicture; // Already string | undefined
        token.isGoogleUser = user.isGoogleUser;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.profilePicture = token.profilePicture as
          | string
          | undefined;
        session.user.isGoogleUser = token.isGoogleUser as boolean;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      const parsedUrl = new URL(url);
      let callbackUrl = parsedUrl.searchParams.get("callbackUrl");
      if (callbackUrl) {
        callbackUrl = decodeURIComponent(callbackUrl);
        if (callbackUrl.startsWith("/") && !callbackUrl.startsWith("/auth")) {
          return `${baseUrl}${callbackUrl}`;
        }
      }
      // Fetch session to determine role
      const { getServerSession } = await import("next-auth");
      const session = await getServerSession(authOptions);
      return (
        baseUrl +
        (session?.user?.role === "ADMIN"
          ? "/admin/dashboard"
          : "/home/dashboard")
      );
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
