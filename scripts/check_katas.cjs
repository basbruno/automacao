const { chromium } = require('../playwright/node_modules/playwright');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../docs');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const target = path.resolve(root, '.' + new URL(req.url, 'http://localhost').pathname.replace(/\/$/, '/index.html'));
  if (!target.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  fs.readFile(target, (error, content) => {
    if (error) res.writeHead(404).end();
    else { res.setHeader('Content-Type', (types[path.extname(target)] || 'text/plain') + '; charset=utf-8'); res.end(content); }
  });
});
(async () => {
  let browser;
  try {
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = []; page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    await page.locator('#kata-cards .card').first().waitFor();
    const katas = JSON.parse(fs.readFileSync(path.join(root, 'katas.json'), 'utf8'));
    for (const kata of katas) {
      await page.locator('#kata-category').selectOption(kata.categoria);
      const card = page.locator('#kata-cards .card').filter({has: page.getByRole('heading', {name: kata.titulo, exact: true})});
      await card.getByRole('button').click();
      await page.locator('#kata-editor').fill(kata.engine === 'sql' ? 'SELECT 0;' : 'function resolver() { return null; }');
      await page.locator('#kata-run').click();
      await page.waitForFunction(() => !document.getElementById('kata-run').disabled);
      assert.ok(!(await page.locator('#kata-output').innerText()).startsWith(`${kata.testes.length}/${kata.testes.length}`), kata.id + ' rejects wrong answer');
      await page.locator('#kata-editor').fill(kata.solucao);
      await page.locator('#kata-run').click();
      await page.waitForFunction(() => !document.getElementById('kata-run').disabled);
      const output = await page.locator('#kata-output').innerText();
      assert.ok(output.startsWith(`${kata.testes.length}/${kata.testes.length}`), kata.id + ': ' + output);
      await page.locator('#kata-close').click();
    }
    assert.equal(await page.locator('#kata-progress').innerText(), '11 de 11 katas aprovados');
    await page.reload();
    await page.getByText('11 de 11 katas aprovados', {exact: true}).waitFor();
    await page.locator('#kata-category').selectOption('fundamentos');
    await page.locator('#kata-cards .card button').first().click();
    assert.equal(await page.locator('#kata-editor').inputValue(), katas[0].solucao);
    await page.locator('#kata-editor').fill('function resolver( {');
    await page.locator('#kata-run').click();
    await page.waitForFunction(() => !document.getElementById('kata-run').disabled);
    assert.match(await page.locator('#kata-output').innerText(), /Erro:/);
    await page.locator('#kata-editor').fill('function resolver() { while (true) {} }');
    await page.locator('#kata-run').click();
    await page.waitForFunction(() => !document.getElementById('kata-run').disabled, null, {timeout: 12000});
    assert.match(await page.locator('#kata-output').innerText(), /Tempo limite/);
    await page.locator('#kata-reset').click();
    assert.equal(await page.locator('#kata-editor').inputValue(), katas[0].inicial);
    await page.locator('#kata-close').click();
    for (const width of [390, 768]) {
      await page.setViewportSize({width, height: 844});
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    }
    assert.deepEqual(errors, []);
    console.log('OK: 11 correct solutions, 11 wrong answers, syntax, timeout, reset, SQLite, persistence and mobile.');
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
