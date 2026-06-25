import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Public GET is allowed (for candidates applying via job ID/slug)
  try {
    const job = await prisma.jobPosting.findFirst({
      where: {
        OR: [
          { id: params.id },
          { slug: params.id }
        ]
      },
      include: {
        screeningParameter: true,
        questions: true,
        candidates: {
          orderBy: { score: 'desc' }
        }
      }
    });

    if (!job) {
      return NextResponse.json({ error: 'Job Posting not found' }, { status: 404 });
    }

    return NextResponse.json(job);
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
    const { 
      title, 
      description, 
      requirements, 
      location, 
      type, 
      salaryRange,
      status,
      minExperience,
      minGpa,
      minEducation,
      requiredSkills,
      matchThreshold,
      questions // Array of { id?, text, type, options, required, isDeleted? }
    } = body;

    // Check if job exists
    const existingJob = await prisma.jobPosting.findUnique({
      where: { id: params.id }
    });

    if (!existingJob) {
      return NextResponse.json({ error: 'Job Posting not found' }, { status: 404 });
    }

    // Update job data
    const updatedJob = await prisma.jobPosting.update({
      where: { id: params.id },
      data: {
        title,
        description,
        requirements,
        location: location || null,
        type: type || null,
        salaryRange: salaryRange || null,
        status: status || 'PUBLISHED',
        screeningParameter: {
          upsert: {
            create: {
              minExperience: parseInt(minExperience) || 0,
              minGpa: parseFloat(minGpa) || 0,
              minEducation: minEducation || 'Any',
              requiredSkills: requiredSkills || '',
              matchThreshold: parseFloat(matchThreshold) || 50,
            },
            update: {
              minExperience: parseInt(minExperience) || 0,
              minGpa: parseFloat(minGpa) || 0,
              minEducation: minEducation || 'Any',
              requiredSkills: requiredSkills || '',
              matchThreshold: parseFloat(matchThreshold) || 50,
            }
          }
        }
      }
    });

    // Update questions
    if (questions && Array.isArray(questions)) {
      for (const q of questions) {
        if (q.isDeleted && q.id) {
          await prisma.question.delete({ where: { id: q.id } });
        } else if (q.id) {
          await prisma.question.update({
            where: { id: q.id },
            data: {
              text: q.text,
              type: q.type,
              options: q.options || '',
              required: q.required !== false
            }
          });
        } else {
          await prisma.question.create({
            data: {
              jobPostingId: params.id,
              text: q.text,
              type: q.type,
              options: q.options || '',
              required: q.required !== false
            }
          });
        }
      }
    }

    return NextResponse.json(updatedJob);
  } catch (error: any) {
    console.error('Error updating job posting:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await prisma.jobPosting.delete({
      where: { id: params.id }
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
