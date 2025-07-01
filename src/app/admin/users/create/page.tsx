// src/app/admin/users/create/page.tsx
"use server"; // Mark as Server Component

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import CreateUserClient from "./create-user-client"; // Move client component to separate file

export default async function CreateUserPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/auth/signin");
  }

  return <CreateUserClient />;
}
