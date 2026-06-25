import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const candidate = await prisma.candidate.findUnique({
      where: { id: params.id },
      include: {
        jobPosting: {
          select: { title: true }
        },
        answers: {
          include: {
            question: {
              select: { text: true }
            }
          }
        },
        interviews: true
      }
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    return NextResponse.json(candidate);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { status, score, scoreDetails } = body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (score !== undefined) updateData.score = parseFloat(score);
    if (scoreDetails) updateData.scoreDetails = typeof scoreDetails === 'string' ? scoreDetails : JSON.stringify(scoreDetails);

    const candidate = await prisma.candidate.update({
      where: { id: params.id },
      data: updateData
    });

    return NextResponse.json(candidate);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
