import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateCandidateScore } from '@/lib/scoring';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get('jobId');

  try {
    const candidates = await prisma.candidate.findMany({
      where: jobId ? { jobPostingId: jobId } : {},
      orderBy: { score: 'desc' },
      include: {
        jobPosting: {
          select: { title: true }
        }
      }
    });
    return NextResponse.json(candidates);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Public route for candidates submitting their final data
  try {
    const body = await req.json();
    const {
      jobPostingId,
      name,
      email,
      phone,
      bio,
      address,
      web,
      socialUrls, // Array of strings
      education,  // Array of objects
      experience, // Array of objects
      skills,     // Array of objects
      resumeUrl,
      answers     // Array of { questionId, answer }
    } = body;

    if (!jobPostingId || !name || !email || !phone) {
      return NextResponse.json({ error: 'Missing mandatory candidate fields' }, { status: 400 });
    }

    // 1. Fetch Job and Screening Parameters
    const job = await prisma.jobPosting.findUnique({
      where: { id: jobPostingId },
      include: { screeningParameter: true }
    });

    if (!job) {
      return NextResponse.json({ error: 'Job Posting not found' }, { status: 404 });
    }

    // 2. Run Auto-Scoring Engine
    let totalScore = 0;
    let scoreDetailsObj = {};

    if (job.screeningParameter) {
      const scoringResult = calculateCandidateScore(
        {
          education: education || [],
          experience: experience || [],
          skills: skills || []
        },
        {
          minExperience: job.screeningParameter.minExperience,
          minGpa: job.screeningParameter.minGpa,
          minEducation: job.screeningParameter.minEducation,
          requiredSkills: job.screeningParameter.requiredSkills
        }
      );
      totalScore = scoringResult.totalScore;
      scoreDetailsObj = scoringResult.details;
    }

    // 3. Save Candidate profile to database
    // Handle double application check
    const existingCandidate = await prisma.candidate.findFirst({
      where: { jobPostingId, email }
    });

    if (existingCandidate) {
      return NextResponse.json({ error: 'Anda sudah melamar pekerjaan ini menggunakan email tersebut.' }, { status: 400 });
    }

    // Create Candidate record
    const candidate = await prisma.candidate.create({
      data: {
        jobPostingId,
        name,
        email,
        phone,
        bio: bio || null,
        address: address || null,
        web: web || null,
        socialUrls: JSON.stringify(socialUrls || []),
        education: JSON.stringify(education || []),
        experience: JSON.stringify(experience || []),
        skills: JSON.stringify(skills || []),
        resumeUrl: resumeUrl || null,
        score: totalScore,
        scoreDetails: JSON.stringify(scoreDetailsObj),
        status: 'SCREENED', // Auto-screened once score is computed
        answers: {
          create: (answers || []).map((ans: any) => ({
            questionId: ans.questionId,
            answer: ans.answer
          }))
        }
      },
      include: {
        answers: true
      }
    });

    // Auto-update status if below threshold
    if (job.screeningParameter && totalScore < job.screeningParameter.matchThreshold) {
      await prisma.candidate.update({
        where: { id: candidate.id },
        data: { status: 'REJECTED' }
      });
    } else if (job.screeningParameter && totalScore >= job.screeningParameter.matchThreshold) {
      await prisma.candidate.update({
        where: { id: candidate.id },
        data: { status: 'SHORTLISTED' }
      });
    }

    return NextResponse.json({ success: true, id: candidate.id });
  } catch (error: any) {
    console.error('Error saving candidate application:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
