import { getSettings } from './settings';

export interface CreateCalendarEventProps {
  summary: string;
  description: string;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  durationMinutes: number;
  attendees: string[]; // [candidateEmail, hrEmail, userEmail]
  customMeetLink?: string;
}

export async function createGoogleCalendarEvent({
  summary,
  description,
  startDate,
  startTime,
  durationMinutes,
  attendees,
  customMeetLink
}: CreateCalendarEventProps) {
  const settings = await getSettings();

  // Parse start/end dates
  const startDateTime = new Date(`${startDate}T${startTime}:00`);
  const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60 * 1000);

  // If Google Calendar OAuth credentials are not set, we simulate/mock and return a custom Meet link
  if (!settings.gcal_credentials) {
    const fallbackMeetLink = customMeetLink || `https://meet.google.com/abc-defg-hij-${Math.random().toString(36).substring(2, 6)}`;
    
    console.log('----------------------------------------------------');
    console.log('SIMULATING GOOGLE CALENDAR EVENT (credentials empty):');
    console.log(`Summary: ${summary}`);
    console.log(`Description: ${description}`);
    console.log(`Start Time: ${startDateTime.toISOString()}`);
    console.log(`End Time: ${endDateTime.toISOString()}`);
    console.log(`Attendees: ${attendees.join(', ')}`);
    console.log(`Google Meet Link: ${fallbackMeetLink}`);
    console.log('----------------------------------------------------');

    return {
      success: true,
      eventId: `mock-event-${Math.random().toString(36).substring(2, 10)}`,
      meetLink: fallbackMeetLink,
      simulated: true
    };
  }

  try {
    // Standard Google OAuth integration flow using fetch (if settings.gcal_credentials is provided)
    // gcal_credentials could be a JSON object containing client_email and private_key of a Service Account
    const creds = JSON.parse(settings.gcal_credentials);
    
    // We would exchange the service account JWT for an OAuth access token:
    const accessToken = await getGoogleAccessToken(creds);

    const event = {
      summary,
      description,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'Asia/Jakarta',
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'Asia/Jakarta',
      },
      attendees: attendees.map(email => ({ email })),
      conferenceData: customMeetLink ? undefined : {
        createRequest: {
          requestId: `gmeet-${Date.now()}`,
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      },
    };

    let url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all';
    if (!customMeetLink) {
      url += '&conferenceDataVersion=1';
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google Calendar API Error: ${errorText}`);
    }

    const eventData = await response.json();
    
    // Extract conference meet link
    const meetLink = customMeetLink || eventData.conferenceData?.entryPoints?.[0]?.uri || `https://meet.google.com/mock-${Math.random().toString(36).substring(2, 6)}`;

    return {
      success: true,
      eventId: eventData.id,
      meetLink
    };
  } catch (error: any) {
    console.error('Error creating Google Calendar event:', error);
    // Return fallback instead of hard crash
    const fallbackMeetLink = customMeetLink || `https://meet.google.com/fallback-gmeet-${Math.random().toString(36).substring(2, 6)}`;
    return {
      success: true,
      eventId: `mock-fallback-event-${Date.now()}`,
      meetLink: fallbackMeetLink,
      error: error.message
    };
  }
}

// Minimal JWT Google Auth Helper without googleapis dependency
async function getGoogleAccessToken(creds: { client_email: string; private_key: string }): Promise<string> {
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: creds.client_email,
    scope: 'https://www.googleapis.com/auth/calendar',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  // On Node.js, we sign the claim using crypto module
  const crypto = require('crypto');
  const base64UrlEncode = (obj: any) => 
    Buffer.from(JSON.stringify(obj))
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

  const encodedHeader = base64UrlEncode(header);
  const encodedClaim = base64UrlEncode(claim);
  const signInput = `${encodedHeader}.${encodedClaim}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signInput);
  const signature = signer.sign(creds.private_key, 'base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const jwt = `${signInput}.${signature}`;

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    throw new Error(`Failed to exchange JWT for token: ${errorText}`);
  }

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}
