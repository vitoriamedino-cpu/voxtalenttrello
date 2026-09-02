import { getAccessToken } from './googleAuth';
import {
  Vaga,
  Candidato,
  AcaoCusto,
  VolumeCV,
  ContaUsuario,
  UnidadeVox,
  EtapaProcesso,
  StatusCandidato,
  StatusVaga,
} from '../types';
import { DADOS_UNIDADES_VOX } from './rsConstants';

export const STORAGE_SHEET_ID_KEY = 'voxtalent_master_sheet_id';

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

/**
 * Standard tab titles of the master database spreadsheet
 */
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
export async function initializeMasterSpreadsheet(appData: {
  vagas: Vaga[];
  candidatos: Candidato[];
  custos: AcaoCusto[];
  volumeCvs: VolumeCV[];
  contasUsuarios: ContaUsuario[];
}): Promise<SheetCreationResult> {
  const title = `VoxTalent R&S - Banco de Dados Central [${new Date().toLocaleDateString('pt-BR')}]`;
  const sheetResult = await createGoogleSheet(title, Object.values(SHEET_TABS));
  const sheetId = sheetResult.spreadsheetId;

  // Save sheet id locally
  localStorage.setItem(STORAGE_SHEET_ID_KEY, sheetId);

  // Populate all tabs
  await syncAllDataToMasterSheet(sheetId, appData);

  return sheetResult;
}

/**
 * Pushes the full state of the application to the Google Sheets database
 */
export async function syncAllDataToMasterSheet(
  spreadsheetId: string,
  appData: {
    vagas: Vaga[];
    candidatos: Candidato[];
    custos: AcaoCusto[];
    volumeCvs: VolumeCV[];
    contasUsuarios: ContaUsuario[];
  }
): Promise<void> {
  const painelRows = buildPainelDeControleRows(
    appData.vagas,
    appData.candidatos,
    appData.custos,
    appData.volumeCvs
  );
  const vagasRows = buildVagasRows(appData.vagas);
  const candRows = buildCandidatosRows(appData.candidatos);
  const custosRows = buildCustosRows(appData.custos);
  const volumeRows = buildVolumeRows(appData.volumeCvs);
  const unidadesRows = buildUnidadesRows();
  const contasRows = buildContasRows(appData.contasUsuarios);

  // Clear and update each tab
  await Promise.all([
    (async () => {
      await clearSheetRange(spreadsheetId, `'${SHEET_TABS.PAINEL}'!A1:Z100`);
      await updateSheetValues(spreadsheetId, `'${SHEET_TABS.PAINEL}'!A1`, painelRows);
    })(),
    (async () => {
      await clearSheetRange(spreadsheetId, `'${SHEET_TABS.VAGAS}'!A1:Z500`);
      await updateSheetValues(spreadsheetId, `'${SHEET_TABS.VAGAS}'!A1`, vagasRows);
    })(),
    (async () => {
      await clearSheetRange(spreadsheetId, `'${SHEET_TABS.CANDIDATOS}'!A1:Z1000`);
      await updateSheetValues(spreadsheetId, `'${SHEET_TABS.CANDIDATOS}'!A1`, candRows);
    })(),
    (async () => {
      await clearSheetRange(spreadsheetId, `'${SHEET_TABS.CUSTOS}'!A1:Z500`);
      await updateSheetValues(spreadsheetId, `'${SHEET_TABS.CUSTOS}'!A1`, custosRows);
    })(),
    (async () => {
      await clearSheetRange(spreadsheetId, `'${SHEET_TABS.VOLUME}'!A1:Z500`);
      await updateSheetValues(spreadsheetId, `'${SHEET_TABS.VOLUME}'!A1`, volumeRows);
    })(),
    (async () => {
      await clearSheetRange(spreadsheetId, `'${SHEET_TABS.UNIDADES}'!A1:Z50`);
      await updateSheetValues(spreadsheetId, `'${SHEET_TABS.UNIDADES}'!A1`, unidadesRows);
    })(),
    (async () => {
      await clearSheetRange(spreadsheetId, `'${SHEET_TABS.CONTAS}'!A1:Z100`);
      await updateSheetValues(spreadsheetId, `'${SHEET_TABS.CONTAS}'!A1`, contasRows);
    })(),
  ]);
}

