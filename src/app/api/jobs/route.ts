import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Generate url slug
function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start
    .replace(/-+$/, ''); // Trim - from end
}

export async function GET(req: NextRequest) {
  // Candidate pages might query jobs list, so public GET is allowed but restricted depending on status
  // or we can allow public read if request has a flag, or simply return active jobs.
  const { searchParams } = new URL(req.url);
  const onlyPublished = searchParams.get('published') === 'true';

  try {
    const jobs = await prisma.jobPosting.findMany({
      where: onlyPublished ? { status: 'PUBLISHED' } : {},
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { candidates: true }
        }
      }
    });
    return NextResponse.json(jobs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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
      minExperience,
      minGpa,
      minEducation,
      requiredSkills,
      matchThreshold,
      questions // Array of { text, type, options, required }
    } = body;

    if (!title || !description || !requirements) {
      return NextResponse.json({ error: 'Title, description, and requirements are required' }, { status: 400 });
    }

    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const slug = `${slugify(title)}-${randomSuffix}`;

    const job = await prisma.jobPosting.create({
      data: {
        title,
        slug,
        description,
        requirements,
        location: location || null,
        type: type || null,
        salaryRange: salaryRange || null,
        status: 'PUBLISHED', // default to published
        screeningParameter: {
          create: {
            minExperience: parseInt(minExperience) || 0,
            minGpa: parseFloat(minGpa) || 0,
            minEducation: minEducation || 'Any',
            requiredSkills: requiredSkills || '',
            matchThreshold: parseFloat(matchThreshold) || 50,
          }
        },
        questions: {
          create: (questions || []).map((q: any) => ({
            text: q.text,
            type: q.type,
            options: q.options || '',
            required: q.required !== false
          }))
        }
      },
      include: {
        screeningParameter: true,
        questions: true
      }
    });

    return NextResponse.json(job);
  } catch (error: any) {
    console.error('Error creating job posting:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
