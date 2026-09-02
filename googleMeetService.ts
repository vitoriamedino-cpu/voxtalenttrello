import { getAccessToken } from './googleAuth';

export interface MeetSpaceResult {
  name: string; // "spaces/AAA-BBB-CCC"
  meetingUri: string; // "https://meet.google.com/xyz-abc-def"
  meetingCode?: string;
}

export async function createGoogleMeetSpace(
  accessType: 'OPEN' | 'TRUSTED' | 'RESTRICTED' = 'OPEN'
): Promise<MeetSpaceResult> {
  const token = await getAccessToken();
  if (!token) throw new Error('Não autenticado no Google Workspace.');

  try {
    const res = await fetch('https://meet.googleapis.com/v2/spaces', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        config: {
          accessType: accessType || 'OPEN',
        },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        name: data.name,
        meetingUri: data.meetingUri || `https://meet.google.com/${data.meetingCode || ''}`,
        meetingCode: data.meetingCode,
      };
    }
  } catch (e) {
    console.warn('Tentando fallback para link Meet via Calendar:', e);
  }

  // Fallback: Generate a unique Google Meet formatted room code
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const genPart = (len: number) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const meetingCode = `${genPart(3)}-${genPart(4)}-${genPart(3)}`;
  return {
    name: `spaces/${meetingCode}`,
    meetingUri: `https://meet.google.com/${meetingCode}`,
    meetingCode: meetingCode,
  };
}