/**
 * Granular sync when a new Vaga is added
 */
export async function syncNewVagaToSheet(
  spreadsheetId: string,
  newVaga: Vaga,
  currentVagas: Vaga[],
  candidatos: Candidato[],
  custos: AcaoCusto[],
  volumeCvs: VolumeCV[]
): Promise<void> {
  const row = [
    newVaga.id,
    newVaga.titulo,
    newVaga.cargo,
    newVaga.unidade,
    newVaga.status,
    newVaga.data_abertura || '',
    newVaga.meta_sla_dias || 10,
    newVaga.prioridade || 'Média',
    newVaga.regime || 'CLT',
    newVaga.salario_range || '',
    newVaga.quantidade_vagas || 1,
    newVaga.responsavel || 'Luana Oliveira',
    newVaga.descricao || '',
  ];

  await appendSheetValues(spreadsheetId, `'${SHEET_TABS.VAGAS}'!A1`, [row]);

  // Update Painel de Controle KPIs
  const allVagas = [newVaga, ...currentVagas.filter((v) => v.id !== newVaga.id)];
  const painelRows = buildPainelDeControleRows(allVagas, candidatos, custos, volumeCvs);
  await updateSheetValues(spreadsheetId, `'${SHEET_TABS.PAINEL}'!A1`, painelRows);
}

/**
 * Granular sync when a new Candidato is added
 */
export async function syncNewCandidateToSheet(
  spreadsheetId: string,
  newCand: Candidato,
  vagas: Vaga[],
  currentCandidates: Candidato[],
  custos: AcaoCusto[],
  volumeCvs: VolumeCV[]
): Promise<void> {
  const row = [
    newCand.id,
    newCand.nome,
    newCand.email || '',
    newCand.telefone || '',
    newCand.vaga_id,
    newCand.vaga_titulo,
    newCand.unidade,
    newCand.etapa_processo,
    newCand.status,
    newCand.origem_cv || 'InfoJobs',
    newCand.fluxo_simplificado ? 'Sim' : 'Não',
    newCand.avaliacao_geral || 0,
    newCand.aula_teste_data || '',
    newCand.aula_teste_nota || '',
    newCand.motivo_reprovacao || '',
    newCand.notas_entrevista || '',
    newCand.criado_em || '',
    newCand.atualizado_em || '',
  ];

  await appendSheetValues(spreadsheetId, `'${SHEET_TABS.CANDIDATOS}'!A1`, [row]);

  // Update Painel de Controle KPIs
  const allCands = [newCand, ...currentCandidates.filter((c) => c.id !== newCand.id)];
  const painelRows = buildPainelDeControleRows(vagas, allCands, custos, volumeCvs);
  await updateSheetValues(spreadsheetId, `'${SHEET_TABS.PAINEL}'!A1`, painelRows);
}

/**
 * Pushes the full Candidatos dataset to the Candidatos tab and refreshes Painel de Controle KPIs
 */
export async function syncCandidatosToSheet(
  spreadsheetId: string,
  candidatos: Candidato[],
  vagas: Vaga[],
  custos: AcaoCusto[],
  volumeCvs: VolumeCV[]
): Promise<void> {
  const candRows = buildCandidatosRows(candidatos);
  const painelRows = buildPainelDeControleRows(vagas, candidatos, custos, volumeCvs);

  await Promise.all([
    (async () => {
      await clearSheetRange(spreadsheetId, `'${SHEET_TABS.CANDIDATOS}'!A1:Z1500`);
      await updateSheetValues(spreadsheetId, `'${SHEET_TABS.CANDIDATOS}'!A1`, candRows);
    })(),
    (async () => {
      await clearSheetRange(spreadsheetId, `'${SHEET_TABS.PAINEL}'!A1:Z100`);
      await updateSheetValues(spreadsheetId, `'${SHEET_TABS.PAINEL}'!A1`, painelRows);
    })(),
  ]);
}

