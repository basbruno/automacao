# Exercícios de automação

## Portal de estudo e visualização mobile

O portal apresenta os 269 exercícios Web/API/SQL/Mobile com busca, filtros, editor de rascunhos, download dos arquivos e progresso salvo no navegador. Use os botões **Desktop**, **Tablet · 768px** e **Celular · 390px** para mudar a largura da prévia. A página também se adapta quando aberta em um celular real. Essa prévia altera o layout do portal; não simula um aplicativo Android ou iOS.

Para abrir localmente, na pasta principal:

```powershell
python scripts/build_site.py
python -m http.server 8000 --directory docs --bind 127.0.0.1
```

Acesse `http://127.0.0.1:8000`. Edite a interface em `site/` e execute novamente o gerador para atualizar `docs/`. Atualize os exercícios nos seus arquivos originais; o gerador incorpora os códigos ao catálogo do portal.

Para repetir a verificação das interações, com as dependências e o Chromium do projeto Playwright instalados:

```powershell
node scripts/check_site.cjs
```

## Publicação em basbruno/automacao

O projeto está preparado para um repositório público chamado `basbruno/automacao`. A publicação remota ainda depende de autenticação nessa conta. O script abaixo cria o repositório, envia os arquivos e configura o GitHub Pages via Actions; ele interrompe se a conta autenticada ou o remoto não corresponder ao destino.

No seu terminal Windows, instale o GitHub CLI:

```powershell
winget install --id GitHub.cli -e
```

Reabra o terminal e autentique-se como **basbruno** pelo navegador:

```powershell
gh auth login --hostname github.com --git-protocol https --web
gh api user --jq .login
powershell -ExecutionPolicy Bypass -File .\publicar.ps1
```

O script faz push sem `--force`, usa um e-mail noreply no commit e publica somente o portal estático de `docs/`. Dependências, relatórios, arquivos de ambiente e o PDF ficam fora do Git. O material de referência continua disponível no seu computador.

Após a conclusão bem-sucedida do workflow, o endereço esperado será `https://basbruno.github.io/automacao/`. A existência desse endereço precisa ser confirmada após a publicação; preparar os arquivos localmente não ativa o site.

O workflow segue a [documentação oficial de publicação do GitHub Pages com Actions](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

Material preparado a partir do PDF **Perca o Medo da Automação**, de Lilian Borba / QA Insider, disponível nesta pasta.

Comece pelo [índice dos exercícios](exercicios/INDICE.md). Cada arquivo contém o enunciado, o nível, a página do PDF, uma dica e espaço para implementar sua resposta. O gabarito continua no PDF. Os três exercícios de fundamentos incluem os exemplos iniciais para você alterar e executar.

| Conteúdo | Pasta | Arquivos de prática |
| --- | --- | --- |
| Fundamentos JavaScript | `exercicios/fundamentos/` | 3 |
| Web / Playwright TypeScript | `playwright/exercicios/web/` | 100 |
| API / Playwright TypeScript | `playwright/exercicios/api/` | 83 |
| SQL | `exercicios/sql/` | 35 |
| Mobile / Appium Python | `exercicios/mobile/` | 51 |
| Prompts para IA | `exercicios/ia/` | 50 |

O PDF anuncia 100 exercícios API, 50 SQL e 50 Mobile, mas os enunciados encontrados nessa edição totalizam 83, 35 e 51, respectivamente. Há números repetidos em API e Mobile, além de lacunas. Os arquivos preservam número, nível e página originais; o sufixo `p123` identifica a página e impede sobrescritas. Não foram inventados exercícios para completar as sequências. O [catálogo JSON](exercicios/catalogo.json) registra todos os 269 enunciados dessas quatro áreas.

## Começar no terminal do VS Code

Na pasta principal, execute os fundamentos:

```powershell
node exercicios/fundamentos/01_url_base.js
node exercicios/fundamentos/02_perfis.js
node exercicios/fundamentos/03_status_code.js
```

O arquivo original `Init.py` contém JavaScript. Os exemplos acima usam a extensão `.js` para executar com Node.js; o original foi preservado.

## Web e API

O projeto Playwright existente foi aproveitado. Os comandos usam `npm.cmd` e `npx.cmd` para funcionar no PowerShell mesmo com scripts `.ps1` bloqueados. Se as dependências ainda não estiverem instaladas, execute `npm.cmd ci` dentro de `playwright`. Para testes web, instale o navegador com `npx.cmd playwright install chromium`.

```powershell
cd playwright
npm.cmd run exercicios:listar
npm.cmd run exercicios:web
npm.cmd run exercicios:api
```

Os novos testes começam com `test.skip`: ficam pendentes até você implementar. Abra um arquivo pelo índice, escreva as ações e asserções, remova o `throw new Error(...)` e troque `test.skip` por `test`. Um teste vazio não deve ser considerado aprovado.

Para executar somente o primeiro exercício web:

```powershell
npm.cmd run exercicios -- web/junior/exercicio_001_p54.spec.ts --headed
```

A configuração separada `playwright.exercicios.config.ts` mantém os exercícios fora da execução dos testes existentes em `tests/`. As URLs padrão são as referências citadas pelo PDF. Para cenários de outro sistema, configure as URLs no terminal e adapte rotas, dados, autenticação e localizadores:

```powershell
$env:WEB_BASE_URL = 'https://seu-sistema-de-estudo.example'
$env:API_BASE_URL = 'https://sua-api-de-estudo.example'
```

Os exercícios avançados dependem de funcionalidades e serviços próprios. Antes de ativá-los, configure o ambiente indicado no enunciado. Credenciais e chaves devem vir de variáveis de ambiente conforme a API usada.

## SQL

Abra os arquivos `.sql` e escreva as consultas em um banco de estudo. O material usa principalmente PostgreSQL e pressupõe tabelas de uma aplicação (usuários, pedidos, transações etc.). O PDF não inclui um banco completo para todos os cenários; crie as tabelas e os dados necessários ao exercício antes de consultar. Os arquivos preparados contêm comentários e espaços para suas respostas.

## Mobile

Na pasta principal:

```powershell
python -m venv .venv
.venv/Scripts/python -m pip install -r exercicios/mobile/requirements.txt
.venv/Scripts/python -m pytest exercicios/mobile
```

Os exercícios começam com `@pytest.mark.skip`. Para ativar um exercício, implemente o cenário, configure a sessão Appium e remova o decorador e o `raise NotImplementedError(...)`. Será necessário um servidor Appium com o driver correspondente, um emulador/dispositivo e o aplicativo de estudo. Não foi fornecido um APK neste projeto.

## Prompts para IA

Abra `exercicios/ia/prompt_01.md` e siga a sequência. Preencha os campos do prompt com o contexto do exercício e registre sua aplicação. Revise as respostas usando os requisitos do seu sistema.
