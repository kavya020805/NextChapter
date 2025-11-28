import { test, expect } from '@playwright/test';

test('Logout', async ({ page }) => {
  await page.goto('https://nextchapter-it-314.vercel.app/');
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('nwuser@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('nwuser');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('button', { name: 'User profile menu' }).click();
  await page.getByRole('button', { name: 'Logout' }).click();
});