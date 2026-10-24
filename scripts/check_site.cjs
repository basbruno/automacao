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
    await page.getByText('269 exercícios encontrados', { exact: true }).waitFor();
    assert.equal(await page.locator('.card').count(), 18);
    await page.locator('#start-web').click();
    await page.getByText('40 exercícios encontrados', { exact: true }).waitFor();
    await page.locator('#search').fill('título da página');
    await page.getByText('1 exercícios encontrados', { exact: true }).waitFor();
    await page.locator('.card button').click();
    await page.locator('#editor').fill('// meu rascunho de estudo');
    await page.locator('#complete').click();
    const downloadPromise = page.waitForEvent('download');
    await page.locator('#download').click();
    const download = await downloadPromise;
    assert.equal(download.suggestedFilename(), 'exercicio_001_p54.spec.ts');
    await page.locator('#close-dialog').click();
    await page.reload();
    await page.getByText('1 de 269 concluídos', { exact: true }).waitFor();
    await page.locator('.card button').first().click();
    assert.equal(await page.locator('#editor').inputValue(), '// meu rascunho de estudo');
    await page.locator('#close-dialog').click();
    for (const width of [390, 768]) {
      await page.locator(`[data-width="${width}"]`).click();
      const frame = page.frameLocator('#device-frame');
      await frame.locator('.card').first().waitFor();
      assert.equal(await frame.locator('body').evaluate(() => window.innerWidth), width);
      assert.ok(await frame.locator('body').evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
      assert.equal(await frame.locator('#preview-tools').isVisible(), false);
    }
    await page.locator('[data-width="desktop"]').click();
    fs.mkdirSync(path.resolve(__dirname, '../artifacts'), { recursive: true });
    await page.screenshot({ path: path.resolve(__dirname, '../artifacts/portal-desktop.png'), fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
    await page.screenshot({ path: path.resolve(__dirname, '../artifacts/portal-mobile.png'), fullPage: true });
    assert.deepEqual(errors, []);
    console.log('OK: catálogo, filtros, editor, download, progresso persistente e prévias 390/768px.');
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
