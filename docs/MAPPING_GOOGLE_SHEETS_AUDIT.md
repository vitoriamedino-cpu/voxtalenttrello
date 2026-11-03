# Auditoria do mapeamento Google Sheets — VoxTalent

Fonte analisada: `VoxTalent_Banco_de_Dados_Sheets_Atualizado_2026-10-28.xlsx`. O serviço deve usar somente a planilha oficial `1zVP9ypAgv8OOVtfaE0DiqQlMZXiLN_zXOlbdQVrMzUY`.

## Abas operacionais e cabeçalhos exatos

- `Unidades`: `unidade_id`, `nome_unidade`
- `Vagas`: `vaga_id`, `titulo`, `unidade_id`, `status`, `data_abertura`, `data_fechamento`, `meta_sla_dias`, `responsavel_id`, `criado_em`, `atualizado_em`
- `Pessoas`: `pessoa_id`, `nome`, `telefone`, `email`, `criado_em`, `atualizado_em`
- `Candidaturas`: `candidatura_id`, `pessoa_id`, `vaga_id`, `data_ultima_atualizacao`, `canal_origem`, `etapa_atual`, `status`, `data_primeiro_contato`, `data_entrevista_coletiva`, `data_entrevista_individual`, `justificativa`, `criado_em`, `atualizado_em`
- `Historico_Candidaturas`: `historico_id`, `candidatura_id`, `etapa_anterior`, `etapa_nova`, `status_anterior`, `status_novo`, `data_evento`, `usuario_id`, `observacao`
- `Acoes_Divulgacao`: `acao_id`, `vaga_id`, `data_acao`, `canal_divulgacao`, `veiculo_parceiro`, `tipo_acao`, `custo`, `criado_em`
- `Volume_CVs`: `volume_id`, `data_apuracao`, `vaga_id`, `quantidade_cvs`, `fonte_apuracao`

## Abas somente leitura

- `Listas`
- `BI_Candidaturas`
- `BI_Vagas`
- `BI_Divulgacao`
- `BI_Volume_CVs`

## Relações de dados

`Candidaturas.pessoa_id` referencia `Pessoas.pessoa_id`; `Candidaturas.vaga_id`, `Acoes_Divulgacao.vaga_id` e `Volume_CVs.vaga_id` referenciam `Vagas.vaga_id`; `Vagas.unidade_id` referencia `Unidades.unidade_id`; `Historico_Candidaturas.candidatura_id` referencia `Candidaturas.candidatura_id`.

## Proteções implementadas nesta etapa

- A leitura verifica o ID oficial, existência das abas e presença dos cabeçalhos obrigatórios antes de converter registros.
- A conversão usa nomes de cabeçalho, não índices fixos.
- `Listas` e `BI_*` não são destinos de escrita permitidos.
- Limpeza de intervalos e sincronizações legadas para abas antigas foram bloqueadas para evitar apagar dados ou sobrescrever BI.
- A inicialização retorna a planilha oficial existente; não cria outra planilha.

## Limites ainda pendentes

A leitura e validação de estrutura foram atualizadas, mas a gravação CRUD por entidade precisa ser implementada usando IDs estáveis e escrita pontual validada. As rotinas legadas estão deliberadamente bloqueadas até isso existir. A build/teste automatizado ainda precisa ser executado em ambiente com dependências instaladas.
