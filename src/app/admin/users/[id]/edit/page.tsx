//src/app/admin/users/[id]/edit/page.tsx
"use server"; // Mark as Server Component

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import EditUserClient from "./edit-user-client"; // Move client component to separate file

export default async function EditUserPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { id: params.id, deletedAt: null },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      degreeProgramme: true,
      skills: true,
      profilePicture: true,
      isGoogleUser: true,
    },
  });

  if (!user) {
    redirect("/admin/users");
  }

  return <EditUserClient user={user} />;
}
