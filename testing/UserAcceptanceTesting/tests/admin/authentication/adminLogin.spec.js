import { test, expect } from '@playwright/test';

test('Admin login with valid credentials', async ({ page }) => {
  await page.goto('https://nextchapter-it-314.vercel.app/sign-in');
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('admin@google.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('ADMIN');
  await page.getByRole('button', { name: 'Sign In' }).click();
});