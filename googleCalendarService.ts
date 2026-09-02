import { getAccessToken } from './googleAuth';
import { createGoogleMeetSpace } from './googleMeetService';

export interface CalendarEventItem {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  htmlLink?: string;
  hangoutLink?: string;
  conferenceData?: any;
  attendees?: { email: string; responseStatus?: string }[];
}

export async function listUpcomingEvents(maxResults = 20, calendarId = 'primary'): Promise<CalendarEventItem[]> {
  const token = await getAccessToken();
  if (!token) throw new Error('Não autenticado no Google Workspace.');

  const now = new Date().toISOString();
  const encodedCalId = encodeURIComponent(calendarId || 'primary');
  const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodedCalId}/events`);
  url.searchParams.set('timeMin', now);
  url.searchParams.set('maxResults', maxResults.toString());
  url.searchParams.set('singleEvents', 'true');
  url.searchParams.set('orderBy', 'startTime');

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Erro ao carregar eventos do Google Agenda');
  }

  const data = await res.json();
  return data.items || [];
}

/**
 * Lists all events scheduled on a specific date (YYYY-MM-DD)
 */
export async function listEventsForDate(dateStr: string, calendarId = 'primary'): Promise<CalendarEventItem[]> {
  const token = await getAccessToken();
  if (!token) throw new Error('Não autenticado no Google Workspace.');

  // Date boundaries for the selected day in Brazil time (-03:00)
  const timeMin = `${dateStr}T00:00:00-03:00`;
  const timeMax = `${dateStr}T23:59:59-03:00`;

  const encodedCalId = encodeURIComponent(calendarId || 'primary');
  const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodedCalId}/events`);
  url.searchParams.set('timeMin', new Date(timeMin).toISOString());
  url.searchParams.set('timeMax', new Date(timeMax).toISOString());
  url.searchParams.set('singleEvents', 'true');
  url.searchParams.set('orderBy', 'startTime');
  url.searchParams.set('maxResults', '50');

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Erro ao consultar eventos da data no Google Agenda');
  }

  const data = await res.json();
  return data.items || [];
}

/**
 * Searches events in Google Calendar matching candidate name or query
 */
export async function searchCalendarEvents(query: string, calendarId = 'primary'): Promise<CalendarEventItem[]> {
  const token = await getAccessToken();
  if (!token) throw new Error('Não autenticado no Google Workspace.');

  const encodedCalId = encodeURIComponent(calendarId || 'primary');
  const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodedCalId}/events`);
  url.searchParams.set('q', query);
  url.searchParams.set('maxResults', '15');
  url.searchParams.set('singleEvents', 'true');
  url.searchParams.set('orderBy', 'startTime');

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Erro ao buscar eventos no Google Agenda');
  }

  const data = await res.json();
  return data.items || [];
}

/**
 * Fetches a single event by event ID
 */
export async function getCalendarEvent(eventId: string, calendarId = 'primary'): Promise<CalendarEventItem> {
  const token = await getAccessToken();
  if (!token) throw new Error('Não autenticado no Google Workspace.');

  const encodedCalId = encodeURIComponent(calendarId || 'primary');
  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodedCalId}/events/${eventId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Erro ao carregar detalhes do evento no Google Agenda');
  }

  return res.json();
}

export async function createCalendarInterviewEvent(data: {
  summary: string;
  description?: string;
  location?: string;
  startIso: string;
  endIso: string;
  attendeeEmails?: string[];
  createMeetLink?: boolean;
  calendarId?: string;
  timeZone?: string;
}): Promise<CalendarEventItem> {
  const token = await getAccessToken();
  if (!token) throw new Error('Não autenticado no Google Workspace.');

  const targetCalendarId = encodeURIComponent(data.calendarId || 'primary');

  // If Meet requested, we can also pre-generate a Meet space or use conferenceData
  let preGeneratedMeetUri: string | null = null;
  if (data.createMeetLink) {
    try {
      const meetSpace = await createGoogleMeetSpace();
      if (meetSpace?.meetingUri) {
        preGeneratedMeetUri = meetSpace.meetingUri;
      }
    } catch (e) {
      console.warn('Fallback para conferenceData nativo do Calendar:', e);
    }
  }

  const enhancedDescription = [
    data.description || '',
    preGeneratedMeetUri ? `\n\nLink da Videochamada (Google Meet):\n${preGeneratedMeetUri}` : '',
  ].filter(Boolean).join('');

  const requestBody: any = {
    summary: data.summary,
    description: enhancedDescription,
    location: data.location || (preGeneratedMeetUri ? preGeneratedMeetUri : 'Google Meet (Online)'),
    start: {
      dateTime: data.startIso,
      timeZone: data.timeZone || 'America/Sao_Paulo',
    },
    end: {
      dateTime: data.endIso,
      timeZone: data.timeZone || 'America/Sao_Paulo',
    },
    attendees: data.attendeeEmails?.filter(Boolean).map((email) => ({ email })),
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 30 },
      ],
    },
  };

  if (data.createMeetLink) {
    requestBody.conferenceData = {
      createRequest: {
        requestId: `rs-meet-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        conferenceSolutionKey: {
          type: 'hangoutsMeet',
        },
      },
    };
  }

  const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${targetCalendarId}/events`);
  if (data.createMeetLink) {
    url.searchParams.set('conferenceDataVersion', '1');
  }

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Erro ao agendar evento no Google Agenda');
  }

  const createdEvent: CalendarEventItem = await res.json();

  // Extract Hangout / Meet link from conferenceData or fallback
  const meetUri =
    createdEvent.hangoutLink ||
    createdEvent.conferenceData?.entryPoints?.find((ep: any) => ep.entryPointType === 'video')?.uri ||
    preGeneratedMeetUri ||
    undefined;

  if (meetUri && !createdEvent.hangoutLink) {
    createdEvent.hangoutLink = meetUri;
  }

  return createdEvent;
}

export async function deleteCalendarEvent(eventId: string): Promise<boolean> {
  const token = await getAccessToken();
  if (!token) throw new Error('Não autenticado no Google Workspace.');

  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Erro ao remover evento do Google Agenda');
  }

  return true;
}

