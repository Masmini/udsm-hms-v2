//src/app/admin/audit-logs/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import AuditLogsClient from "./audit-logs-client";

export default async function AuditLogsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/auth/signin");
  }

  return <AuditLogsClient />;
}
