import { getAccessToken } from './googleAuth';
import {
  Vaga,
  Candidato,
  AcaoCusto,
  VolumeCV,
  ContaUsuario,
  UnidadeVox,
  UnidadeVoxInfo,
  EtapaProcesso,
  StatusCandidato,
  StatusVaga,
} from '../types';
import { DADOS_UNIDADES_VOX } from './rsConstants';

export const STORAGE_SHEET_ID_KEY = 'voxtalent_master_sheet_id';
export { OFFICIAL_SPREADSHEET_ID, OPERATIONAL_SHEET_HEADERS, READ_ONLY_SHEET_NAMES, OPERATIONAL_SHEET_NAMES, validateOperationalHeaders, assertOperationalWriteTarget, assertOfficialOperationalRange } from './googleSheetsMapping';
import { OFFICIAL_SPREADSHEET_ID, OPERATIONAL_SHEET_HEADERS, READ_ONLY_SHEET_NAMES, OPERATIONAL_SHEET_NAMES, validateOperationalHeaders, assertOfficialOperationalRange } from './googleSheetsMapping';

export interface SheetCreationResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
}

export interface GoogleSpreadsheetModel {
  spreadsheetId: string;
  properties: {
    title: string;
  };
  sheets: {
    properties: {
      sheetId: number;
      title: string;
      gridProperties?: {
        rowCount: number;
        columnCount: number;
      };
    };
  }[];
}

/** @deprecated Legacy tab names retained for UI compatibility only; never use for official workbook writes. */
export const SHEET_TABS = {
  PAINEL: 'Painel de Controle',
  VAGAS: 'Vagas',
  CANDIDATOS: 'Candidatos',
  CUSTOS: 'Custos Divulgação',
  VOLUME: 'Volume Semanal',
  UNIDADES: 'Unidades Vox',
  CONTAS: 'Contas & Acessos',
};

/**
 * Creates a brand new Google Spreadsheet with all required tabs.
 */
export async function createGoogleSheet(
  title: string,
  tabNames: string[] = Object.values(SHEET_TABS)
): Promise<SheetCreationResult> {
  throw new Error('Criação de planilha desabilitada: VoxTalent deve usar a planilha oficial existente.');
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Usuário não autenticado no Google Workspace.');
  }

  const sheetsPayload = tabNames.map((tabTitle, index) => ({
    properties: {
      sheetId: index + 1,
      title: tabTitle,
      gridProperties: {
        frozenRowCount: 1,
        rowCount: 100,
        columnCount: 20,
      },
    },
  }));

  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: sheetsPayload,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Erro ao criar planilha: ${errorData.error?.message || response.statusText}`
    );
  }

  const data = await response.json();
  const spreadsheetId = data.spreadsheetId;
  const spreadsheetUrl =
    data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

  return {
    spreadsheetId,
    spreadsheetUrl,
    title,
  };
}

/**
 * Writes or updates values in a specific range of a spreadsheet
 */
export async function updateSheetValues(
  spreadsheetId: string,
  range: string,
  values: (string | number | boolean)[][]
): Promise<any> {
  assertOfficialOperationalRange(spreadsheetId, range);
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Usuário não autenticado no Google Workspace.');
  }

  const encodedRange = encodeURIComponent(range);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}?valueInputOption=USER_ENTERED`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range,
      majorDimension: 'ROWS',
      values,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Erro ao atualizar planilha: ${errorData.error?.message || response.statusText}`
    );
  }

  return response.json();
}

/**
 * Appends rows to a sheet
 */
export async function appendSheetValues(
  spreadsheetId: string,
  range: string,
  values: (string | number | boolean)[][]
): Promise<any> {
  assertOfficialOperationalRange(spreadsheetId, range);
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Usuário não autenticado no Google Workspace.');
  }

  const encodedRange = encodeURIComponent(range);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range,
      majorDimension: 'ROWS',
      values,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Erro ao adicionar dados na planilha: ${errorData.error?.message || response.statusText}`
    );
  }

  return response.json();
}

