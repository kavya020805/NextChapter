import { test, expect } from '@playwright/test';

test('View Profile', async ({ page }) => {
  await page.goto('https://nextchapter-it-314.vercel.app/');
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('nwuser@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('nwuser');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('button', { name: 'User profile menu' }).click();
  await page.getByRole('link', { name: 'User Profile' }).click();
});


test('Update Profile', async ({ page }) => {
  await page.goto('https://nextchapter-it-314.vercel.app/');
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('nwuser@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('nwuser');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('button', { name: 'User profile menu' }).click();
  await page.getByRole('link', { name: 'User Profile' }).click();
  await page.getByRole('button', { name: 'Edit profile' }).click();
  await page.locator('input[type="date"]').fill('2020-12-31');
  await page.locator('input[type="date"]').press('Enter');
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'Save' }).click();
});

