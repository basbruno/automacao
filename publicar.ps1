$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot

function Confirm-Exit([string]$Step) {
    if ($LASTEXITCODE -ne 0) { throw "Falha: $Step. Resolva o erro antes de continuar." }
}

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    throw 'Instale o GitHub CLI: winget install --id GitHub.cli -e. Reabra o terminal e execute gh auth login.'
}
$account = gh api user --jq .login
Confirm-Exit 'consultar conta autenticada'
if ($account.Trim() -ne 'basbruno') {
    throw 'Entre na conta basbruno com gh auth login ou selecione-a com gh auth switch --user basbruno.'
}

python scripts/build_site.py
Confirm-Exit 'gerar portal'
if (-not (Test-Path -LiteralPath '.git')) {
    git init -b master
    Confirm-Exit 'inicializar Git'
}
$branch = git branch --show-current
Confirm-Exit 'identificar branch'
if ($branch.Trim() -ne 'master') { throw 'Execute este script na branch master.' }
$origin = git config --get remote.origin.url
if ($origin -and $origin -notmatch 'github\.com[:/]basbruno/automacao(?:\.git)?/?$') {
    throw 'O remoto origin aponta para outro projeto. Confira-o antes de publicar.'
}

git add -- .gitignore README.md Init.py exercicios playwright site docs scripts .github publicar.ps1
Confirm-Exit 'preparar arquivos'
git diff --cached --quiet
if ($LASTEXITCODE -eq 1) {
    git -c user.name=basbruno -c user.email=basbruno@users.noreply.github.com commit -m 'feat: adiciona laboratorio de exercicios e portal responsivo'
    Confirm-Exit 'criar commit'
} elseif ($LASTEXITCODE -ne 0) { throw 'Não foi possível verificar as alterações.' }

# Consultar antes de criar permite repetir o script após uma publicação parcial.
gh repo view basbruno/automacao --json nameWithOwner *> $null
if ($LASTEXITCODE -ne 0) {
    gh repo create basbruno/automacao --public --description 'Laboratorio de automacao com exercicios Web, API, SQL e Mobile'
    Confirm-Exit 'criar repositorio publico'
}
$visibility = gh repo view basbruno/automacao --json visibility --jq .visibility
Confirm-Exit 'verificar visibilidade'
if ($visibility.Trim() -ne 'PUBLIC') { throw 'O repositório existente não é público. Confira a visibilidade no GitHub.' }
if (-not $origin) {
    git remote add origin https://github.com/basbruno/automacao.git
    Confirm-Exit 'configurar origin'
}
gh auth setup-git
Confirm-Exit 'configurar autenticacao Git'
git push --set-upstream origin master
Confirm-Exit 'enviar codigo sem force push'

gh api repos/basbruno/automacao/pages *> $null
if ($LASTEXITCODE -ne 0) {
    gh api --method POST repos/basbruno/automacao/pages -f build_type=workflow
    Confirm-Exit 'ativar GitHub Pages'
} else {
    gh api --method PUT repos/basbruno/automacao/pages -f build_type=workflow
    Confirm-Exit 'configurar GitHub Pages para Actions'
}
gh workflow run pages.yml --repo basbruno/automacao --ref master
Confirm-Exit 'iniciar publicacao'
Write-Host 'Codigo enviado: https://github.com/basbruno/automacao'
Write-Host 'Acompanhe a publicacao: https://github.com/basbruno/automacao/actions'
Write-Host 'Endereco esperado apos sucesso do workflow: https://basbruno.github.io/automacao/'
