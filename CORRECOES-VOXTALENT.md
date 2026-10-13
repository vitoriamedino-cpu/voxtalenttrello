# Correções do VoxTalent-RS-OS

Esta versão foi revisada para corrigir os erros de TypeScript relatados e restaurar a estrutura de sincronização.

## Correções incluídas

- Corrigida a estrutura da classe `GoogleSheetsSyncEngine`, incluindo a exportação `syncEngine`, `forceFullSync` e `clearLogs`.
- Corrigido o tratamento de `errorMessage` para não atribuir `null` a um campo que espera texto.
- Alinhadas as etapas de processo para usar o rótulo canônico `Entrevista Coletiva (RH)`.
- Corrigidas as interfaces e props do modal de PDF e do agendamento de entrevista.
- Incluída compatibilidade de tipos para campos antigos de candidatos e unidades.
- Adicionado `getCandidatoById` ao contexto da aplicação.
- A sincronização automática e a sincronização manual deixam de criar silenciosamente uma nova planilha quando não existe um ID vinculado.
- Adicionado campo para vincular uma planilha Google Sheets existente e carregar os dados antes da sincronização.
- A sincronização do motor usa a rotina que escreve nas abas oficiais (`1. Cadastro de Vagas`, `2. Processo Seletivo`, `3. Ações e Custos`, `4. Volume de CVs Semanal`).

## Validação

`npx tsc --noEmit` executou sem erros nesta revisão.

O build Vite não pôde ser validado neste ambiente Linux porque o `node_modules` contido no ZIP original não tinha o pacote binário do Rollup para Linux. No Windows, reinstale as dependências com `npm install` se o build falhar.

## Antes de testar a sincronização

1. Faça uma cópia de segurança da pasta atual do projeto.
2. Não inclua nem substitua `.env`; mantenha suas variáveis locais privadas.
3. Abra o app e, na área Workspace > Google Sheets, vincule a planilha oficial existente pelo link ou ID.
4. Confirme que os dados carregaram antes de fazer alterações.
5. Não use “Criar / Vincular Nova Planilha Mestre” se quiser continuar usando a planilha atual.

## Correção adicional — importação de etapas e status
- A importação agora reconhece etapa e status pelo conteúdo das colunas I/J, inclusive quando essas colunas vierem invertidas em uma versão antiga da planilha.
- O reconhecimento de etapa aceita variações de texto (acentos, nomes de entrevista, vídeo, etapa prática, gestor/diretoria) e só usa Triagem como padrão quando nenhuma das duas células contém uma etapa reconhecida.
- Status com variações de texto são reconhecidos por correspondência parcial, evitando que valores como “Aprovado ...” ou “Em andamento ...” sejam ignorados.
- Removido o `console.table` temporário da importação.
- Não sincronize/puxe alterações para a planilha antes de confirmar que a importação posicionou os candidatos corretamente.

## Bloqueio de ações para candidatos com processo encerrado
- Criada a regra central `src/lib/candidateEligibility.ts` para identificar candidatos Reprovados ou Desistentes.
- Candidatos nesses status não aparecem nos seletores de disparo de e-mail, agendamento de Agenda/Meet nem na lista de criação de dossiês do Workspace.
- As ações também são bloqueadas nos manipuladores e no modal individual do candidato, evitando contornar o filtro visual.
- Agendamentos em lote ignoram candidatos Reprovados/Desistentes e só incluem candidatos ativos.
- Os registros históricos continuam na base/planilha; esta alteração não apaga candidatos nem remove eventos já existentes do Google Agenda.