/**
 * Clears values from a range
 */
export async function clearSheetRange(
  spreadsheetId: string,
  range: string
): Promise<any> {
  throw new Error(`Limpeza de intervalos está desabilitada por segurança (${range}). Use atualizações pontuais validadas.`);
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Usuário não autenticado no Google Workspace.');
  }

  const encodedRange = encodeURIComponent(range);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}:clear`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Erro ao limpar intervalo da planilha: ${errorData.error?.message || response.statusText}`
    );
  }

  return response.json();
}

/**
 * Reads values from a specific range of a spreadsheet
 */
export async function getSheetValues(
  spreadsheetId: string,
  range: string
): Promise<string[][]> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Usuário não autenticado no Google Workspace.');
  }

const encodedRange = encodeURIComponent(range);
const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Erro ao ler dados da planilha: ${errorData.error?.message || response.statusText}`
    );
  }

  const data = await response.json();
  return data.values || [];
}

/**
 * Retrieves metadata for a spreadsheet
 */
export async function getSpreadsheetDetails(
  spreadsheetId: string
): Promise<GoogleSpreadsheetModel> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Usuário não autenticado no Google Workspace.');
  }

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?includeGridData=false`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Erro ao obter detalhes da planilha: ${errorData.error?.message || response.statusText}`
    );
  }

  return response.json();
}

/**
 * Builds rows for the Painel de Controle (Summary & KPIs) sheet
 */
export function buildPainelDeControleRows(
  vagas: Vaga[],
  candidatos: Candidato[],
  custos: AcaoCusto[],
  volumeCvs: VolumeCV[]
): (string | number)[][] {
  const totalVagas = vagas.length;
  const vagasAbertas = vagas.filter((v) => v.status === 'Em aberto').length;
  const vagasFechadas = vagas.filter((v) => v.status === 'Fechada').length;
  const vagasCongeladas = vagas.filter((v) => v.status === 'Congelada').length;

  const totalCandidatos = candidatos.length;
  const candidatosEmAndamento = candidatos.filter((c) => c.status === 'Em andamento').length;
  const candidatosAprovados = candidatos.filter((c) => c.status === 'Aprovado').length;
  const candidatosBanco = candidatos.filter(
    (c) => c.etapa_processo === 'Banco de Talentos'
  ).length;
  const candidatosReprovados = candidatos.filter((c) => c.status === 'Reprovado').length;
  const candidatosAusentes = candidatos.filter((c) => c.status === 'Ausente').length;

  const custoTotal = custos.reduce((acc, c) => acc + (Number(c.valor) || 0), 0);
  const totalCvsRecebidos = volumeCvs.reduce((acc, v) => acc + (Number(v.quantidade_cvs) || 0), 0);
  const totalCvsAprovados = volumeCvs.reduce((acc, v) => acc + (Number(v.quantidade_aprovados) || 0), 0);
  const taxaConversao =
    totalCvsRecebidos > 0
      ? ((totalCvsAprovados / totalCvsRecebidos) * 100).toFixed(1)
      : '0.0';

  const nowStr = new Date().toLocaleString('pt-BR');

  // Breakdown by unit
  const unitsMap: Record<
    string,
    { vagasAbertas: number; candidatosAtivos: number; contratados: number; investimento: number }
  > = {};

  Object.keys(DADOS_UNIDADES_VOX).forEach((u) => {
    unitsMap[u] = { vagasAbertas: 0, candidatosAtivos: 0, contratados: 0, investimento: 0 };
  });

  vagas.forEach((v) => {
    if (v.status === 'Em aberto' && unitsMap[v.unidade]) {
      unitsMap[v.unidade].vagasAbertas += 1;
    }
  });

  candidatos.forEach((c) => {
    if (unitsMap[c.unidade]) {
      if (c.status === 'Em andamento') unitsMap[c.unidade].candidatosAtivos += 1;
      if (c.status === 'Aprovado') unitsMap[c.unidade].contratados += 1;
    }
  });

  custos.forEach((c) => {
    if (unitsMap[c.unidade]) {
      unitsMap[c.unidade].investimento += Number(c.valor) || 0;
    }
  });

  const rows: (string | number)[][] = [
    ['VOXTALENT - PAINEL DE CONTROLE DE RECRUTAMENTO & SELEÇÃO', '', '', '', ''],
    ['Sistema de Gestão R&S - Vox2you / Grupo Maester', '', '', '', ''],
    ['Última Atualização no Sheets:', nowStr, 'Status do Banco de Dados:', 'CONECTADO & SINCRONIZADO', ''],
    ['', '', '', '', ''],
    ['--- INDICADORES PRINCIPAIS DE GESTÃO (KPIS) ---', '', '', '', ''],
    ['Métrica / Indicador', 'Valor Atual', 'Classificação / Detalhes', '', ''],
    ['Total de Vagas Cadastradas', totalVagas, `${vagasAbertas} em aberto, ${vagasFechadas} fechadas, ${vagasCongeladas} congeladas`, '', ''],
    ['Vagas Ativas (Em Aberto)', vagasAbertas, 'Demandas imediatas de recrutamento', '', ''],
    ['Candidatos Ativos no Pipeline', candidatosEmAndamento, 'Em triagem, entrevistas ou etapas práticas', '', ''],
    ['Contratações / Aprovados', candidatosAprovados, 'Candidatos aprovados no processo', '', ''],
    ['Candidatos Ausentes', candidatosAusentes, 'Necessitam reagendamento de entrevista', '', ''],
    ['Banco de Talentos', candidatosBanco, 'Profissionais qualificados para resgate', '', ''],
    ['Candidatos Reprovados', candidatosReprovados, 'Histórico de triagem e feedback', '', ''],
    ['Investimento Total em Mídia (R$)', `R$ ${custoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Meta Ads, LinkedIn, InfoJobs, etc.', '', ''],
    ['Total de CVs Recebidos', totalCvsRecebidos, 'Volume captado em canais de atração', '', ''],
    ['Taxa de Conversão Global', `${taxaConversao}%`, 'Aprovados vs. Total de CVs recebidos', '', ''],
    ['', '', '', '', ''],
    ['--- CONSOLIDAÇÃO POR UNIDADE FRANQUEADA (9 UNIDADES) ---', '', '', '', ''],
    ['Unidade Vox', 'Vagas Abertas', 'Candidatos Ativos', 'Contratados', 'Investimento Total (R$)'],
  ];

  Object.entries(unitsMap).forEach(([unidade, data]) => {
    rows.push([
      unidade,
      data.vagasAbertas,
      data.candidatosAtivos,
      data.contratados,
      `R$ ${data.investimento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    ]);
  });

  return rows;
}

/**
 * Builds rows for the Vagas sheet
 */
export function buildVagasRows(vagas: Vaga[]): (string | number)[][] {
  const headers = [
    'ID Vaga',
    'Título da Vaga',
    'Cargo Estruturado',
    'Unidade',
    'Status',
    'Data Abertura',
    'Meta SLA (Dias)',
    'Prioridade',
    'Regime',
    'Faixa Salarial',
    'Vagas (Qtd)',
    'Responsável',
    'Descrição',
  ];

  const rows = vagas.map((v) => [
    v.id,
    v.titulo,
    v.cargo,
    v.unidade,
    v.status,
    v.data_abertura || '',
    v.meta_sla_dias || 10,
    v.prioridade || 'Média',
    v.regime || 'CLT',
    v.salario_range || '',
    v.quantidade_vagas || 1,
    v.responsavel || 'Luana Oliveira',
    v.descricao || '',
  ]);

  return [headers, ...rows];
}

/**
 * Builds rows for Candidatos sheet
 */
export function buildCandidatosRows(candidatos: Candidato[]): (string | number)[][] {
  const headers = [
    'ID Candidato',
    'Nome Completo',
    'Email',
    'Telefone / WhatsApp',
    'Vaga ID',
    'Título da Vaga',
    'Unidade Vox',
    'Etapa Kanban Atual',
    'Status Atual',
    'Origem CV',
    'Fluxo Simplificado',
    'Avaliação Geral (1-5)',
    'Data Aula Teste',
    'Nota Aula Teste',
    'Motivo Reprovação',
    'Notas Entrevista',
    'Data Cadastro',
    'Última Atualização',
  ];

  const rows = candidatos.map((c) => [
    c.id,
    c.nome,
    c.email || '',
    c.telefone || '',
    c.vaga_id,
    c.vaga_titulo,
    c.unidade,
    c.etapa_processo,
    c.status,
    c.origem_cv || 'InfoJobs',
    c.fluxo_simplificado ? 'Sim' : 'Não',
    c.avaliacao_geral || 0,
    c.aula_teste_data || '',
    c.aula_teste_nota || '',
    c.motivo_reprovacao || '',
    c.notas_entrevista || '',
    c.criado_em || '',
    c.atualizado_em || '',
  ]);

  return [headers, ...rows];
}

/**
 * Builds rows for Custos sheet
 */
export function buildCustosRows(custos: AcaoCusto[]): (string | number)[][] {
  const headers = [
    'ID Custo',
    'Data Lançamento',
    'Vaga ID',
    'Título da Vaga',
    'Unidade Vox',
    'Canal de Divulgação',
    'Valor Investido (R$)',
    'Observações',
  ];

  const rows = custos.map((c) => [
    c.id,
    c.data,
    c.vaga_id || '',
    c.vaga_titulo,
    c.unidade,
    c.canal,
    c.valor,
    c.observacoes || '',
  ]);

  return [headers, ...rows];
}

/**
 * Builds rows for Volume CVs sheet
 */
export function buildVolumeRows(volumeCvs: VolumeCV[]): (string | number)[][] {
  const headers = [
    'ID Volume',
    'Semana de Referência',
    'Vaga ID',
    'Título da Vaga',
    'Unidade Vox',
    'Canal',
    'Qtd CVs Recebidos',
    'Qtd Triados',
    'Qtd Aprovados',
    'Taxa Conversão (%)',
  ];

  const rows = volumeCvs.map((v) => {
    const conversao =
      v.quantidade_cvs > 0
        ? ((v.quantidade_aprovados / v.quantidade_cvs) * 100).toFixed(1)
        : '0.0';
    return [
      v.id,
      v.semana,
      v.vaga_id || '',
      v.vaga_titulo,
      v.unidade,
      v.canal,
      v.quantidade_cvs,
      v.quantidade_triados,
      v.quantidade_aprovados,
      `${conversao}%`,
    ];
  });

  return [headers, ...rows];
}

/**
 * Builds rows for Unidades Vox sheet
 */
export function buildUnidadesRows(): (string | number)[][] {
  const headers = [
    'Apelido Unidade',
    'Razão Social',
    'CNPJ Oficial',
    'Endereço Completo',
    'Cidade',
    'UF',
  ];

  const rows = Object.values(DADOS_UNIDADES_VOX).map((u) => [
    u.apelido,
    u.razaoSocial,
    u.cnpj,
    u.endereco,
    u.cidade,
    u.uf,
  ]);

  return [headers, ...rows];
}

/**
 * Builds rows for Contas de Usuários sheet
 */
export function buildContasRows(contas: ContaUsuario[]): (string | number)[][] {
  const headers = [
    'ID Usuário',
    'Nome Completo',
    'E-mail Corporativo',
    'Cargo',
    'Unidade Vinculada',
    'Nível de Acesso',
    'Status',
    'Criado Em',
    'Último Acesso',
  ];

  const rows = contas.map((c) => [
    c.id,
    c.nome,
    c.email,
    c.cargo,
    c.unidade,
    c.nivelAcesso,
    c.status,
    c.criadoEm || '',
    c.ultimoAcesso || '',
  ]);

  return [headers, ...rows];
}

/**
 * Initializes the master spreadsheet with all initial data
 */
export async function initializeMasterSpreadsheet(_appData: { vagas: Vaga[]; candidatos: Candidato[]; custos: AcaoCusto[]; volumeCvs: VolumeCV[]; contasUsuarios: ContaUsuario[]; unidades: UnidadeVoxInfo[] }): Promise<SheetCreationResult> {
  const details = await getSpreadsheetDetails(OFFICIAL_SPREADSHEET_ID);
  return { spreadsheetId: OFFICIAL_SPREADSHEET_ID, spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${OFFICIAL_SPREADSHEET_ID}`, title: details.properties.title };
}

const mapEtapaToSheet = (etapa: EtapaProcesso): string => {
  switch (etapa) {
    case '1º Contato':
      return 'Perguntas Customizadas';

    case 'Vídeo de Apresentação':
      return 'Vídeo de Apresentação';

    case 'Entrevista Coletiva (RH)':
      return 'Entrevista Coletiva (RH)';

    case 'Entrevista Individual (RH)':
      return 'Entrevista Individual (RH)';

    case 'Etapa Prática':
      return 'Etapa prática';

    case 'Gestor':
      return 'Entrevista com o Gestor';

    case 'Diretoria':
      return 'Entrevista com a Diretoria';

    case 'Banco de Talentos':
      return 'Banco de Talentos';

    default:
      return 'Triagem';
  }
};

/**
 * Legacy sync entry points are retained for compatibility, but are disabled.
 * Their historical ranges and sheet names do not match the official workbook.
 */
const LEGACY_SYNC_BLOCKED = 'Sincronização bloqueada: a rotina legada não está autorizada para o esquema oficial. Use o mapeamento validado antes de habilitar gravações.';

/** Compatibility exports for UI actions. Writes remain blocked until each action has a validated row-level mapping. */
export async function deleteCandidateFromGoogleSheets(_id: string): Promise<void> { throw new Error(LEGACY_SYNC_BLOCKED); }
export async function deleteVagaFromGoogleSheets(_id: string): Promise<void> { throw new Error(LEGACY_SYNC_BLOCKED); }
export async function deleteCostFromGoogleSheets(_id: string): Promise<void> { throw new Error(LEGACY_SYNC_BLOCKED); }
export async function deleteVolumeFromGoogleSheets(_id: string): Promise<void> { throw new Error(LEGACY_SYNC_BLOCKED); }
export async function saveUnidadeToGoogleSheets(_unidade: UnidadeVoxInfo, _previousApelido?: string): Promise<void> { throw new Error(LEGACY_SYNC_BLOCKED); }
export async function deleteUnidadeFromGoogleSheets(_apelido: string): Promise<void> { throw new Error(LEGACY_SYNC_BLOCKED); }

/** Legacy spreadsheet exports are disabled: new-sheet creation is not permitted. */
export async function exportCandidatesToSheets(_candidates: Candidato[]): Promise<SheetCreationResult> {
  throw new Error('Exportação para uma nova planilha está desabilitada. Use a planilha oficial vinculada.');
}

export async function exportFinancialsToSheets(_custos: AcaoCusto[], _volumeCvs: VolumeCV[]): Promise<SheetCreationResult> {
  throw new Error('Exportação para uma nova planilha está desabilitada. Use a planilha oficial vinculada.');
}

/** Upserts records by their official primary key. Existing rows are updated in place;
 * new IDs are appended. Only the exact official columns are ever written. */
export async function syncAllDataToMasterSheet(
  spreadsheetId: string,
  appData: { vagas: Vaga[]; candidatos: Candidato[]; custos: AcaoCusto[]; volumeCvs: VolumeCV[]; contasUsuarios?: ContaUsuario[]; unidades?: UnidadeVoxInfo[] }
): Promise<void> {
  if (spreadsheetId !== OFFICIAL_SPREADSHEET_ID) throw new Error('Apenas a planilha operacional oficial pode receber gravações.');

  // Atualiza somente campos representados no app; mantém colunas oficiais que o app não controla.
  const upsert = async (
    tab: keyof typeof OPERATIONAL_SHEET_HEADERS,
    records: Array<{ id: string; values: Record<string, string | number | boolean | undefined> }>
  ) => {
    const headers = [...OPERATIONAL_SHEET_HEADERS[tab]];
    const lastCol = String.fromCharCode(64 + headers.length);
    const sheet = quoteSheet(tab);
    const headerRows = await getSheetValues(spreadsheetId, `${sheet}!A1:${lastCol}1`);
    const errors = validateOperationalHeaders({ [tab]: (headerRows[0] || []).map(String) });
    if (errors.length) throw new Error(errors.join(' '));
    const existing = await getSheetValues(spreadsheetId, `${sheet}!A2:${lastCol}`);
    const index = new Map<string, number>();
    existing.forEach((row, i) => { if (row[0]) index.set(String(row[0]).trim(), i + 2); });
    for (const record of records) {
      const id = String(record.id || '').trim();
      if (!id) throw new Error(`Registro sem ID na aba ${tab}; gravação cancelada.`);
      const rowNumber = index.get(id);
      const old = rowNumber ? (existing[rowNumber - 2] || []) : [];
      const row = headers.map((header, col) => {
        const value = record.values[header];
        return value === undefined || value === null ? (old[col] ?? '') : value;
      });
      if (rowNumber) {
        await updateSheetValues(spreadsheetId, `${sheet}!A${rowNumber}:${lastCol}${rowNumber}`, [row]);
      } else {
        await appendSheetValues(spreadsheetId, `${sheet}!A:${lastCol}`, [row]);
        index.set(id, existing.length + 2);
      }
    }
  };

  const now = new Date().toISOString();
  await upsert('Vagas', appData.vagas.map(v => ({
    id: v.id,
    values: {
      vaga_id: v.id, titulo: v.titulo, unidade_id: v.unidade, status: v.status,
      data_abertura: v.data_abertura, meta_sla_dias: v.meta_sla_dias,
      atualizado_em: now,
    },
  })));

  const pessoaIdByCandidatura = new Map<string, string>();
  const pessoaRecords = appData.candidatos.map(c => {
    const pessoaId = (c as Candidato & { pessoa_id?: string }).pessoa_id || '';
    if (pessoaId) pessoaIdByCandidatura.set(c.id, pessoaId);
    return {
      id: pessoaId,
      values: { pessoa_id: pessoaId, nome: c.nome, telefone: c.telefone, email: c.email, atualizado_em: now },
    };
  }).filter(p => p.id);
  if (pessoaRecords.length) await upsert('Pessoas', pessoaRecords);

  await upsert('Candidaturas', appData.candidatos.map(c => ({
    id: c.id,
    values: {
      candidatura_id: c.id,
      pessoa_id: pessoaIdByCandidatura.get(c.id),
      vaga_id: c.vaga_id,
      data_ultima_atualizacao: c.atualizado_em || now,
      canal_origem: c.origem_cv || c.origem,
      etapa_atual: c.etapa_processo,
      status: c.status,
      data_entrevista_individual: c.data_entrevista,
      justificativa: c.motivo_reprovacao,
      atualizado_em: c.atualizado_em || now,
    },
  })));

  await upsert('Acoes_Divulgacao', appData.custos.map(c => ({
    id: c.id,
    values: {
      acao_id: c.id, vaga_id: c.vaga_id, data_acao: c.data,
      canal_divulgacao: c.canal, custo: c.valor,
    },
  })));

  await upsert('Volume_CVs', appData.volumeCvs.map(v => ({
    id: v.id,
    values: {
      volume_id: v.id, data_apuracao: v.data_apuracao || v.semana,
      vaga_id: v.vaga_id, quantidade_cvs: v.quantidade_cvs,
    },
  })));
}

const OFFICIAL_TABS = {
  UNIDADES: 'Unidades',
  PESSOAS: 'Pessoas',
  VAGAS: 'Vagas',
  CANDIDATURAS: 'Candidaturas',
  ACOES: 'Acoes_Divulgacao',
  VOLUME: 'Volume_CVs',
  HISTORICO: 'Historico_Candidaturas',
};

const quoteSheet = (name: string) => `'${name.replace(/'/g, "''")}'`;

const normalize = (value: unknown) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const toNumber = (value: unknown): number => {
  const text = String(value ?? '')
    .replace('R$', '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
    .trim();
  const number = Number(text);
  return Number.isFinite(number) ? number : 0;
};

const parseSheetDate = (value: unknown): string => {
  const text = String(value ?? '').trim();
  if (!text) return '';
  const br = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (br) return `${br[3]}-${br[2]}-${br[1]}`;
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
  return text;
};

const statusVaga = (value: unknown): StatusVaga => {
  const text = normalize(value);
  if (text.includes('aberto')) return 'Em aberto';
  if (text.includes('congel')) return 'Congelada';
  if (text.includes('cancel')) return 'Cancelada';
  if (text.includes('fech')) return 'Fechada';
  return 'Em aberto';
};

const etapa = (value: unknown): EtapaProcesso | null => {
  const text = normalize(value).replace(/[ªº]/g, 'o');
  if (!text) return null;
  if (text.includes('triagem')) return 'Triagem';
  if (text.includes('primeiro contato') || text.includes('1o contato') || text.includes('perguntas') || text.includes('contato inicial')) return '1º Contato';
  if (text.includes('video')) return 'Vídeo de Apresentação';
  if (text.includes('coletiva')) return 'Entrevista Coletiva (RH)';
  if (text.includes('individual')) return 'Entrevista Individual (RH)';
  if (text.includes('pratica') || text.includes('teste pratico') || text.includes('aula teste')) return 'Etapa Prática';
  if (text.includes('gestor') || text.includes('lider')) return 'Gestor';
  if (text.includes('diretoria')) return 'Diretoria';
  if (text.includes('banco')) return 'Banco de Talentos';
  return null;
};

const statusCandidato = (value: unknown): StatusCandidato | null => {
  const text = normalize(value);
  if (!text) return null;
  if (text.includes('aprov')) return 'Aprovado';
  if (text.includes('reprov')) return 'Reprovado';
  if (text.includes('desist')) return 'Desistente';
  if (text.includes('banco')) return 'Banco de Talentos';
  if (text.includes('ausente') || text.includes('faltou')) return 'Ausente';
  if (text.includes('andamento') || text.includes('processo') || text.includes('ativo')) return 'Em andamento';
  return null;
};

const getIsoWeek = (dateValue: string): string => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue || '';
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((utc.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${utc.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
};

export async function loadDatabaseFromGoogleSheets(
  spreadsheetId: string
): Promise<{
  vagas?: Vaga[];
  candidatos?: Candidato[];
  custos?: AcaoCusto[];
  volumeCvs?: VolumeCV[];
}> {
  // Join operational records to their source entities instead of displaying foreign keys.
  const [unidadesRows, vagasRows, pessoasRows, candidaturasRows, acoesRows, volumeRows] = await Promise.all([
    getSheetValues(spreadsheetId, `${quoteSheet(OFFICIAL_TABS.UNIDADES)}!A2:B`),
    getSheetValues(spreadsheetId, `${quoteSheet(OFFICIAL_TABS.VAGAS)}!A2:J`),
    getSheetValues(spreadsheetId, `${quoteSheet(OFFICIAL_TABS.PESSOAS)}!A2:F`),
    getSheetValues(spreadsheetId, `${quoteSheet(OFFICIAL_TABS.CANDIDATURAS)}!A2:M`),
    getSheetValues(spreadsheetId, `${quoteSheet(OFFICIAL_TABS.ACOES)}!A2:H`),
    getSheetValues(spreadsheetId, `${quoteSheet(OFFICIAL_TABS.VOLUME)}!A2:E`),
  ]);

  const unidadePorId = new Map(unidadesRows.filter(r => r[0]).map(r => [String(r[0]).trim(), String(r[1] ?? '').trim()]));
  const pessoaPorId = new Map(pessoasRows.filter(r => r[0]).map(r => [String(r[0]).trim(), {
    nome: String(r[1] ?? '').trim(),
    telefone: String(r[2] ?? '').trim(),
    email: String(r[3] ?? '').trim(),
  }]));

  const vagas: Vaga[] = vagasRows
    .filter((r) => r[0] && r[1])
    .map((r) => ({
      id: String(r[0]).trim(),
      titulo: String(r[1]).trim(),
      cargo: String(r[1]).trim(),
      unidade: unidadePorId.get(String(r[2] ?? '').trim()) || String(r[2] ?? '').trim(),
      status: statusVaga(r[3]),
      data_abertura: parseSheetDate(r[4]),
      meta_sla_dias: toNumber(r[6]),
      responsavel: String(r[7] ?? '').trim() || undefined,
      criado_em: String(r[8] ?? '').trim() || undefined,
      atualizado_em: String(r[9] ?? '').trim() || undefined,
      prioridade: 'Média',
      regime: 'CLT',
      quantidade_vagas: 1,
    }));

  const vagasPorId = new Map(vagas.map((vaga) => [vaga.id, vaga]));
  const candidatos: Candidato[] = candidaturasRows
    .filter((r) => r[0] && r[1])
    .map((r, index) => {
      const candidaturaId = String(r[0]).trim();
      const pessoaId = String(r[1]).trim();
      const pessoa = pessoaPorId.get(pessoaId);
      const vagaId = String(r[2] ?? '').trim();
      const vaga = vagasPorId.get(vagaId);
      const etapaAtual = etapa(r[5]) || 'Triagem';
      const statusAtual = statusCandidato(r[6]) || 'Em andamento';
      return {
        id: candidaturaId || `${pessoaId}-${vagaId}-${index}`,
        nome: pessoa?.nome || 'Nome não localizado',
        email: pessoa?.email || '',
        telefone: pessoa?.telefone || '',
        vaga_id: vagaId,
        vaga_titulo: vaga?.titulo || 'Vaga não localizada',
        unidade: vaga?.unidade || '',
        etapa_processo: etapaAtual,
        status: statusAtual,
        fluxo_simplificado: false,
        origem_cv: String(r[4] ?? '').trim(),
        criado_em: parseSheetDate(r[11]),
        atualizado_em: parseSheetDate(r[12] || r[3]),
        motivo_reprovacao: String(r[10] ?? '').trim() || undefined,
        historico_etapas: [{
          etapa: etapaAtual,
          data: parseSheetDate(r[3]),
          observacao: 'Carregado via aba Candidaturas',
        }],
      };
    });

  const custos: AcaoCusto[] = acoesRows.filter(r => r[0]).map(r => {
    const vagaId = String(r[1] ?? '').trim();
    const vaga = vagasPorId.get(vagaId);
    return {
      id: String(r[0]).trim(),
      vaga_id: vagaId,
      vaga_titulo: vaga?.titulo || 'Vaga não localizada',
      unidade: vaga?.unidade || '',
      data: parseSheetDate(r[2]),
      canal: String(r[3] ?? '').trim(),
      valor: toNumber(r[6]),
      observacoes: [r[4], r[5]].filter(Boolean).join(' | ') || undefined,
    };
  });

  const volumeCvs: VolumeCV[] = volumeRows.filter(r => r[0]).map(r => {
    const vagaId = String(r[2] ?? '').trim();
    const vaga = vagasPorId.get(vagaId);
    const data = parseSheetDate(r[1]);
    return {
      id: String(r[0]).trim(),
      semana: getIsoWeek(data),
      data_apuracao: data,
      vaga_id: vagaId,
      vaga_titulo: vaga?.titulo || 'Vaga não localizada',
      unidade: vaga?.unidade || '',
      canal: String(r[4] ?? '').trim(),
      quantidade_cvs: toNumber(r[3]),
      quantidade_triados: 0,
      quantidade_aprovados: 0,
    };
  });

  return { vagas, candidatos, custos, volumeCvs };
}
