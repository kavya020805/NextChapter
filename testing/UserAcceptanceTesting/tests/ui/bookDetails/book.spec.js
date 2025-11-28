import { test, expect } from '@playwright/test';

test('Open book details page', async ({ page }) => {
  await page.goto('https://nextchapter-it-314.vercel.app/');
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('nwuser@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('nwuser');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('link', { name: 'Great Expectations Great' }).click();
  await page.getByRole('button').filter({ hasText: /^$/ }).nth(4).click();

});

test('Acceptable comment', async ({ page }) => {
  await page.goto('https://nextchapter-it-314.vercel.app/');
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('nwuser@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('nwuser');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('link', { name: 'Great Expectations Great' }).click();
  await page.getByRole('button').filter({ hasText: /^$/ }).nth(4).click();
  await page.getByRole('textbox', { name: 'Share your thoughts or start' }).click();
  await page.getByRole('textbox', { name: 'Share your thoughts or start' }).fill('Good book.');
  await page.getByRole('button', { name: 'Post Comment' }).click();
});

test('Unacceptable comment', async ({ page }) => {
  await page.goto('https://nextchapter-it-314.vercel.app/');
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('nwuser@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('nwuser');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('link', { name: 'Great Expectations Great' }).click();
  await page.getByRole('button').filter({ hasText: /^$/ }).nth(4).click();
  await page.getByRole('textbox', { name: 'Share your thoughts or start' }).click();
  await page.getByRole('textbox', { name: 'Share your thoughts or start' }).fill('Only a moron would read this book...');
  await page.getByRole('button', { name: 'Post Comment' }).click();
  await page.getByText('Your comment was flagged for').click();
  await page.getByRole('button', { name: 'I understand' }).click();
});


test('Add to Reading list', async ({ page }) => {
  await page.goto('https://nextchapter-it-314.vercel.app/');
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('nwuser@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('nwuser');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('link', { name: 'Great Expectations Great' }).click();
  await page.getByRole('button').filter({ hasText: /^$/ }).nth(4).click();
  await page.getByRole('button', { name: 'Add to Reading List' }).click();
});

test('Mark as read', async ({ page }) => {
  await page.goto('https://nextchapter-it-314.vercel.app/');
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('nwuser@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('nwuser');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('link', { name: 'Great Expectations Great' }).click();
  await page.getByRole('button').filter({ hasText: /^$/ }).nth(4).click();
  await page.getByRole('button', { name: 'Mark as Read' }).click();
});

test('Report Comment', async ({ page }) => {
  await page.goto('https://nextchapter-it-314.vercel.app/');
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('nwuser@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('nwuser');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('link', { name: 'Wuthering Heights Wuthering' }).click();
  await page.locator('div:nth-child(17) > .flex.flex-wrap > .flex.items-center.gap-1.hover\\:opacity-80.transition-opacity.disabled\\:opacity-40').click();
  await page.getByRole('radio', { name: 'Offensive or inappropriate' }).check();
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'Submit Report' }).click();
  
});


