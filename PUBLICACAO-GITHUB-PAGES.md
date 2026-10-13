# Publicação do VoxTalent no GitHub Pages

## Diagnóstico
O workflow do GitHub Actions precisa estar em `.github/workflows/deploy.yml`. Um arquivo `deploy.yml` na raiz do repositório não é descoberto pelo GitHub Actions. Também deve haver apenas um workflow publicando no ambiente `github-pages`, para evitar que o fluxo de Jekyll publique os arquivos-fonte em vez do build do Vite.

## Configuração desta versão
- `vite.config.ts` usa `base: '/voxtalenttrello/'`, correto para `https://vitoriamedino-cpu.github.io/voxtalenttrello/`.
- O workflow instala dependências com `npm ci`, executa `npm run lint`, cria o build com `npm run build` e publica somente `dist/`.
- O workflow Jekyll foi removido para não disputar a publicação.

## Depois de enviar os arquivos
1. No GitHub, abra Settings → Pages.
2. Em Build and deployment → Source, selecione **GitHub Actions**.
3. Em Actions, abra `Deploy VoxTalent to GitHub Pages` e aguarde os trabalhos `build` e `deploy` ficarem verdes.
4. Abra o site e faça atualização forçada com `Ctrl + Shift + R`.

Nota: GitHub Pages hospeda apenas o frontend estático. Endpoints de servidor Express (`server.ts`, `/api/...`) não ficam ativos no GitHub Pages; se a aplicação depender deles, o backend precisa ser hospedado separadamente.
