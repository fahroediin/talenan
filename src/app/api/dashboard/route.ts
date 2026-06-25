import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const totalJobs = await prisma.jobPosting.count();
    const totalCandidates = await prisma.candidate.count();
    const totalInterviews = await prisma.interview.count({
      where: { status: 'SCHEDULED' }
    });

    // Calculate average score of screened/shortlisted candidates
    const scoreAgg = await prisma.candidate.aggregate({
      _avg: {
        score: true
      }
    });
    const avgScore = scoreAgg._avg.score ? Math.round(scoreAgg._avg.score * 10) / 10 : 0;

    // Get 5 recent candidates
    const recentCandidates = await prisma.candidate.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        jobPosting: {
          select: { title: true }
        }
      }
    });

    return NextResponse.json({
      totalJobs,
      totalCandidates,
      totalInterviews,
      avgScore,
      recentCandidates
    });
  } catch (error: any) {
    console.error('Error fetching dashboard summary:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
