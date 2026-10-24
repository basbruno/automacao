import { test, expect } from '@playwright/test';

test('Login com credenciais válidas', async ({ page }) => {
  // 1. Navegar para a página de login
  await page.goto('https://the-internet.herokuapp.com/login');

  // 2. Preencher usuário
  await page.fill('#username', 'tomsmith');

  // 3. Preencher senha
  await page.fill('#password', 'SuperSecretPassword!');

  // 4. Clicar em Login
  await page.click('button[type="submit"]');

  // 5. Verificar que o login funcionou
  await expect(page.locator('#flash')).toContainText('You logged into a secure area!');
});

test('Login com senha incorreta', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/login');
  await page.fill('#username', 'tomsmith');
  await page.fill('#password', 'senha_errada');
  await page.click('button[type="submit"]');
  await expect(page.locator('#flash')).toContainText('Your password is invalid!');
});
