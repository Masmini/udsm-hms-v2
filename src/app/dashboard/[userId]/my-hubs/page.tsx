import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MyHubsClient from "./my-hubs-client";

export default async function MyHubsPage({
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

  // Fetch user's hub memberships
  const hubMemberships = await prisma.hubMember.findMany({
    where: {
      userId: params.userId,
      deletedAt: null,
      isActive: true,
    },
    include: {
      hub: {
        include: {
          categories: true,
          _count: {
            select: {
              members: true,
              projects: true,
              events: true,
              programmes: true,
            },
          },
        },
      },
    },
    orderBy: {
      joinedAt: "desc",
    },
  });

  return (
    <MyHubsClient hubMemberships={hubMemberships} userId={params.userId} />
  );
}
