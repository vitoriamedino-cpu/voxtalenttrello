# Configuração do cadastro de acessos do VoxTalent

## Antes de habilitar o controle de acesso

1. No Firebase Console do projeto `gen-lang-client-0409011543`, habilite o Cloud Firestore em modo de produção.
2. Publique as regras de `firestore.rules`.
3. Crie manualmente o documento inicial em `accessAccounts` antes de liberar o gate. O ID do documento deve ser o e-mail normalizado em minúsculas, por exemplo `luana.oliveira@grupomaester.com.br`.
4. O documento inicial deve conter todos os campos de `ContaUsuario`, incluindo `email`, `nome`, `cargo`, `unidade`, `nivelAcesso: "Admin"`, `status: "Ativo"`, `criadoEm` e `permissoes` com todos os booleanos definidos.
5. Não habilite o gate antes de confirmar que o documento Admin foi criado e que as regras estão publicadas. Não existe promoção automática do primeiro usuário autenticado.

## Observações

- Os IDs dos documentos são e-mails normalizados; o cadastro de e-mail não pode ser alterado por edição comum.
- A coleção é a fonte compartilhada de contas; `localStorage` não deve autorizar usuários.
- A regra de Firestore protege o cadastro de acessos, não os dados do Google Sheets. O acesso direto à planilha continua sujeito às permissões próprias dela.
- Não configure faturamento nem faça upgrade de plano como parte desta implementação.
