//src/app/admin/system-health/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import SystemHealthClient from "./system-health-client";

export default async function SystemHealthPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/auth/signin");
  }

  return <SystemHealthClient />;
}
