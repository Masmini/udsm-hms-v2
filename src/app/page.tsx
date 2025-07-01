//src/app/page.tsx
export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { LandingPage } from "@/components/landing/landing-page";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    if (session.user.role === "ADMIN") {
      redirect("/admin/dashboard");
    } else {
      redirect(`/dashboard/${session.user.id}`);
    }
  }

  return <LandingPage />;
}
