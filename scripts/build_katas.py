"""Desafios autorais complementares: contratos, exemplos e soluções de referência."""
import json


def build_katas():
    items = []

    def add(key, category, title, task, solution, cases, explanation, engine='javascript', setup='', columns=None):
        items.append(dict(id=key, categoria=category, titulo=title, enunciado=task,
                          solucao=solution, testes=[dict(entrada=i, esperado=o) for i, o in cases],
                          explicacao=explanation, engine=engine, setup=setup, colunas=columns,
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
        'WHERE filtra e ORDER BY torna a ordem explícita.', 'sql', schema, ['id', 'nome'])
    add('sql-count', 'sql', 'Agrupar pedidos por cliente',
        'Tabela pedidos(id INTEGER, cliente TEXT). Retorne cliente e COUNT(*) AS total, agrupados por cliente e ordenados pelo nome crescente. Cada teste inicia um banco novo.',
        'SELECT cliente, COUNT(*) AS total FROM pedidos GROUP BY cliente ORDER BY cliente;',
        [("INSERT INTO pedidos VALUES (1,'Bia'),(2,'Ana'),(3,'Bia');", [['Ana', 1], ['Bia', 2]]), ('', []), ("INSERT INTO pedidos VALUES (1,'Ana');", [['Ana', 1]])],
        'GROUP BY reúne os pedidos por cliente; COUNT(*) conta as linhas de cada grupo.',
        'sql', 'CREATE TABLE pedidos(id INTEGER, cliente TEXT);', ['cliente', 'total'])
    add('fundamentos-resumo', 'fundamentos', 'Resumir resultados dos testes',
        'Receba um array de strings: passou, falhou ou ignorado. Retorne {passou, falhou, ignorado} com a quantidade de cada resultado. Preserve a entrada.',
        "function resolver(entrada) { return entrada.reduce((r, status) => { r[status]++; return r; }, {passou: 0, falhou: 0, ignorado: 0}); }",
        [([], {'passou': 0, 'falhou': 0, 'ignorado': 0}), (['passou', 'falhou', 'passou', 'ignorado'], {'passou': 2, 'falhou': 1, 'ignorado': 1}), (['falhou', 'falhou'], {'passou': 0, 'falhou': 2, 'ignorado': 0})],
        'O acumulador começa com todas as contagens em zero, inclusive quando a lista está vazia.')
    add('fundamentos-limites', 'fundamentos', 'Valores na faixa permitida',
        'Receba {valores, minimo, maximo}, contendo números. Retorne os valores entre minimo e maximo inclusive, na ordem original. minimo é menor ou igual a maximo.',
        'function resolver(entrada) { return entrada.valores.filter(v => v >= entrada.minimo && v <= entrada.maximo); }',
        [({'valores': [0, 1, 5, 10, 11], 'minimo': 1, 'maximo': 10}, [1, 5, 10]), ({'valores': [], 'minimo': 0, 'maximo': 1}, []), ({'valores': [-2, 0, 2, 0], 'minimo': 0, 'maximo': 0}, [0, 0])],
        'filter preserva a ordem. As duas comparações incluem os limites e aceitam uma faixa de um único valor.')
    add('api-query', 'api', 'Construir parâmetros de busca',
        'Receba um objeto com valores string, número, booleano ou null. Retorne uma query string sem ?, ordenando as chaves alfabeticamente e omitindo somente null e strings vazias. Codifique chave e valor com encodeURIComponent. Não use URLSearchParams.',
        "function resolver(entrada) { return Object.keys(entrada).sort().filter(k => entrada[k] !== null && entrada[k] !== '').map(k => encodeURIComponent(k) + '=' + encodeURIComponent(entrada[k])).join('&'); }",
        [({'q': 'teste api', 'pagina': 0, 'ativo': False, 'vazio': '', 'nulo': None}, 'ativo=false&pagina=0&q=teste%20api'), ({}, ''), ({'a&b': 'x=y'}, 'a%26b=x%3Dy')],
        'Não use um filtro por valor truthy: zero e false são parâmetros válidos. encodeURIComponent protege os separadores.')
    add('api-retry', 'api', 'Decidir quando repetir uma requisição',
        'Receba {metodo, status}. metodo está em maiúsculas. Retorne true apenas para GET ou HEAD com status 429 ou de 500 a 599. As demais combinações retornam false. Simulação: não envia requisições.',
        "function resolver(entrada) { return ['GET', 'HEAD'].includes(entrada.metodo) && (entrada.status === 429 || (entrada.status >= 500 && entrada.status <= 599)); }",
        [({'metodo': 'GET', 'status': 503}, True), ({'metodo': 'HEAD', 'status': 429}, True), ({'metodo': 'POST', 'status': 503}, False), ({'metodo': 'GET', 'status': 499}, False), ({'metodo': 'GET', 'status': 600}, False), ({'metodo': 'GET', 'status': 599}, True)],
        'Combine o método permitido com o status transitório. Repetir operações de escrita requer uma política diferente.')
    add('web-links', 'web', 'Extrair destinos dos links',
        'Receba uma string HTML. Retorne os atributos href dos elementos a que possuem href, na ordem do documento, sem valores repetidos. Preserve o valor literal, inclusive href vazio. Use DOMParser.',
        "function resolver(entrada) { const doc = new DOMParser().parseFromString(entrada, 'text/html'); return [...new Set([...doc.querySelectorAll('a[href]')].map(a => a.getAttribute('href')))]; }",
        [('<a href="/a">A</a><a href="/b">B</a><a href="/a">A2</a>', ['/a', '/b']), ('<a>Sem destino</a><a href="">Atual</a>', ['']), ('<p>Sem links</p>', [])],
        'getAttribute retorna o texto original; a propriedade href poderia resolver a URL. Set remove duplicatas preservando a ordem.')
    add('web-form', 'web', 'Detectar campos obrigatórios vazios',
        'Receba HTML. Retorne os ids, em ordem, dos inputs com required, habilitados e cujo value após trim é vazio. Considere somente inputs de texto, com id presente. Use DOMParser e :disabled para considerar fieldsets.',
        "function resolver(entrada) { const doc = new DOMParser().parseFromString(entrada, 'text/html'); return [...doc.querySelectorAll('input[required]:not(:disabled)')].filter(e => e.value.trim() === '').map(e => e.id); }",
        [('<input id="nome" required value=" "><input id="email" required value="qa@exemplo.com">', ['nome']), ('<fieldset disabled><input id="a" required></fieldset><input id="b" required>', ['b']), ('<input id="a"><input id="b" required disabled>', [])],
        'O seletor restringe aos campos obrigatórios habilitados. trim trata entradas com apenas espaços como vazias.')
    add('mobile-permissoes', 'mobile', 'Encontrar permissões pendentes',
        'Receba {necessarias, concedidas}, dois arrays de strings. Retorne as permissões necessárias ainda não concedidas, sem duplicatas e na ordem da primeira ocorrência. Simulação de estado de permissões.',
        'function resolver(entrada) { const concedidas = new Set(entrada.concedidas); return [...new Set(entrada.necessarias)].filter(p => !concedidas.has(p)); }',
        [({'necessarias': ['camera', 'localizacao', 'camera'], 'concedidas': ['camera']}, ['localizacao']), ({'necessarias': [], 'concedidas': []}, []), ({'necessarias': ['camera', 'camera'], 'concedidas': []}, ['camera'])],
        'Um conjunto identifica concessões e outro remove requisitos repetidos. Nenhuma permissão real é solicitada.')
    add('mobile-orientacao', 'mobile', 'Identificar a orientação da tela',
        'Receba {largura, altura}, números positivos. Retorne retrato quando altura > largura, paisagem quando largura > altura e quadrado quando forem iguais. Simulação de dimensões de tela.',
        "function resolver(entrada) { return entrada.altura > entrada.largura ? 'retrato' : entrada.largura > entrada.altura ? 'paisagem' : 'quadrado'; }",
        [({'largura': 390, 'altura': 844}, 'retrato'), ({'largura': 844, 'altura': 390}, 'paisagem'), ({'largura': 400, 'altura': 400}, 'quadrado')],
        'Verifique explicitamente a igualdade para não classificar uma tela quadrada como retrato ou paisagem.')
    add('sql-join', 'sql', 'Listar clientes sem pedidos',
        'Tabelas clientes(id INTEGER, nome TEXT) e pedidos(id INTEGER, cliente_id INTEGER). Retorne id e nome dos clientes sem pedidos, em ordem de id. Um cliente pode ter vários pedidos.',
        'SELECT c.id, c.nome FROM clientes c LEFT JOIN pedidos p ON p.cliente_id = c.id WHERE p.id IS NULL ORDER BY c.id;',
        [("INSERT INTO clientes VALUES (1,'Ana'),(2,'Bia'),(3,'Caio'); INSERT INTO pedidos VALUES (1,1),(2,1),(3,3);", [[2, 'Bia']]), ("INSERT INTO clientes VALUES (2,'Bia'),(1,'Ana');", [[1, 'Ana'], [2, 'Bia']]), ('', [])],
        'LEFT JOIN mantém clientes sem correspondência; IS NULL seleciona os que não têm pedidos.',
        'sql', 'CREATE TABLE clientes(id INTEGER, nome TEXT); CREATE TABLE pedidos(id INTEGER, cliente_id INTEGER);', ['id', 'nome'])
    add('sql-having', 'sql', 'Selecionar clientes com vários pedidos',
        'Tabela pedidos(id INTEGER, cliente TEXT). Retorne cliente e COUNT(*) AS total somente para clientes com pelo menos dois pedidos, em ordem alfabética de cliente.',
        'SELECT cliente, COUNT(*) AS total FROM pedidos GROUP BY cliente HAVING COUNT(*) >= 2 ORDER BY cliente;',
        [("INSERT INTO pedidos VALUES (1,'Bia'),(2,'Ana'),(3,'Bia'),(4,'Ana'),(5,'Caio');", [['Ana', 2], ['Bia', 2]]), ("INSERT INTO pedidos VALUES (1,'Ana');", []), ('', [])],
        'HAVING filtra os grupos depois da contagem; WHERE filtraria linhas antes do agrupamento.',
        'sql', 'CREATE TABLE pedidos(id INTEGER, cliente TEXT);', ['cliente', 'total'])
    assert len({item['id'] for item in items}) == len(items), 'Ids de kata duplicados'
    return items


if __name__ == '__main__':
    print(json.dumps(build_katas(), ensure_ascii=False))