/**
 * Pushes the full Vagas dataset to the Vagas tab and refreshes Painel de Controle KPIs
 */
export async function syncVagasToSheet(
  spreadsheetId: string,
  vagas: Vaga[],
  candidatos: Candidato[],
  custos: AcaoCusto[],
  volumeCvs: VolumeCV[]
): Promise<void> {
  const vagasRows = buildVagasRows(vagas);
  const painelRows = buildPainelDeControleRows(vagas, candidatos, custos, volumeCvs);

  await Promise.all([
    (async () => {
      await clearSheetRange(spreadsheetId, `'${SHEET_TABS.VAGAS}'!A1:Z500`);
      await updateSheetValues(spreadsheetId, `'${SHEET_TABS.VAGAS}'!A1`, vagasRows);
    })(),
    (async () => {
      await clearSheetRange(spreadsheetId, `'${SHEET_TABS.PAINEL}'!A1:Z100`);
      await updateSheetValues(spreadsheetId, `'${SHEET_TABS.PAINEL}'!A1`, painelRows);
    })(),
  ]);
}

/**
 * Pushes the full Custos dataset to the Custos tab and refreshes Painel de Controle KPIs
 */
export async function syncCustosToSheet(
  spreadsheetId: string,
  custos: AcaoCusto[],
  vagas: Vaga[],
  candidatos: Candidato[],
  volumeCvs: VolumeCV[]
): Promise<void> {
  const custosRows = buildCustosRows(custos);
  const painelRows = buildPainelDeControleRows(vagas, candidatos, custos, volumeCvs);

  await Promise.all([
    (async () => {
      await clearSheetRange(spreadsheetId, `'${SHEET_TABS.CUSTOS}'!A1:Z500`);
      await updateSheetValues(spreadsheetId, `'${SHEET_TABS.CUSTOS}'!A1`, custosRows);
    })(),
    (async () => {
      await clearSheetRange(spreadsheetId, `'${SHEET_TABS.PAINEL}'!A1:Z100`);
      await updateSheetValues(spreadsheetId, `'${SHEET_TABS.PAINEL}'!A1`, painelRows);
    })(),
  ]);
}

/**
 * Pushes the full Volume dataset to the Volume tab and refreshes Painel de Controle KPIs
 */
export async function syncVolumeToSheet(
  spreadsheetId: string,
  volumeCvs: VolumeCV[],
  vagas: Vaga[],
  candidatos: Candidato[],
  custos: AcaoCusto[]
): Promise<void> {
  const volumeRows = buildVolumeRows(volumeCvs);
  const painelRows = buildPainelDeControleRows(vagas, candidatos, custos, volumeCvs);

  await Promise.all([
    (async () => {
      await clearSheetRange(spreadsheetId, `'${SHEET_TABS.VOLUME}'!A1:Z500`);
      await updateSheetValues(spreadsheetId, `'${SHEET_TABS.VOLUME}'!A1`, volumeRows);
    })(),
    (async () => {
      await clearSheetRange(spreadsheetId, `'${SHEET_TABS.PAINEL}'!A1:Z100`);
      await updateSheetValues(spreadsheetId, `'${SHEET_TABS.PAINEL}'!A1`, painelRows);
    })(),
  ]);
}

/**
 * Granular sync when a new Custo is added
 */
