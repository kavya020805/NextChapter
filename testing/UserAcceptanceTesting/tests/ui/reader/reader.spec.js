import { test, expect } from '@playwright/test';

test('Read now', async ({ page }) => {
  await page.goto('https://nextchapter-it-314.vercel.app/');
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('nwuser@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('nwuser');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('link', { name: 'Great Expectations Great' }).click();
  await page.getByRole('button').filter({ hasText: /^$/ }).nth(4).click();
  await page.getByRole('button', { name: 'Read Now' }).click();
});

test('Go to desired page', async ({ page }) => {
  await page.goto('https://nextchapter-it-314.vercel.app/');
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('nwuser@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('nwuser');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('link', { name: 'Great Expectations Great' }).click();
  await page.getByRole('button').filter({ hasText: /^$/ }).nth(4).click();
  await page.getByRole('button', { name: 'Read Now' }).click();
  await page.getByRole('button').nth(5).click();
  await page.getByPlaceholder('Go to page...').click();
  await page.getByPlaceholder('Go to page...').fill('10');
  await page.getByRole('button', { name: 'Go' }).click();
});

test('Bookmark page', async ({ page }) => {
  await page.goto('https://nextchapter-it-314.vercel.app/');
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('nwuser@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('nwuser');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('link', { name: 'Great Expectations Great' }).click();
  await page.getByRole('button').filter({ hasText: /^$/ }).nth(4).click();
  await page.getByRole('button', { name: 'Read Now' }).click();
  await page.getByRole('button').nth(5).click();
  await page.getByPlaceholder('Go to page...').click();
  await page.getByPlaceholder('Go to page...').fill('11');
  await page.getByRole('button', { name: 'Go' }).click();
  await page.getByRole('button', { name: '☆ Bookmark Page' }).click();
});

test('Change reading mode', async ({ page }) => {
  await page.goto('https://nextchapter-it-314.vercel.app/');
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('nwuser@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('nwuser');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('link', { name: 'Great Expectations Great' }).click();
  await page.getByRole('button').filter({ hasText: /^$/ }).nth(4).click();
  await page.getByRole('button', { name: 'Read Now' }).click();
  await page.getByRole('button', { name: 'Dark' }).click();
  await page.getByRole('button', { name: 'Reader' }).click();
  await page.getByRole('button', { name: 'Light', exact: true }).click();
});

test('Play audio book', async ({ page }) => {
  await page.goto('https://nextchapter-it-314.vercel.app/');
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('nwuser@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('nwuser');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('link', { name: 'Great Expectations Great' }).click();
  await page.getByRole('button').filter({ hasText: /^$/ }).nth(4).click();
  await page.getByRole('button', { name: 'Read Now' }).click();
  await page.getByRole('button', { name: 'Go' }).click();
  await page.getByRole('button', { name: 'Play' }).click();
  
});

test('Dictionary meaning right word', async ({ page }) => {
  await page.goto('https://nextchapter-it-314.vercel.app/');
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('nwuser@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('nwuser');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('link', { name: 'Great Expectations Great' }).click();
  await page.getByRole('button').filter({ hasText: /^$/ }).nth(4).click();
  await page.getByRole('button', { name: 'Read Now' }).click();
  await page.getByRole('textbox', { name: 'Enter a word to look up…' }).click();
  await page.getByRole('textbox', { name: 'Enter a word to look up…' }).fill('right');
  await page.getByRole('button', { name: 'Search' }).click();
  
});

test('Dictionary meaning wrong word', async ({ page }) => {
  await page.goto('https://nextchapter-it-314.vercel.app/');
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('nwuser@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('nwuser');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('link', { name: 'Great Expectations Great' }).click();
  await page.getByRole('button').filter({ hasText: /^$/ }).nth(4).click();
  await page.getByRole('button', { name: 'Read Now' }).click();
  await page.getByRole('textbox', { name: 'Enter a word to look up…' }).click();
  await page.getByRole('textbox', { name: 'Enter a word to look up…' }).fill('djsdcj');
  await page.getByRole('button', { name: 'Search' }).click();
  
});

test('Chatbox', async ({ page }) => {
  await page.goto('https://nextchapter-it-314.vercel.app/');
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('nwuser@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('nwuser');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('link', { name: 'Great Expectations Great' }).click();
  await page.getByRole('button').filter({ hasText: /^$/ }).nth(4).click();
  await page.getByRole('button', { name: 'Read Now' }).click();
  await page.getByRole('button', { name: 'Chat' }).click();
  await page.getByRole('textbox', { name: 'Ask about the book...' }).click();
  await page.getByRole('textbox', { name: 'Ask about the book...' }).fill('tell me about the author');
  await page.getByRole('button', { name: 'Close' }).click();
  await page.getByRole('button', { name: '← Back' }).click();
});

test('Image generation', async ({ page }) => {
  await page.goto('https://nextchapter-it-314.vercel.app/');
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('nwuser@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('nwuser');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('link', { name: 'Great Expectations Great' }).click();
  await page.getByRole('button').filter({ hasText: /^$/ }).nth(4).click();
  await page.getByRole('button', { name: 'Read Now' }).click();
  await page.getByRole('button', { name: 'Image' }).click();
  await page.getByRole('textbox', { name: 'Describe the scene, character' }).click();
  await page.getByRole('textbox', { name: 'Describe the scene, character' }).fill('Create an image of the author');
  await page.getByRole('button', { name: 'Close' }).click();
  await page.getByRole('button', { name: '← Back' }).click();
});