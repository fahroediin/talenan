import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createGoogleCalendarEvent } from '@/lib/calendar';
import { sendEmail } from '@/lib/email';
import { getSettings } from '@/lib/settings';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const interviews = await prisma.interview.findMany({
      orderBy: { date: 'asc' },
      include: {
        candidate: {
          select: {
            name: true,
            email: true,
            jobPosting: {
              select: { title: true }
            }
          }
        }
      }
    });
    return NextResponse.json(interviews);
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
      candidateId,
      title,
      date,
      time,
      duration,
      hrEmail,
      userEmail,
      customMeetLink
    } = body;

    if (!candidateId || !title || !date || !time || !hrEmail || !userEmail) {
      return NextResponse.json({ error: 'Missing required interview fields' }, { status: 400 });
    }

    // 1. Fetch Candidate and Job detail
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      include: {
        jobPosting: true
      }
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    // 2. Schedule Event in Google Calendar
    console.log('Scheduling Google Calendar Event...');
    const calendarResult = await createGoogleCalendarEvent({
      summary: `${title}: ${candidate.name} - ${candidate.jobPosting.title}`,
      description: `Wawancara kerja untuk posisi ${candidate.jobPosting.title}.\nPeserta: \n- ${candidate.name} (Kandidat)\n- ${hrEmail} (HR)\n- ${userEmail} (User)`,
      startDate: date,
      startTime: time,
      durationMinutes: parseInt(duration) || 60,
      attendees: [candidate.email, hrEmail, userEmail],
      customMeetLink: customMeetLink || undefined
    });

    const meetLink = calendarResult.meetLink;
    const eventId = calendarResult.eventId;

    // 3. Create Interview DB Record
    const interview = await prisma.interview.create({
      data: {
        candidateId,
        title,
        date,
        time,
        duration: parseInt(duration) || 60,
        hrEmail,
        userEmail,
        meetLink,
        calendarEventId: eventId,
        status: 'SCHEDULED'
      }
    });

    // Update candidate status to INTERVIEW
    await prisma.candidate.update({
      where: { id: candidateId },
      data: { status: 'INTERVIEW' }
    });

    // 4. Send Confirmation Emails (Candidate, HR, User)
    const settings = await getSettings();
    
    // Process email template templateBody & templateSubject
    const parseTemplate = (tmpl: string) => {
      return tmpl
        .replace(/{{candidate_name}}/g, candidate.name)
        .replace(/{{job_title}}/g, candidate.jobPosting.title)
        .replace(/{{date}}/g, date)
        .replace(/{{time}}/g, time)
        .replace(/{{meet_link}}/g, meetLink)
        .replace(/{{hr_email}}/g, hrEmail)
        .replace(/{{user_email}}/g, userEmail)
        .replace(/{{from_name}}/g, settings.smtp_from_name);
    };

    const subject = parseTemplate(settings.email_subject_template);
    const bodyText = parseTemplate(settings.email_body_template);

    console.log('Sending emails to participants...');
    try {
      // Send email to candidate
      await sendEmail({
        to: candidate.email,
        subject,
        body: bodyText
      });

      // Send email to HR
      await sendEmail({
        to: hrEmail,
        subject: `[HR Invite] ${subject}`,
        body: `Halo HR,\n\nAnda dijadwalkan untuk wawancara dengan kandidat ${candidate.name}.\n\nDetail:\n${bodyText}`
      });

      // Send email to User
      await sendEmail({
        to: userEmail,
        subject: `[User Invite] ${subject}`,
        body: `Halo User,\n\nAnda dijadwalkan untuk wawancara dengan kandidat ${candidate.name}.\n\nDetail:\n${bodyText}`
      });
    } catch (emailErr) {
      console.error('Failed to send SMTP emails, calendar scheduled anyway:', emailErr);
    }

    return NextResponse.json({ success: true, interview });
  } catch (error: any) {
    console.error('Error creating interview schedule:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
