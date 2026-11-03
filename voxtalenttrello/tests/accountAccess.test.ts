import test from 'node:test';
import assert from 'node:assert/strict';
import { authorizeAccount, normalizeAccountEmail } from '../src/lib/accountAccessPolicy.ts';
import type { ContaUsuario } from '../src/types.ts';

const account = (email: string, status: 'Ativo' | 'Inativo' = 'Ativo'): ContaUsuario => ({
  id: email, nome: 'Teste', email, cargo: 'Recrutamento', unidade: 'Todas as Unidades',
  nivelAcesso: 'Recrutador', status, criadoEm: '2026-01-01T00:00:00.000Z',
  permissoes: { criarVagas: false, moverEtapas: false, bancoTalentos: true, gerenciarConfiguracoes: false, exportarRelatorios: false, dispararWhatsApp: false, agendarEntrevistas: false },
});

test('normaliza e-mail com espaços e diferenças de caixa', () => {
  assert.equal(normalizeAccountEmail('  TESTE@EXEMPLO.COM '), 'teste@exemplo.com');
  assert.equal(normalizeAccountEmail(null), '');
});
test('permite somente registro Ativo com e-mail correspondente', () => {
  assert.equal(authorizeAccount(' TESTE@EXEMPLO.COM ', [account('teste@exemplo.com')]).allowed, true);
});
test('bloqueia conta Inativo', () => {
  assert.equal(authorizeAccount('teste@exemplo.com', [account('teste@exemplo.com', 'Inativo')]).reason, 'inactive');
});
test('bloqueia e-mail não cadastrado', () => {
  assert.equal(authorizeAccount('outro@exemplo.com', [account('teste@exemplo.com')]).reason, 'not-registered');
});
test('bloqueia e-mail vazio ou ausente', () => {
  assert.equal(authorizeAccount('  ', [account('teste@exemplo.com')]).reason, 'missing-email');
});
test('não escolhe arbitrariamente entre e-mails duplicados', () => {
  const result = authorizeAccount('teste@exemplo.com', [account('teste@exemplo.com'), account(' TESTE@EXEMPLO.COM ')]);
  assert.equal(result.allowed, false);
  assert.equal(result.reason, 'duplicate');
});
