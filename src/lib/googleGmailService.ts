import { getAccessToken } from './googleAuth';

export interface GmailMessageSummary {
  id: string;
  threadId: string;
  snippet?: string;
  internalDate?: string;
}

function base64UrlEncode(str: string): string {
  const utf8Bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function sendGmailMessage(
  to: string,
  subject: string,
  bodyHtml: string,
  senderName = 'Vox2you R&S'
): Promise<any> {
  const token = await getAccessToken();
  if (!token) throw new Error('Não autenticado no Google Workspace.');

  const emailLines = [
    `To: ${to}`,
    `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    '',
    bodyHtml,
  ];

  const rawMessage = emailLines.join('\r\n');
  const encodedMessage = base64UrlEncode(rawMessage);

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      raw: encodedMessage,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Erro ao enviar email pelo Gmail');
  }

  return await res.json();
}

export async function listRecentSentMessages(maxResults = 10): Promise<any[]> {
  const token = await getAccessToken();
  if (!token) throw new Error('Não autenticado no Google Workspace.');

  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=in:sent&maxResults=${maxResults}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Erro ao carregar mensagens do Gmail');
  }

  const data = await res.json();
  const messages: any[] = [];

  if (data.messages && Array.isArray(data.messages)) {
    for (const msg of data.messages.slice(0, 5)) {
      try {
        const detailRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=To&metadataHeaders=Date`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (detailRes.ok) {
          const detail = await detailRes.json();
          const headers = detail.payload?.headers || [];
          const subject = headers.find((h: any) => h.name === 'Subject')?.value || '(Sem Assunto)';
          const toHeader = headers.find((h: any) => h.name === 'To')?.value || '';
          const dateHeader = headers.find((h: any) => h.name === 'Date')?.value || '';
          messages.push({
            id: detail.id,
            snippet: detail.snippet,
            subject,
            to: toHeader,
            date: dateHeader,
          });
        }
      } catch (e) {
        console.warn('Erro ao ler detalhe do email:', e);
      }
    }
  }

  return messages;
}
