//src/app/dashboard/[userId]/my-programmes/[programmeId]/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProgrammeDetailClient from "./programme-detail-client";

export default async function ProgrammeDetailPage({
  params,
}: {
  params: { userId: string; programmeId: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  if (session.user.id !== params.userId) {
    redirect("/auth/signin");
  }

  // Verify user is a member of this programme
  const programmeMembership = await prisma.programmeMember.findFirst({
    where: {
      userId: params.userId,
      programmeId: params.programmeId,
      deletedAt: null,
    },
  });

  if (!programmeMembership) {
    redirect(`/dashboard/${params.userId}/my-programmes`);
  }

  // Fetch detailed programme information
  const programme = await prisma.programme.findUnique({
    where: { id: params.programmeId },
    include: {
      hub: {
        select: {
          id: true,
          name: true,
          logo: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePicture: true,
              skills: true,
              bio: true,
            },
          },
        },
      },
      supervisors: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profilePicture: true,
          bio: true,
        },
      },
      media: {
        where: {
          deletedAt: null,
        },
        orderBy: {
          uploadedAt: "desc",
        },
        take: 10,
      },
      _count: {
        select: {
          members: true,
        },
      },
    },
  });

  if (!programme) {
    redirect(`/dashboard/${params.userId}/my-programmes`);
  }

  return (
    <ProgrammeDetailClient
      programme={programme}
      userMembership={programmeMembership}
      userId={params.userId}
    />
  );
}
