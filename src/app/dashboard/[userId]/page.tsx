//src/app/dashboard/[userId]/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage({
  params,
}: {
  params: { userId: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  if (session.user.id !== params.userId) {
    redirect("/auth/signin");
  }

  // Fetch user data with related information
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    include: {
      hubs: {
        where: { deletedAt: null },
        include: {
          hub: {
            select: {
              id: true,
              name: true,
              description: true,
              logo: true,
              cardBio: true,
            },
          },
        },
      },
      programmes: {
        include: {
          programme: {
            select: {
              id: true,
              title: true,
              description: true,
              coverImage: true,
              hub: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
      eventRegistrations: {
        where: { status: "APPROVED" },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              description: true,
              coverImage: true,
              startDate: true,
              endDate: true,
              hub: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
      projectMembers: {
        where: { deletedAt: null },
        include: {
          project: {
            select: {
              id: true,
              title: true,
              description: true,
              coverImage: true,
              completionRate: true,
              hub: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  return <DashboardClient user={user} />;
}