export async function syncNewCustoToSheet(
  spreadsheetId: string,
  newCusto: AcaoCusto,
  vagas: Vaga[],
  candidatos: Candidato[],
  currentCustos: AcaoCusto[],
  volumeCvs: VolumeCV[]
): Promise<void> {
  const row = [
    newCusto.id,
    newCusto.data,
    newCusto.vaga_id || '',
    newCusto.vaga_titulo,
    newCusto.unidade,
    newCusto.canal,
    newCusto.valor,
    newCusto.observacoes || '',
  ];

  await appendSheetValues(spreadsheetId, `'${SHEET_TABS.CUSTOS}'!A1`, [row]);

  const allCustos = [newCusto, ...currentCustos.filter((c) => c.id !== newCusto.id)];
  const painelRows = buildPainelDeControleRows(vagas, candidatos, allCustos, volumeCvs);
  await updateSheetValues(spreadsheetId, `'${SHEET_TABS.PAINEL}'!A1`, painelRows);
}

/**
 * Granular sync when a new VolumeCV entry is added
 */
export async function syncNewVolumeToSheet(
  spreadsheetId: string,
  newVolume: VolumeCV,
  vagas: Vaga[],
  candidatos: Candidato[],
  custos: AcaoCusto[],
  currentVolume: VolumeCV[]
): Promise<void> {
  const conversao =
    newVolume.quantidade_cvs > 0
      ? ((newVolume.quantidade_aprovados / newVolume.quantidade_cvs) * 100).toFixed(1)
      : '0.0';

  const row = [
    newVolume.id,
    newVolume.semana,
    newVolume.vaga_id || '',
    newVolume.vaga_titulo,
    newVolume.unidade,
    newVolume.canal,
    newVolume.quantidade_cvs,
    newVolume.quantidade_triados,
    newVolume.quantidade_aprovados,
    `${conversao}%`,
  ];

  await appendSheetValues(spreadsheetId, `'${SHEET_TABS.VOLUME}'!A1`, [row]);

  const allVolume = [newVolume, ...currentVolume.filter((v) => v.id !== newVolume.id)];
  const painelRows = buildPainelDeControleRows(vagas, candidatos, custos, allVolume);
  await updateSheetValues(spreadsheetId, `'${SHEET_TABS.PAINEL}'!A1`, painelRows);
}

/**
 * Loads and parses full database from the master Google Sheet
 */
