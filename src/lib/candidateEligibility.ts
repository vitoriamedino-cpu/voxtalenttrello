import type { Candidato } from '../types';

/** Candidatos encerrados não podem receber convites nem gerar novos dossiês. */
export const isCandidateProcessActive = (candidate: Pick<Candidato, 'status'> | null | undefined): boolean => {
  const status = String(candidate?.status || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
  return !['reprovado', 'desistente', 'desistiu', 'desistencia', 'reprovada', 'desistente pelo candidato'].includes(status);
};

export const getCandidateInactiveReason = (candidate: Pick<Candidato, 'status'>): string =>
  `Ação bloqueada: candidato com status "${candidate.status}". Candidatos reprovados ou desistentes não podem receber convites nem gerar novos dossiês.`;
