import { test, expect } from '@playwright/test';

test('Add book', async ({ page }) => {
  
  await page.goto('https://nextchapter-it-314.vercel.app/');
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('admin@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('ADMIN');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('button', { name: 'Add Book' }).click();
  await page.getByRole('textbox', { name: 'Book title' }).click();
  await page.getByRole('textbox', { name: 'Book title' }).fill('New Book');
  await page.getByRole('textbox', { name: 'Author name' }).click();
  await page.getByRole('textbox', { name: 'Author name' }).fill('XYZ');
  await page.getByRole('textbox', { name: 'Brief biography of the author' }).click();
  await page.getByRole('textbox', { name: 'Brief biography of the author' }).fill('Fantasy author');
  await page.locator('input[name="cover_file"]').click();
  await page.locator('input[name="cover_file"]').setInputFiles('test.jpg');
  await page.locator('input[name="pdf_file"]').click();
  await page.locator('input[name="pdf_file"]').setInputFiles('Kurose_Computer Networking _ A Top Down Approach, 7th, converted.pdf');
  await page.getByRole('textbox', { name: 'e.g., Fiction, Romance, Drama' }).click();
  await page.getByRole('textbox', { name: 'e.g., Fiction, Romance, Drama' }).fill('Education');
  await page.getByRole('button', { name: 'Add' }).click();
});