export async function loadDatabaseFromGoogleSheets(
  spreadsheetId: string
): Promise<{
  vagas?: Vaga[];
  candidatos?: Candidato[];
  custos?: AcaoCusto[];
  volumeCvs?: VolumeCV[];
}> {
  const result: {
    vagas?: Vaga[];
    candidatos?: Candidato[];
    custos?: AcaoCusto[];
    volumeCvs?: VolumeCV[];
  } = {};

  try {
    // Read Vagas
    const vagasValues = await getSheetValues(spreadsheetId, `'${SHEET_TABS.VAGAS}'!A2:Z500`);
    if (vagasValues && vagasValues.length > 0) {
      result.vagas = vagasValues
        .filter((r) => r[0] && r[1])
        .map((r, idx) => ({
          id: r[0] || `vaga-sheet-${idx}`,
          titulo: r[1] || 'Vaga Vox',
          cargo: r[2] || 'Professor',
          unidade: (r[3] as UnidadeVox) || 'Vox Tirol',
          status: (r[4] as StatusVaga) || 'Em aberto',
          data_abertura: r[5] || new Date().toISOString().split('T')[0],
          meta_sla_dias: Number(r[6]) || 10,
          prioridade: (r[7] as any) || 'Média',
          regime: (r[8] as any) || 'CLT',
          salario_range: r[9] || '',
          quantidade_vagas: Number(r[10]) || 1,
          responsavel: r[11] || 'Luana Oliveira',
          descricao: r[12] || '',
        }));
    }

    // Read Candidatos
    const candsValues = await getSheetValues(
      spreadsheetId,
      `'${SHEET_TABS.CANDIDATOS}'!A2:Z1000`
    );
    if (candsValues && candsValues.length > 0) {
      result.candidatos = candsValues
        .filter((r) => r[0] && r[1])
        .map((r, idx) => ({
          id: r[0] || `cand-sheet-${idx}`,
          nome: r[1],
          email: r[2] || '',
          telefone: r[3] || '',
          vaga_id: r[4] || '',
          vaga_titulo: r[5] || 'Vaga R&S',
          unidade: (r[6] as UnidadeVox) || 'Vox Tirol',
          etapa_processo: (r[7] as EtapaProcesso) || 'Triagem',
          status: (r[8] as StatusCandidato) || 'Em andamento',
          origem_cv: r[9] || 'InfoJobs',
          fluxo_simplificado: r[10] === 'Sim',
          avaliacao_geral: Number(r[11]) || 0,
          aula_teste_data: r[12] || undefined,
          aula_teste_nota: r[13] ? Number(r[13]) : undefined,
          motivo_reprovacao: r[14] || undefined,
          notas_entrevista: r[15] || '',
          criado_em: r[16] || new Date().toISOString(),
          atualizado_em: r[17] || new Date().toISOString(),
          historico_etapas: [
            {
              etapa: (r[7] as EtapaProcesso) || 'Triagem',
              data: new Date().toISOString().split('T')[0],
              observacao: 'Carregado via Google Sheets',
            },
          ],
        }));
    }

    // Read Custos
    const custosValues = await getSheetValues(
      spreadsheetId,
      `'${SHEET_TABS.CUSTOS}'!A2:Z500`
    );
    if (custosValues && custosValues.length > 0) {
      result.custos = custosValues
        .filter((r) => r[0])
        .map((r, idx) => ({
          id: r[0] || `custo-sheet-${idx}`,
          data: r[1] || new Date().toISOString().split('T')[0],
          vaga_id: r[2] || '',
          vaga_titulo: r[3] || 'Geral',
          unidade: (r[4] as UnidadeVox) || 'Vox Tirol',
          canal: r[5] || 'Meta Ads',
          valor: Number(r[6]) || 0,
          observacoes: r[7] || '',
        }));
    }

    // Read Volume
    const volumeValues = await getSheetValues(
      spreadsheetId,
      `'${SHEET_TABS.VOLUME}'!A2:Z500`
    );
    if (volumeValues && volumeValues.length > 0) {
      result.volumeCvs = volumeValues
        .filter((r) => r[0])
        .map((r, idx) => ({
          id: r[0] || `vol-sheet-${idx}`,
          semana: r[1] || '2026-W32',
          vaga_id: r[2] || '',
          vaga_titulo: r[3] || 'Geral',
          unidade: (r[4] as UnidadeVox) || 'Vox Tirol',
          canal: r[5] || 'InfoJobs',
          quantidade_cvs: Number(r[6]) || 0,
          quantidade_triados: Number(r[7]) || 0,
          quantidade_aprovados: Number(r[8]) || 0,
        }));
    }
  } catch (err) {
    console.error('Falha ao processar dados lidos do Google Sheets:', err);
  }

  return result;
}

/**
 * Legacy ad-hoc export functions for backwards compatibility
 */
export async function exportCandidatesToSheets(candidatos: Candidato[]): Promise<SheetCreationResult> {
  const title = `VoxTalent - Exportação Candidatos [${new Date().toLocaleDateString('pt-BR')}]`;
  const result = await createGoogleSheet(title, ['Candidatos']);
  const candRows = buildCandidatosRows(candidatos);
  await updateSheetValues(result.spreadsheetId, "'Candidatos'!A1", candRows);
  return result;
}

export async function exportFinancialsToSheets(
  custos: AcaoCusto[],
  volumeCvs: VolumeCV[]
): Promise<SheetCreationResult> {
  const title = `VoxTalent - Custos e Conversão [${new Date().toLocaleDateString('pt-BR')}]`;
  const result = await createGoogleSheet(title, ['Custos Divulgação', 'Volume Semanal']);
  const custosRows = buildCustosRows(custos);
  const volumeRows = buildVolumeRows(volumeCvs);

  await updateSheetValues(result.spreadsheetId, "'Custos Divulgação'!A1", custosRows);
  await updateSheetValues(result.spreadsheetId, "'Volume Semanal'!A1", volumeRows);
  return result;
}
