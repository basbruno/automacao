'use strict';
(() => {
  const get = id => document.getElementById(id);
  let katas = [], active = null, running = null, wasmPromise;
  let state = {drafts: {}, passed: {}};
  try { const data = JSON.parse(localStorage.getItem('qa-katas-v1')); if (data?.drafts && data?.passed) state = data; } catch {}
  const save = () => { try { localStorage.setItem('qa-katas-v1', JSON.stringify(state)); } catch {} };
  const node = (tag, text) => { const el = document.createElement(tag); el.textContent = text; return el; };
  function render() {
    const container = get('kata-cards'); container.replaceChildren();
    const category = get('kata-category').value;
    const query = get('kata-search').value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const status = get('kata-status').value;
    const visible = katas.filter(k => (!category || k.categoria === category) &&
      (!query || `${k.titulo} ${k.enunciado}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(query)) &&
      (!status || (status === 'passed' ? state.passed[k.id] : !state.passed[k.id])));
    for (const kata of visible) {
      const card = node('article', ''); card.className = 'card';
      card.append(node('span', kata.categoria.toUpperCase() + ' · ' + (kata.engine === 'sql' ? 'SQLite' : 'JavaScript')));
      card.append(node('h3', kata.titulo));
      card.append(node('p', `${kata.testes.length} testes · ${state.passed[kata.id] ? '✓ Aprovado' : 'Para praticar'}`));
      const button = node('button', 'Resolver kata →'); button.onclick = () => open(kata); card.append(button); container.append(card);
    }
    if (!visible.length) container.append(node('p', 'Nenhum kata encontrado. Ajuste a busca ou os filtros.'));
    get('kata-progress').textContent = `${katas.filter(k => state.passed[k.id]).length} de ${katas.length} katas aprovados`;
    get('kata-count').textContent = `${visible.length} katas encontrados`;
  }
  function stop() {
    if (!running) return;
    clearTimeout(running.timer); running.frame.remove(); running = null; get('kata-run').disabled = false;
  }
  function open(kata) {
    stop(); active = kata;
    get('kata-title').textContent = kata.titulo;
    get('kata-task').textContent = kata.enunciado;
    get('kata-editor').value = state.drafts[kata.id] ?? kata.inicial;
    get('kata-solution-code').textContent = kata.solucao;
    get('kata-explanation').textContent = kata.explicacao;
    get('kata-solution').open = false;
    get('kata-next').disabled = !nextKata(kata);
    get('kata-output').textContent = 'Escreva sua solução e execute os testes. Todos os casos abaixo são públicos.';
    get('kata-cases').replaceChildren(...kata.testes.map((t, i) => node('li', `Teste ${i + 1}: entrada ${JSON.stringify(t.entrada)} → esperado ${JSON.stringify(t.esperado)}`)));
    get('kata-dialog').showModal();
  }
  function nextKata(kata) {
    const area = katas.filter(k => k.categoria === kata.categoria);
    return area[area.indexOf(kata) + 1];
  }
  get('kata-next').onclick = () => { const next = active && nextKata(active); if (next) open(next); };
  get('kata-editor').addEventListener('input', () => {
    if (!active) return;
    stop(); state.drafts[active.id] = get('kata-editor').value;
    delete state.passed[active.id]; save(); render();
    get('kata-output').textContent = 'Código alterado. Execute os testes novamente.';
  });
  get('kata-reset').onclick = () => { if (!active) return; get('kata-editor').value = active.inicial; get('kata-editor').dispatchEvent(new Event('input')); };
  get('kata-close').onclick = () => get('kata-dialog').close();
  get('kata-dialog').addEventListener('close', stop);
  get('kata-category').onchange = render;
  get('kata-search').oninput = render;
  get('kata-status').onchange = render;
  get('kata-run').onclick = async () => {
    if (!active || running) return;
    const kata = active, code = get('kata-editor').value;
    let frame, worker;
    if (kata.categoria === 'web') {
      frame = document.createElement('iframe'); frame.hidden = true;
      frame.setAttribute('sandbox', 'allow-scripts'); frame.title = 'Execução isolada do kata';
    } else {
      worker = new Worker('runner-worker.js');
      frame = {contentWindow: worker, remove: () => worker.terminate()};
      worker.onmessage = event => receive({source: worker, data: event.data});
      worker.onerror = () => { if (running?.frame === frame) { stop(); get('kata-output').textContent = 'Erro ao iniciar o executor. Atualize a página.'; } };
    }
    const token = crypto.randomUUID();
    running = {frame, token, kata, code};
    get('kata-run').disabled = true; get('kata-output').textContent = 'Executando testes…';
    running.timer = setTimeout(() => { stop(); get('kata-output').textContent = 'Tempo limite excedido (8 segundos). Verifique loops e promessas sem fim.'; }, 8000);
    if (!worker) { frame.src = 'runner.html'; document.body.append(frame); }
  };
  async function receive(event) {
    if (!running || event.source !== running.frame.contentWindow) return;
    const run = running;
    if (event.data?.kataReady) {
      try {
        let wasm;
        if (run.kata.engine === 'sql') {
          wasmPromise ??= fetch('vendor/sql-wasm.wasm').then(r => { if (!r.ok) throw new Error('Falha ao carregar SQLite.'); return r.arrayBuffer(); }).catch(e => { wasmPromise = null; throw e; });
          wasm = await wasmPromise;
        }
        if (running !== run) return;
        const payload = {kataRun: true, token: run.token, kata: run.kata, code: run.code, wasm};
        if (run.kata.categoria === 'web') run.frame.contentWindow.postMessage(payload, '*');
        else run.frame.contentWindow.postMessage(payload);
      } catch (error) { if (running === run) { stop(); get('kata-output').textContent = error.message; } }
    }
    if (event.data?.kataResult && event.data.token === run.token) {
      const data = event.data; stop();
      const output = get('kata-output'); output.replaceChildren();
      if (data.error) { output.textContent = 'Erro: ' + data.error; return; }
      const passed = data.results.filter(r => r.passed).length;
      output.append(node('strong', `${passed}/${run.kata.testes.length} testes passaram.`));
      for (const result of data.results) {
        const row = node('div', ''); row.className = result.passed ? 'test-pass' : 'test-fail';
        row.append(node('p', `${result.passed ? '✓ Passou' : '✗ Falhou'} · Teste ${result.index + 1}`));
        if (result.error) row.append(node('pre', 'Erro: ' + result.error));
        else row.append(node('pre', 'Recebido: ' + result.actual));
        if (!result.passed) {
          const test = run.kata.testes[result.index];
          row.append(node('pre', 'Esperado: ' + JSON.stringify(test.esperado)));
          row.append(node('pre', 'Entrada: ' + JSON.stringify(test.entrada)));
        }
        output.append(row);
      }
      state.passed[run.kata.id] = passed === run.kata.testes.length; save(); render();
    }
  }
  window.addEventListener('message', receive);
  fetch('katas.json').then(r => { if (!r.ok) throw new Error(); return r.json(); }).then(data => { katas = data; render(); }).catch(() => { get('kata-progress').textContent = 'Não foi possível carregar os katas. Atualize a página.'; });
})();
