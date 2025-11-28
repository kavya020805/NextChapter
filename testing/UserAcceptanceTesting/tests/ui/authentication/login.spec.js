import { test, expect } from '@playwright/test';

test('user login with valid credentials', async ({ page }) => {
  await page.goto('https://nextchapter-it-314.vercel.app/sign-in');
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('nwuser@google.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('nwuser');
  await page.getByRole('button', { name: 'Sign In' }).click();
});

test('user login with invalid credentials', async ({ page }) => {
  await page.goto('https://nextchapter-it-314.vercel.app/sign-in');
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('nwuser@google.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('wrongpwd');
  await page.getByRole('button', { name: 'Sign In' }).click();
});
