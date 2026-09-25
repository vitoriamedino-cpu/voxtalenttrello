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
  // ============================================================
  // 1. CADASTRO DE VAGAS
  // ============================================================

  const vagasRows = appData.vagas.map((v) => [
    v.id,
    v.titulo,
    v.unidade,
    v.status,
    v.data_abertura || '',
    '',
    v.meta_sla_dias || 0,
  ]);

  // ============================================================
  // 2. PROCESSO SELETIVO
  // C e D são fórmulas da própria planilha.
  // Portanto, não escrevemos nessas colunas.
  // ============================================================

  const candidatosABRows = appData.candidatos.map((c) => [
    c.atualizado_em || '',
    c.vaga_id || '',
  ]);

  const candidatosENRows = appData.candidatos.map((c) => [
    c.nome || '',
    '',
    c.telefone || '',
    c.origem_cv || '',
    mapEtapaToSheet(c.etapa_processo),
    c.status || 'Em andamento',
    c.criado_em || '',
    '',
    '',
    c.motivo_reprovacao || '',
  ]);

  // ============================================================
  // 3. AÇÕES E CUSTOS
  // ============================================================

  const custosRows = appData.custos.map((c) => {
    const parceiro =
      c.observacoes?.match(/Veículo\/Parceiro:\s*(.*?)(?:\s*\||$)/)?.[1] || '';

    const tipoAcao =
      c.observacoes?.match(/Tipo de ação:\s*(.*?)(?:\s*\||$)/)?.[1] || '';

    return [
      c.data || '',
      c.vaga_id || '',
      c.canal || '',
      parceiro,
      tipoAcao,
      c.valor || 0,
    ];
  });

  // ============================================================
  // 4. VOLUME DE CVS SEMANAL
  // ============================================================

  const volumeRows = appData.volumeCvs.map((v) => [
    v.data_apuracao || '',
    v.vaga_id || '',
    v.quantidade_cvs || 0,
  ]);

  // ============================================================
  // LIMPEZA
  // Mantém os cabeçalhos e as fórmulas da planilha.
  // ============================================================

  await Promise.all([
    clearSheetRange(
      spreadsheetId,
      "'1. Cadastro de Vagas'!A2:G2000"
    ),

    clearSheetRange(
      spreadsheetId,
      "'2. Processo Seletivo'!A2:B2000"
    ),

    clearSheetRange(
      spreadsheetId,
      "'2. Processo Seletivo'!E2:N2000"
    ),

    clearSheetRange(
      spreadsheetId,
      "'3. Ações e Custos'!A2:F2000"
    ),

    clearSheetRange(
      spreadsheetId,
      "'4. Volume de CVs Semanal'!A2:C2000"
    ),
  ]);

  // ============================================================
  // ESCRITA
  // ============================================================

  await Promise.all([
    vagasRows.length > 0
      ? updateSheetValues(
          spreadsheetId,
          "'1. Cadastro de Vagas'!A2",
          vagasRows
        )
      : Promise.resolve(),

    candidatosABRows.length > 0
      ? updateSheetValues(
          spreadsheetId,
          "'2. Processo Seletivo'!A2",
          candidatosABRows
        )
      : Promise.resolve(),

    candidatosENRows.length > 0
      ? updateSheetValues(
          spreadsheetId,
          "'2. Processo Seletivo'!E2",
          candidatosENRows
        )
      : Promise.resolve(),

    custosRows.length > 0
      ? updateSheetValues(
          spreadsheetId,
          "'3. Ações e Custos'!A2",
          custosRows
        )
      : Promise.resolve(),

    volumeRows.length > 0
      ? updateSheetValues(
          spreadsheetId,
          "'4. Volume de CVs Semanal'!A2",
          volumeRows
        )
      : Promise.resolve(),
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
  const painelRows = buildPainelDeControleRows(
    vagas,
    candidatos,
    custos,
    volumeCvs
  );

  await Promise.all([
    (async () => {
      await clearSheetRange(
        spreadsheetId,
        `'${SHEET_TABS.VOLUME}'!A1:Z500`
      );

      await updateSheetValues(
        spreadsheetId,
        `'${SHEET_TABS.VOLUME}'!A1`,
        volumeRows
      );
    })(),

    (async () => {
      await clearSheetRange(
        spreadsheetId,
        `'${SHEET_TABS.PAINEL}'!A1:Z100`
      );

      await updateSheetValues(
        spreadsheetId,
        `'${SHEET_TABS.PAINEL}'!A1`,
        painelRows
      );
    })(),
  ]);
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

  const normalize = (value: unknown) =>
    String(value ?? "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const toNumber = (value: unknown): number => {
  const text = String(value ?? "")
    .replace("R$", "")
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .trim();

  const number = Number(text);
  return Number.isFinite(number) ? number : 0;
};

const parseSheetDate = (value: unknown): string => {
  const text = String(value ?? "").trim();

  if (!text) return "";

  const brMatch = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (brMatch) {
    const [, day, month, year] = brMatch;
    return `${year}-${month}-${day}`;
  }

  if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
    return text.slice(0, 10);
  }

  return text;
};

  const statusVaga = (value: unknown): StatusVaga => {
    const text = normalize(value);

    if (text.includes("aberto")) return "Em aberto";
    if (text.includes("congel")) return "Congelada";
    if (text.includes("cancel")) return "Cancelada";
    if (text.includes("fech")) return "Fechada";

    return "Em aberto";
  };

 const etapa = (value: unknown): EtapaProcesso => {
  const text = normalize(value);

  if (!text) return "Triagem";

  if (text.includes("triagem")) {
    return "Triagem";
  }

  if (
    text.includes("perguntas") ||
    text.includes("1º contato") ||
    text.includes("1o contato") ||
    text.includes("primeiro contato")
  ) {
    return "1º Contato";
  }

  if (
    text.includes("video") ||
    text.includes("vídeo")
  ) {
    return "Vídeo de Apresentação";
  }

  if (text.includes("coletiva")) {
    return "Entrevista Coletiva (RH)";
  }

  if (text.includes("individual")) {
    return "Entrevista Individual (RH)";
  }

  if (text.includes("pratica") || text.includes("prática")) {
    return "Etapa Prática";
  }

  if (text.includes("gestor")) {
    return "Gestor";
  }

  if (text.includes("diretoria")) {
    return "Diretoria";
  }

  if (text.includes("banco")) {
    return "Banco de Talentos";
  }

  return "Triagem";
};

  const statusCandidato = (value: unknown): StatusCandidato => {
    const text = normalize(value);

    if (text.includes("aprov")) return "Aprovado";
    if (text.includes("reprov")) return "Reprovado";
    if (text.includes("desist")) return "Desistente";
    if (text.includes("banco")) return "Banco de Talentos";
    if (text.includes("ausente")) return "Ausente";

    return "Em andamento";
  };

  const getIsoWeek = (dateValue: string): string => {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue || "";
    }

    const utcDate = new Date(
      Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      )
    );

    const dayNumber = utcDate.getUTCDay() || 7;

    utcDate.setUTCDate(
      utcDate.getUTCDate() + 4 - dayNumber
    );

    const yearStart = new Date(
      Date.UTC(
        utcDate.getUTCFullYear(),
        0,
        1
      )
    );

    const weekNumber = Math.ceil(
      (((utcDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7
    );

    return `${utcDate.getUTCFullYear()}-W${String(
      weekNumber
    ).padStart(2, "0")}`;
  };

  try {
    // ============================================================
    // 1. CADASTRO DE VAGAS
    // ============================================================

    const vagasValues = await getSheetValues(
      spreadsheetId,
      "'1. Cadastro de Vagas'!A2:G2000"
    );

    const vagas: Vaga[] = (vagasValues || [])
      .filter((r) => r[0] && r[1])
      .map((r) => {
        const id = String(r[0] || "").trim();
        const titulo = String(r[1] || "").trim();
        const unidade = String(r[2] || "").trim();

        return {
          id,
          titulo,
          cargo: titulo,
          unidade,
          status: statusVaga(r[3]),
          data_abertura: parseSheetDate(r[4]),
          meta_sla_dias: toNumber(r[6]),
          descricao: undefined,
          responsavel: undefined,
          prioridade: "Média",
          regime: "CLT",
          salario_range: undefined,
          quantidade_vagas: 1,
        };
      });

    result.vagas = vagas;

    const vagasPorId = new Map(
      vagas.map((vaga) => [vaga.id, vaga])
    );

    // ============================================================
    // 2. PROCESSO SELETIVO
    // ============================================================

    const candidatosValues = await getSheetValues(
      spreadsheetId,
      "'2. Processo Seletivo'!A2:N2000"
    );
    console.table(
  (candidatosValues || []).slice(0, 20).map((r) => ({
    nome: r[4],
    colunaH: r[7],
    colunaI_ETAPA: r[8],
    colunaJ_STATUS: r[9],
  }))
);

    result.candidatos = (candidatosValues || [])
      .filter((r) => r[1] && r[4])
      .map((r, index) => {
        const dataAtualizacao =
          String(r[0] || new Date().toISOString()).trim();

        const idVaga = String(r[1] || "").trim();

        const vaga = vagasPorId.get(idVaga);

        const vagaTitulo = String(
          r[2] || vaga?.titulo || "Vaga R&S"
        ).trim();

        const unidade = String(
          r[3] || vaga?.unidade || ""
        ).trim();

        const nome = String(r[4] || "").trim();
        const telefone = String(r[6] || "").trim();
        const origem = String(r[7] || "").trim();

const etapaOriginal = String(r[8] || "").trim();

const valorI = String(r[8] || "").trim();
const valorJ = String(r[9] || "").trim();

const iEhStatus = [
  "Aprovado",
  "Reprovado",
  "Desistente",
  "Ausente",
  "Banco de Talentos",
].includes(valorI);

const jEhStatus = [
  "Aprovado",
  "Reprovado",
  "Desistente",
  "Ausente",
  "Banco de Talentos",
].includes(valorJ);

const etapaAtual = iEhStatus && !jEhStatus
  ? etapa(valorJ)
  : etapa(valorI);

const statusAtual = iEhStatus && !jEhStatus
  ? statusCandidato(valorI)
  : statusCandidato(valorJ);

        const primeiroContato = String(r[10] || "").trim();
        const justificativa = String(r[13] || "").trim();

        const id =
          [
            "proc",
            idVaga,
            nome,
            telefone,
          ]
            .map((value) =>
              normalize(value).replace(
                /[^a-z0-9]+/g,
                "-"
              )
            )
            .filter(Boolean)
            .join("-") ||
          `cand-sheet-${index}`;

        return {
          id,
          nome,
          email: "",
          telefone,
          vaga_id: idVaga,
          vaga_titulo: vagaTitulo,
          unidade,
          etapa_processo: etapaAtual,
          status: statusAtual,
          fluxo_simplificado: false,
          origem_cv: origem,

          criado_em:
            primeiroContato || dataAtualizacao,

          atualizado_em: dataAtualizacao,

          motivo_reprovacao:
            statusAtual === "Reprovado" || statusAtual === "Desistente"
              ? justificativa || undefined
              : undefined,

          historico_etapas: [
            {
              etapa: etapaAtual,
              data: dataAtualizacao,
              observacao:
                "Carregado via aba 2. Processo Seletivo",
            },
          ],
        };
      });

    // ============================================================
    // 3. AÇÕES E CUSTOS
    // ============================================================

    const custosValues = await getSheetValues(
      spreadsheetId,
      "'3. Ações e Custos'!A2:F2000"
    );

    result.custos = (custosValues || [])
      .filter((r) => r[0] || r[1] || r[5])
      .map((r, index) => {
        const data = String(r[0] || "").trim();
        const vagaId = String(r[1] || "").trim();

        const vaga = vagasPorId.get(vagaId);

        const canal = String(r[2] || "").trim();
        const parceiro = String(r[3] || "").trim();
        const tipoAcao = String(r[4] || "").trim();

        const observacoes = [
          parceiro
            ? `Veículo/Parceiro: ${parceiro}`
            : "",
          tipoAcao
            ? `Tipo de ação: ${tipoAcao}`
            : "",
        ]
          .filter(Boolean)
          .join(" | ");

        return {
          id: `custo-${index}-${vagaId}-${data}`,
          vaga_id: vagaId,
          vaga_titulo:
            vaga?.titulo || "Vaga não localizada",
          unidade:
            vaga?.unidade || "",
          canal,
          valor: toNumber(r[5]),
          data,
          observacoes:
            observacoes || undefined,
        };
      });

    // ============================================================
    // 4. VOLUME DE CVS SEMANAL
    // ============================================================

    const volumeValues = await getSheetValues(
      spreadsheetId,
      "'4. Volume de CVs Semanal'!A2:C2000"
    );

    result.volumeCvs = (volumeValues || [])
      .filter((r) => r[0] || r[1] || r[2])
      .map((r, index) => {
        const dataApuracao = String(r[0] || "").trim();
        const vagaId = String(r[1] || "").trim();

        const vaga = vagasPorId.get(vagaId);

        return {
  id: `volume-${index}-${vagaId}-${dataApuracao}`,
  semana: getIsoWeek(dataApuracao),
  data_apuracao: dataApuracao,
          vaga_id: vagaId,
          vaga_titulo:
            vaga?.titulo || "Vaga não localizada",
          unidade:
            vaga?.unidade || "",
          canal: "",
          quantidade_cvs: toNumber(r[2]),
          quantidade_triados: 0,
          quantidade_aprovados: 0,
        };
      });

  } catch (err) {
    console.error(
      "Falha ao carregar dados do Google Sheets:",
      err
    );
  }

  return result;
}

