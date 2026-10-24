"""Desafios autorais complementares: contratos, exemplos e soluções de referência."""
import json
from pathlib import Path


def build_katas():
    items = []

    def add(key, category, title, task, solution, cases, explanation, engine='javascript', setup=''):
        items.append(dict(id=key, categoria=category, titulo=title, enunciado=task,
                          solucao=solution, testes=[dict(entrada=i, esperado=o) for i, o in cases],
                          explicacao=explanation, engine=engine, setup=setup,
                          inicial='-- Escreva sua consulta aqui\n' if engine == 'sql' else
                          'function resolver(entrada) {\n  // Implemente o contrato descrito acima.\n}\n'))

    add('url', 'fundamentos', 'Normalizar a URL base',
        'Implemente resolver(entrada): receba uma URL como string e remova todas as barras finais. Preserve o restante.',
        "function resolver(entrada) { return entrada.replace(/\\/+$/, ''); }",
        [('https://exemplo.com/', 'https://exemplo.com'), ('https://exemplo.com///', 'https://exemplo.com'), ('https://exemplo.com/api', 'https://exemplo.com/api'), ('', '')],
        'A expressão regular encontra somente as barras no final da string.')
    add('perfis', 'fundamentos', 'Permissões sem duplicação',
        'Receba um array de perfis. Retorne os perfis únicos, em ordem alfabética, sem alterar o array original.',
        'function resolver(entrada) { return [...new Set(entrada)].sort(); }',
        [(['admin', 'leitor', 'admin'], ['admin', 'leitor']), ([], []), (['z', 'a', 'z'], ['a', 'z'])],
        'Set elimina repetições; o novo array permite ordenar sem modificar a entrada.')
    add('status', 'fundamentos', 'Reconhecer sucesso HTTP',
        'Receba um número inteiro. Retorne true para códigos de 200 a 299 inclusive; retorne false nos demais casos.',
        'function resolver(entrada) { return entrada >= 200 && entrada <= 299; }',
        [(200, True), (201, True), (299, True), (199, False), (300, False), (500, False)],
        'Os limites inferior e superior pertencem à faixa de sucesso.')
    add('api-body', 'api', 'Validar resposta de usuário',
        'Receba {status, body}. Retorne true somente quando status é 200, body.id é inteiro positivo e body.email é string contendo @. Campos ausentes devem retornar false. Cenário com dados simulados, sem chamada HTTP.',
        "function resolver(entrada) { const b = entrada.body; return entrada.status === 200 && !!b && Number.isInteger(b.id) && b.id > 0 && typeof b.email === 'string' && b.email.includes('@'); }",
        [({'status': 200, 'body': {'id': 1, 'email': 'qa@example.com'}}, True), ({'status': 404}, False), ({'status': 200}, False), ({'status': 200, 'body': {'id': '1', 'email': 'qa@example.com'}}, False), ({'status': 200, 'body': {'id': 2, 'email': 'invalido'}}, False)],
        'Valide o status e o contrato do corpo, incluindo tipo e ausência de campos.')
    add('api-pages', 'api', 'Combinar páginas da API',
        'Receba um array de páginas (arrays de objetos com id). Retorne uma lista única por id, preservando a primeira ocorrência e a ordem. Dados simulados.',
        'function resolver(entrada) { const vistos = new Set(); return entrada.flat().filter(item => { if (vistos.has(item.id)) return false; vistos.add(item.id); return true; }); }',
        [([[{'id': 1}], [{'id': 1}, {'id': 2}]], [{'id': 1}, {'id': 2}]), ([], []), ([[], [{'id': 3}], []], [{'id': 3}])],
        'Um conjunto de ids evita duplicatas entre páginas.')
    add('web-title', 'web', 'Consultar o título no DOM',
        'Receba uma string HTML. Use DOMParser e retorne o textContent do primeiro h1, sem espaços nas pontas; se não existir, retorne string vazia. Executa o DOM real do navegador, sem Playwright.',
        "function resolver(entrada) { const doc = new DOMParser().parseFromString(entrada, 'text/html'); return doc.querySelector('h1')?.textContent.trim() ?? ''; }",
        [('<h1> Olá QA </h1>', 'Olá QA'), ('<p>Sem título</p>', ''), ('<h1>A <span>B</span></h1><h1>C</h1>', 'A B')],
        'DOMParser cria um documento separado; querySelector seleciona o primeiro título.')
    add('web-buttons', 'web', 'Contar botões habilitados',
        'Receba uma string HTML. Retorne quantos elementos button não estão desabilitados, considerando inclusive fieldset disabled. Use o DOM do navegador.',
        "function resolver(entrada) { const doc = new DOMParser().parseFromString(entrada, 'text/html'); return doc.querySelectorAll('button:not(:disabled)').length; }",
        [('<button>Salvar</button><button disabled>Excluir</button>', 1), ('<a>Link</a>', 0), ('<fieldset disabled><button>A</button></fieldset><button>B</button>', 1), ('<button disabled="false">A</button>', 0)],
        'A pseudoclasse :disabled considera o estado herdado do fieldset e atributos booleanos.')
    add('mobile-locator', 'mobile', 'Selecionar por accessibility id',
        'Receba {elementos, alvo}. Cada elemento tem accessibilityId e enabled. Retorne o índice do primeiro elemento com id igual ao alvo e enabled === true, ou -1. Simulação de seleção; não executa Appium nem um dispositivo.',
        'function resolver(entrada) { return entrada.elementos.findIndex(e => e.accessibilityId === entrada.alvo && e.enabled === true); }',
        [({'elementos': [{'accessibilityId': 'login', 'enabled': True}], 'alvo': 'login'}, 0), ({'elementos': [{'accessibilityId': 'login', 'enabled': False}, {'accessibilityId': 'login', 'enabled': True}], 'alvo': 'login'}, 1), ({'elementos': [], 'alvo': 'login'}, -1)],
        'A seleção deve considerar o identificador acessível e o estado habilitado.')
    add('mobile-swipe', 'mobile', 'Calcular um gesto vertical',
        'Receba {largura, altura}, números positivos. Retorne {x, inicioY, fimY}: x é 50% da largura, inicioY é 80% da altura e fimY é 20%. Arredonde cada valor com Math.round. Simulação de coordenadas de swipe.',
        'function resolver(entrada) { return {x: Math.round(entrada.largura * .5), inicioY: Math.round(entrada.altura * .8), fimY: Math.round(entrada.altura * .2)}; }',
        [({'largura': 400, 'altura': 800}, {'x': 200, 'inicioY': 640, 'fimY': 160}), ({'largura': 375, 'altura': 667}, {'x': 188, 'inicioY': 534, 'fimY': 133})],
        'Proporções permitem adaptar as coordenadas ao tamanho da tela.')
    schema = 'CREATE TABLE usuarios(id INTEGER, nome TEXT, ativo INTEGER);'
    add('sql-active', 'sql', 'Filtrar usuários ativos',
        'Tabela usuarios(id INTEGER, nome TEXT, ativo INTEGER). Escreva SELECT retornando somente id e nome dos ativos (ativo = 1), em ordem crescente de id. Os testes usam bancos SQLite independentes.',
        'SELECT id, nome FROM usuarios WHERE ativo = 1 ORDER BY id;',
        [("INSERT INTO usuarios VALUES (3,'Bia',1),(1,'Ana',1),(2,'Caio',0);", [[1, 'Ana'], [3, 'Bia']]), ('', []), ("INSERT INTO usuarios VALUES (4,'Davi',0);", [])],
        'WHERE filtra e ORDER BY torna a ordem explícita.', 'sql', schema)
    add('sql-count', 'sql', 'Agrupar pedidos por cliente',
        'Tabela pedidos(id INTEGER, cliente TEXT). Retorne cliente e COUNT(*) AS total, agrupados por cliente e ordenados pelo nome crescente. Cada teste inicia um banco novo.',
        'SELECT cliente, COUNT(*) AS total FROM pedidos GROUP BY cliente ORDER BY cliente;',
        [("INSERT INTO pedidos VALUES (1,'Bia'),(2,'Ana'),(3,'Bia');", [['Ana', 1], ['Bia', 2]]), ('', []), ("INSERT INTO pedidos VALUES (1,'Ana');", [['Ana', 1]])],
        'GROUP BY reúne os pedidos por cliente; COUNT(*) conta as linhas de cada grupo.',
        'sql', 'CREATE TABLE pedidos(id INTEGER, cliente TEXT);')
    return items


if __name__ == '__main__':
    print(json.dumps(build_katas(), ensure_ascii=False))
