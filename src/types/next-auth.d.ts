//src/types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      profilePicture?: string;
      isGoogleUser: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    profilePicture?: string;
    isGoogleUser: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    firstName: string;
    lastName: string;
    isGoogleUser: boolean;
  }
}
