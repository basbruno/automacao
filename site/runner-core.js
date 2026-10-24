const send = (data) => { if (typeof document === 'undefined') self.postMessage(data); else parent.postMessage(data, '*'); };

'use strict';
// This document runs in an opaque origin (iframe sandbox="allow-scripts").
self.addEventListener('message', async (event) => {
  if ((typeof document !== 'undefined' && event.source !== parent) || !event.data?.kataRun) return;
  const { code, kata, token } = event.data;
  const results = [];
  let SQL;
  try {
    if (kata.engine === 'sql') {
      // Fetch through the parent: opaque origins cannot fetch same-origin WASM.
      SQL = await initSqlJs({ wasmBinary: event.data.wasm });
    }
    const resolver = kata.engine === 'sql' ? null : new Function('"use strict";\n' + code + '\nreturn resolver;')();
    if (kata.engine !== 'sql' && typeof resolver !== 'function') throw new Error('Defina a função resolver(entrada).');
    const canonical = value => {
      if (Array.isArray(value)) return value.map(canonical);
      if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(k => [k, canonical(value[k])]));
      return value;
    };
    const same = (a, b) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
    for (const [index, test] of kata.testes.entries()) {
      let db;
      try {
        let actual;
        if (SQL) {
          db = new SQL.Database(); db.run(kata.setup); db.run(test.entrada);
          if (!/^\s*(select|with)\b/i.test(code)) throw new Error('Escreva uma consulta SELECT.');
          const output = db.exec(code);
          if (output.length > 1) throw new Error('Retorne exatamente uma consulta SELECT.');
          const statement = db.prepare(code);
          const names = statement.getColumnNames(); statement.free();
          const columns = kata.colunas;
          if (!same(names, columns)) throw new Error('Colunas esperadas: ' + columns.join(', '));
          actual = output[0]?.values ?? [];
        } else {
          const input = structuredClone(test.entrada);
          actual = await resolver(input);
          if (!same(input, test.entrada)) throw new Error('A função alterou a entrada. Preserve os dados recebidos.');
        }
        results.push({index, passed: same(actual, test.esperado), actual: JSON.stringify(actual) ?? String(actual)});
      } catch (error) { results.push({index, passed: false, error: String(error.message || error)}); }
      finally { db?.close(); }
    }
    send({kataResult: true, token, results}, '*');
  } catch (error) { send({kataResult: true, token, error: String(error.message || error)}, '*'); }
});
send({kataReady: true}, '*');
