import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { auth, db } from './googleAuth';
import type { ContaUsuario } from '../types';
import { normalizeAccountEmail } from './accountAccessPolicy';

export { authorizeAccount, normalizeAccountEmail } from './accountAccessPolicy';
export type { AccountAccessReason, AccountAuthorization } from './accountAccessPolicy';

const COLLECTION = 'accessAccounts';
const emailDocumentId = (email: string) => normalizeAccountEmail(email);

export async function getAccountForEmail(email: string | null | undefined): Promise<ContaUsuario | null> {
  const normalizedEmail = normalizeAccountEmail(email);
  if (!normalizedEmail) return null;
  const snapshot = await getDoc(doc(db, COLLECTION, emailDocumentId(normalizedEmail)));
  if (!snapshot.exists()) return null;
  const account = snapshot.data() as ContaUsuario;
  if (normalizeAccountEmail(account.email) !== normalizedEmail) {
    throw new Error('Registro de acesso inconsistente: o e-mail do documento não corresponde ao usuário.');
  }
  return { ...account, id: snapshot.id };
}

export async function listAccessAccounts(): Promise<ContaUsuario[]> {
  const snapshot = await getDocs(collection(db, COLLECTION));
  const accounts = snapshot.docs.map((item) => ({ ...item.data(), id: item.id }) as ContaUsuario);
  const normalizedEmails = accounts.map((account) => normalizeAccountEmail(account.email));
  if (normalizedEmails.some((email) => !email) || new Set(normalizedEmails).size !== normalizedEmails.length) {
    throw new Error('A lista de acessos contém e-mails ausentes ou duplicados. Corrija o cadastro no Firestore.');
  }
  return accounts;
}

export async function createAccessAccount(account: ContaUsuario): Promise<void> {
  const email = normalizeAccountEmail(account.email);
  if (!email) throw new Error('Informe um e-mail válido para a conta.');
  await setDoc(doc(db, COLLECTION, emailDocumentId(email)), { ...account, id: email, email });
}

export async function updateAccessAccount(email: string, updates: Partial<ContaUsuario>): Promise<void> {
  const normalizedEmail = normalizeAccountEmail(email);
  if (!normalizedEmail) throw new Error('E-mail inválido para atualização da conta.');
  if (updates.email && normalizeAccountEmail(updates.email) !== normalizedEmail) {
    throw new Error('O e-mail de uma conta não pode ser alterado. Crie outro cadastro e desative o anterior.');
  }
  await updateDoc(doc(db, COLLECTION, emailDocumentId(normalizedEmail)), updates);
}

export async function deleteAccessAccount(email: string): Promise<void> {
  const normalizedEmail = normalizeAccountEmail(email);
  if (!normalizedEmail) throw new Error('E-mail inválido para exclusão da conta.');
  if (normalizedEmail === normalizeAccountEmail(auth.currentUser?.email)) {
    throw new Error('Não é permitido excluir a própria conta enquanto estiver conectada.');
  }
  await deleteDoc(doc(db, COLLECTION, emailDocumentId(normalizedEmail)));
}
