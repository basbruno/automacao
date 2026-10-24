// Exercício 007: Verificar que um elemento está desabilitado
// Nível: Júnior
// PDF: perca-o-medo-da-automacao.pdf, página 56
// Dica: Use toBeDisabled()
import { test, expect } from "@playwright/test";

// Troque test.skip por test depois de implementar o exercício.
test.skip("WEB #007 — Verificar que um elemento está desabilitado", async ({ page }) => {
  await page.setContent(`
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head><meta charset="UTF-8"><title>Elemento desabilitado</title></head>
      <body>
        <button type="button" disabled>Enviar</button>
      </body>
    </html>
  `);
  // TODO: executar o cenário descrito no enunciado.
  // TODO: verificar o resultado com expect e limpar os dados criados.
  throw new Error("Exercício ainda não implementado.");
});
