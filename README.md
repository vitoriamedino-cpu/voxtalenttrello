# VoxTalent R&S OS

Sistema Operacional de Recrutamento e Seleção (ATS) exclusivo para o fluxo da Vox2you com Kanban integrado, gestão de SLA, automação WhatsApp, relatórios e integração completa com Google Workspace (Drive, Sheets, Forms, Gmail, Calendar e Meet).

## Recursos Principais

- **Visualização de Quadro Kanban Estilo Trello**: Colunas compactas e suspensas, rolagens suaves e colunas suspensas de reprovações e aprovações.
- **Histórico e SLA de Entrevistas**: Gráficos e tabelas dedicados de SLA por vaga, além de histórico de entrevistas realizadas/agendadas pelo RH.
- **WhatsApp Integrado**: Disparo de modelos de mensagens automáticas baseadas em templates oficiais da Vox2you.
- **Gerador de PDF de Candidatos**: Exportação da ficha completa de candidatos com fotos, links e observações.
- **Integração com Google Sheets**: Sincronização automática em tempo real.

---

## Como Executar Localmente

### Pré-requisitos
- Node.js (v18 ou v20+)
- npm ou bun

### Passos
1. Instale as dependências:
   ```bash
   npm install
   ```

2. Crie um arquivo `.env` na raiz (baseado no `.env.example`) e configure as credenciais necessárias:
   ```env
   GEMINI_API_KEY=sua_chave_aqui
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

4. Acesse em seu navegador:
   `http://localhost:3000`

---

## Como Implantar no GitHub Pages

Este repositório está configurado para implantação automática no GitHub Pages usando **GitHub Actions**.

### Passos para Configuração:
1. Envie este repositório para o seu GitHub.
2. No seu repositório do GitHub, vá em **Settings** > **Pages**.
3. Em **Build and deployment** > **Source**, selecione **GitHub Actions**.
4. Sempre que você fizer um `push` na branch `main` ou `master`, o workflow no arquivo `.github/workflows/deploy.yml` será acionado automaticamente para construir e implantar a aplicação.