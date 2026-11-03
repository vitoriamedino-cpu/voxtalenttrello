import test from 'node:test';
import assert from 'node:assert/strict';
import {
  OFFICIAL_SPREADSHEET_ID,
  OPERATIONAL_SHEET_HEADERS,
  OPERATIONAL_SHEET_NAMES,
  READ_ONLY_SHEET_NAMES,
  validateOperationalHeaders,
  assertOperationalWriteTarget,
  assertOfficialOperationalRange,
} from '../src/lib/googleSheetsMapping.ts';

test('uses the existing official workbook ID', () => {
  assert.equal(OFFICIAL_SPREADSHEET_ID, '1zVP9ypAgv8OOVtfaE0DiqQlMZXiLN_zXOlbdQVrMzUY');
});

test('contains the exact headers for all seven operational sheets', () => {
  assert.deepEqual(OPERATIONAL_SHEET_NAMES, ['Unidades', 'Vagas', 'Pessoas', 'Candidaturas', 'Historico_Candidaturas', 'Acoes_Divulgacao', 'Volume_CVs']);
  assert.deepEqual(OPERATIONAL_SHEET_HEADERS, {
    Unidades: ['unidade_id', 'nome_unidade'],
    Vagas: ['vaga_id', 'titulo', 'unidade_id', 'status', 'data_abertura', 'data_fechamento', 'meta_sla_dias', 'responsavel_id', 'criado_em', 'atualizado_em'],
    Pessoas: ['pessoa_id', 'nome', 'telefone', 'email', 'criado_em', 'atualizado_em'],
    Candidaturas: ['candidatura_id', 'pessoa_id', 'vaga_id', 'data_ultima_atualizacao', 'canal_origem', 'etapa_atual', 'status', 'data_primeiro_contato', 'data_entrevista_coletiva', 'data_entrevista_individual', 'justificativa', 'criado_em', 'atualizado_em'],
    Historico_Candidaturas: ['historico_id', 'candidatura_id', 'etapa_anterior', 'etapa_nova', 'status_anterior', 'status_novo', 'data_evento', 'usuario_id', 'observacao'],
    Acoes_Divulgacao: ['acao_id', 'vaga_id', 'data_acao', 'canal_divulgacao', 'veiculo_parceiro', 'tipo_acao', 'custo', 'criado_em'],
    Volume_CVs: ['volume_id', 'data_apuracao', 'vaga_id', 'quantidade_cvs', 'fonte_apuracao'],
  });
});

test('blocks writes to Listas and BI tabs', () => {
  for (const tab of READ_ONLY_SHEET_NAMES) assert.throws(() => assertOperationalWriteTarget(tab), /Escrita bloqueada/);
  for (const tab of OPERATIONAL_SHEET_NAMES) assert.doesNotThrow(() => assertOperationalWriteTarget(tab));
});

test('schema validation fails closed for missing tabs or headers', () => {
  assert.ok(validateOperationalHeaders({}).length > 0);
  const valid = Object.fromEntries(Object.entries(OPERATIONAL_SHEET_HEADERS).map(([name, headers]) => [name, [...headers]]));
  assert.deepEqual(validateOperationalHeaders(valid), []);
  valid.Vagas = ['vaga_id', 'titulo'];
  assert.ok(validateOperationalHeaders(valid).some((error) => error.includes('Vagas')));
});

test('range guard allows only the official workbook and operational tabs', () => {
  assert.doesNotThrow(() => assertOfficialOperationalRange(OFFICIAL_SPREADSHEET_ID, "'Vagas'!A2:J2"));
  assert.throws(() => assertOfficialOperationalRange('another-spreadsheet', "'Vagas'!A2"), /ID da planilha não é o oficial/);
  assert.throws(() => assertOfficialOperationalRange(OFFICIAL_SPREADSHEET_ID, "'BI_Vagas'!A2"), /Escrita bloqueada/);
  assert.throws(() => assertOfficialOperationalRange(OFFICIAL_SPREADSHEET_ID, "A2"), /intervalo sem aba explícita/);
});
