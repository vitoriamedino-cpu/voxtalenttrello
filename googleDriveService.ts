import { getAccessToken } from './googleAuth';

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  iconLink?: string;
  createdTime?: string;
  modifiedTime?: string;
  size?: string;
}

export async function listDriveFiles(query?: string, pageSize = 25): Promise<DriveFileItem[]> {
  const token = await getAccessToken();
  if (!token) throw new Error('Não autenticado no Google Workspace.');

  let q = "trashed = false";
  if (query) {
    q += ` and ${query}`;
  }

  const url = new URL('https://www.googleapis.com/drive/v3/files');
  url.searchParams.set('q', q);
  url.searchParams.set('pageSize', pageSize.toString());
  url.searchParams.set('fields', 'files(id, name, mimeType, webViewLink, iconLink, createdTime, modifiedTime, size)');
  url.searchParams.set('orderBy', 'modifiedTime desc');

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Erro ${res.status} ao listar arquivos do Google Drive`);
  }

  const data = await res.json();
  return data.files || [];
}

export async function createDriveFolder(folderName: string, parentFolderId?: string): Promise<DriveFileItem> {
  const token = await getAccessToken();
  if (!token) throw new Error('Não autenticado no Google Workspace.');

  const metadata: any = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  };
  if (parentFolderId) {
    metadata.parents = [parentFolderId];
  }

  const res = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Erro ao criar pasta no Google Drive');
  }

  return await res.json();
}

export async function uploadTextFileToDrive(
  fileName: string,
  content: string,
  mimeType = 'text/plain',
  parentFolderId?: string
): Promise<DriveFileItem> {
  const token = await getAccessToken();
  if (!token) throw new Error('Não autenticado no Google Workspace.');

  const metadata: any = {
    name: fileName,
    mimeType: mimeType,
  };
  if (parentFolderId) {
    metadata.parents = [parentFolderId];
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    content +
    closeDelimiter;

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Erro ao fazer upload do arquivo para o Google Drive');
  }

  return await res.json();
}

export async function deleteDriveFile(fileId: string): Promise<boolean> {
  const token = await getAccessToken();
  if (!token) throw new Error('Não autenticado no Google Workspace.');

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Erro ao excluir arquivo no Google Drive');
  }

  return true;
}
