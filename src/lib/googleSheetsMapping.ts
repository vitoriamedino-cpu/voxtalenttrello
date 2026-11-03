export const OFFICIAL_SPREADSHEET_ID = '1zVP9ypAgv8OOVtfaE0DiqQlMZXiLN_zXOlbdQVrMzUY';
export const OPERATIONAL_SHEET_HEADERS = {
  Unidades: ['unidade_id', 'nome_unidade'],
  Vagas: ['vaga_id', 'titulo', 'unidade_id', 'status', 'data_abertura', 'data_fechamento', 'meta_sla_dias', 'responsavel_id', 'criado_em', 'atualizado_em'],
  Pessoas: ['pessoa_id', 'nome', 'telefone', 'email', 'criado_em', 'atualizado_em'],
  Candidaturas: ['candidatura_id', 'pessoa_id', 'vaga_id', 'data_ultima_atualizacao', 'canal_origem', 'etapa_atual', 'status', 'data_primeiro_contato', 'data_entrevista_coletiva', 'data_entrevista_individual', 'justificativa', 'criado_em', 'atualizado_em'],
  Historico_Candidaturas: ['historico_id', 'candidatura_id', 'etapa_anterior', 'etapa_nova', 'status_anterior', 'status_novo', 'data_evento', 'usuario_id', 'observacao'],
  Acoes_Divulgacao: ['acao_id', 'vaga_id', 'data_acao', 'canal_divulgacao', 'veiculo_parceiro', 'tipo_acao', 'custo', 'criado_em'],
  Volume_CVs: ['volume_id', 'data_apuracao', 'vaga_id', 'quantidade_cvs', 'fonte_apuracao'],
} as const;
export const READ_ONLY_SHEET_NAMES = ['Listas', 'BI_Candidaturas', 'BI_Vagas', 'BI_Divulgacao', 'BI_Volume_CVs'] as const;
export const OPERATIONAL_SHEET_NAMES = Object.keys(OPERATIONAL_SHEET_HEADERS) as (keyof typeof OPERATIONAL_SHEET_HEADERS)[];
export function validateOperationalHeaders(headersBySheet: Record<string, string[]>): string[] {
  const errors: string[] = [];
  for (const [sheet, expected] of Object.entries(OPERATIONAL_SHEET_HEADERS)) {
    const actual = headersBySheet[sheet];
    if (!actual) { errors.push(`A aba obrigatória \"${sheet}\" não foi encontrada.`); continue; }
    const normalized = actual.map((header) => String(header ?? '').trim());
    const missing = expected.filter((header) => !normalized.includes(header));
    if (missing.length) errors.push(`Aba \"${sheet}\": cabeçalhos ausentes: ${missing.join(', ')}.`);
  }
  return errors;
}
export function assertOperationalWriteTarget(sheetName: string): void {
  if (!OPERATIONAL_SHEET_NAMES.includes(sheetName as keyof typeof OPERATIONAL_SHEET_HEADERS)) {
    throw new Error(`Escrita bloqueada: a aba \"${sheetName}\" não é operacional autorizada.`);
  }
}


export function assertOfficialOperationalRange(spreadsheetId: string, range: string): void {
  if (spreadsheetId !== OFFICIAL_SPREADSHEET_ID) throw new Error('Escrita bloqueada: ID da planilha não é o oficial.');
  const match = range.match(/^'?([^'!]+)'?!/);
  const tab = match?.[1];
  if (!tab) throw new Error('Escrita bloqueada: intervalo sem aba explícita.');
  assertOperationalWriteTarget(tab);
}
