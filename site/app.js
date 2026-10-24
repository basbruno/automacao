'use strict';
const $ = (id) => document.getElementById(id);
const storageKey = 'exercicios-qa-v1';
let saved = { done: {}, drafts: {} };
try {
  const parsed = JSON.parse(localStorage.getItem(storageKey));
  if (parsed && typeof parsed.done === 'object' && parsed.done && typeof parsed.drafts === 'object' && parsed.drafts) saved = parsed;
} catch { /* O estudo também funciona quando o armazenamento não está disponível. */ }
let exercises = [], filtered = [], currentPage = 1, selected = null;
const perPage = 18;
function persist() {
  try { localStorage.setItem(storageKey, JSON.stringify(saved)); $('save-message').textContent = 'Rascunho salvo neste navegador.'; }
  catch { $('save-message').textContent = 'Não foi possível salvar neste navegador. Baixe o arquivo para guardar seu rascunho.'; }
}
function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
const normalize = (text) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
function render() {
  const query = normalize($('search').value.trim());
  filtered = exercises.filter((item) => {
    const done = Boolean(saved.done[item.arquivo]);
    return (!query || normalize(`${item.numero} ${item.enunciado} ${item.dica}`).includes(query)) &&
      (!$('category').value || item.categoria === $('category').value) &&
      (!$('level').value || item.nivel === $('level').value) &&
      (!$('status').value || ($('status').value === 'done' ? done : !done));
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  currentPage = Math.min(currentPage, totalPages);
  $('results').textContent = `${filtered.length} exercícios encontrados`;
  $('cards').replaceChildren();
  for (const item of filtered.slice((currentPage - 1) * perPage, currentPage * perPage)) {
    const done = Boolean(saved.done[item.arquivo]);
    const card = element('article', undefined, `card${done ? ' done' : ''}`);
    const top = element('div', undefined, 'card-top');
    top.append(element('span', `${item.categoria.toUpperCase()} · ${item.nivel}`, 'badge'), element('span', `#${item.numero} · p. ${item.pagina}`));
    const bottom = element('div', undefined, 'card-bottom');
    const open = element('button', 'Abrir exercício ↗'); open.type = 'button';
    open.setAttribute('aria-label', `Abrir exercício ${item.numero}: ${item.enunciado}`);
    open.addEventListener('click', () => openExercise(item));
    bottom.append(element('span', done ? '✓ Concluído' : '○ Para praticar'), open);
    card.append(top, element('h3', item.enunciado), bottom); $('cards').append(card);
  }
  if (!filtered.length) $('cards').append(element('p', 'Nenhum exercício encontrado. Experimente outros filtros.', 'empty'));
  $('previous').disabled = currentPage === 1; $('next').disabled = currentPage === totalPages;
  $('page-label').textContent = `Página ${currentPage} de ${totalPages}`;
  const count = exercises.filter((item) => saved.done[item.arquivo]).length;
  $('progress-label').textContent = `${count} de ${exercises.length} concluídos`;
  $('progress').max = exercises.length; $('progress').value = count;
}
function openExercise(item) {
  selected = item;
  $('dialog-meta').textContent = `${item.categoria.toUpperCase()} · ${item.nivel} · #${item.numero} · PDF p. ${item.pagina}`;
  $('dialog-title').textContent = item.enunciado; $('dialog-hint').textContent = item.dica;
  $('dialog-path').textContent = item.arquivo;
  $('editor').value = typeof saved.drafts[item.arquivo] === 'string' ? saved.drafts[item.arquivo] : item.codigo;
  $('complete').textContent = saved.done[item.arquivo] ? 'Marcar como pendente' : 'Marcar como concluído';
  $('save-message').textContent = 'O rascunho é salvo neste navegador.';
  $('exercise-dialog').showModal();
}
$('filters').addEventListener('submit', (event) => event.preventDefault());
for (const id of ['search', 'category', 'level', 'status']) $(id).addEventListener('input', () => { currentPage = 1; render(); });
for (const [id, step] of [['previous', -1], ['next', 1]]) $(id).addEventListener('click', () => { currentPage += step; render(); $('exercicios').scrollIntoView(); });
$('start-web').addEventListener('click', () => { $('search').value = ''; $('category').value = 'web'; $('level').value = 'Júnior'; $('status').value = ''; currentPage = 1; render(); $('exercicios').scrollIntoView(); });
$('close-dialog').addEventListener('click', () => $('exercise-dialog').close());
$('editor').addEventListener('input', () => { if (selected) { saved.drafts[selected.arquivo] = $('editor').value; persist(); } });
$('complete').addEventListener('click', () => { if (!selected) return; saved.done[selected.arquivo] = !saved.done[selected.arquivo]; persist(); render(); $('complete').textContent = saved.done[selected.arquivo] ? 'Marcar como pendente' : 'Marcar como concluído'; });
$('download').addEventListener('click', () => {
  if (!selected) return;
  const url = URL.createObjectURL(new Blob([$('editor').value], { type: 'text/plain;charset=utf-8' }));
  const anchor = element('a'); anchor.href = url; anchor.download = selected.arquivo.split('/').pop();
  document.body.append(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
});
if (new URLSearchParams(location.search).get('preview') === '1') $('preview-tools').hidden = true;
document.querySelectorAll('[data-width]').forEach((button) => button.addEventListener('click', () => {
  const desktop = button.dataset.width === 'desktop';
  document.querySelectorAll('[data-width]').forEach((other) => other.setAttribute('aria-pressed', String(other === button)));
  $('portal').hidden = !desktop; $('device-stage').hidden = desktop;
  if (!desktop) {
    const frame = $('device-frame'); frame.style.width = `${button.dataset.width}px`;
    if (!frame.getAttribute('src')) { const url = new URL('index.html', location.href); url.searchParams.set('preview', '1'); frame.src = url.href; }
  } else { try { const parsed = JSON.parse(localStorage.getItem(storageKey)); if (parsed?.done && parsed?.drafts) saved = parsed; } catch {} render(); }
}));
window.addEventListener('storage', (event) => { if (event.key === storageKey && event.newValue) { try { const parsed = JSON.parse(event.newValue); if (parsed?.done && parsed?.drafts) { saved = parsed; render(); } } catch {} } });
fetch('exercicios.json').then((response) => { if (!response.ok) throw new Error(`HTTP ${response.status}`); return response.json(); }).then((data) => { if (!Array.isArray(data)) throw new Error('Catálogo inválido'); exercises = data; render(); }).catch(() => { $('results').textContent = 'Não foi possível carregar os exercícios. Atualize a página ou inicie o servidor local conforme o README.'; });
