import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { hubId: string } }
) {
  try {
    const hub = await prisma.hub.findUnique({
      where: { id: params.hubId, deletedAt: null },
      include: {
        categories: true,
        members: {
          where: { deletedAt: null },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePicture: true,
                email: true,
                skills: true,
              },
            },
          },
        },
        projects: {
          where: { deletedAt: null },
          select: {
            id: true,
            title: true,
            description: true,
            coverImage: true,
            visibility: true,
            publishStatus: true,
            createdAt: true,
          },
        },
        programmes: {
          where: { deletedAt: null },
          select: {
            id: true,
            title: true,
            description: true,
            coverImage: true,
            publishStatus: true,
            createdAt: true,
          },
        },
        events: {
          where: { deletedAt: null },
          select: {
            id: true,
            title: true,
            description: true,
            coverImage: true,
            visibility: true,
            publishStatus: true,
            startDate: true,
            endDate: true,
          },
        },
        news: {
          where: { visibility: 'PUBLIC' },
          select: {
            id: true,
            title: true,
            excerpt: true,
            image: true,
            createdAt: true,
            author: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: {
          select: {
            members: true,
            projects: true,
            programmes: true,
            events: true,
          },
        },
      },
    });

    if (!hub) {
      return NextResponse.json({ error: 'Hub not found' }, { status: 404 });
    }

    return NextResponse.json(hub);
  } catch (error) {
    console.error('Error fetching hub:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}