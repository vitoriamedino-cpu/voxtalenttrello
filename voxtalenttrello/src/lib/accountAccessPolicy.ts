import type { ContaUsuario } from '../types';

export type AccountAccessReason = 'active' | 'missing-email' | 'not-registered' | 'inactive' | 'duplicate';
export interface AccountAuthorization {
  allowed: boolean;
  account: ContaUsuario | null;
  reason: AccountAccessReason;
}

export const normalizeAccountEmail = (email: string | null | undefined): string =>
  (email ?? '').trim().toLowerCase();

export function authorizeAccount(
  email: string | null | undefined,
  accounts: ContaUsuario[],
): AccountAuthorization {
  const normalizedEmail = normalizeAccountEmail(email);
  if (!normalizedEmail) return { allowed: false, account: null, reason: 'missing-email' };
  const matches = accounts.filter((account) => normalizeAccountEmail(account.email) === normalizedEmail);
  if (matches.length > 1) return { allowed: false, account: null, reason: 'duplicate' };
  if (!matches.length) return { allowed: false, account: null, reason: 'not-registered' };
  const account = matches[0];
  if (account.status !== 'Ativo') return { allowed: false, account, reason: 'inactive' };
  return { allowed: true, account, reason: 'active' };
}

