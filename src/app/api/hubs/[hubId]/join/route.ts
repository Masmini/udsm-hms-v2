import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { hubId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is already a member
    const existingMember = await prisma.hubMember.findFirst({
      where: {
        userId: session.user.id,
        hubId: params.hubId,
        deletedAt: null,
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'Already a member of this hub' },
        { status: 400 }
      );
    }

    // Check if there's already a pending request
    const existingRequest = await prisma.hubMembershipRequest.findFirst({
      where: {
        userId: session.user.id,
        hubId: params.hubId,
        status: 'PENDING',
        deletedAt: null,
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: 'Request already pending' },
        { status: 400 }
      );
    }

    // Create membership request
    const request = await prisma.hubMembershipRequest.create({
      data: {
        userId: session.user.id,
        hubId: params.hubId,
        status: 'PENDING',
      },
    });

    return NextResponse.json(
      { message: 'Membership request sent successfully', request },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating membership request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}