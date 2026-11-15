import { test, expect, type Page } from '@playwright/test';

const noSideScroll = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);

for (const [width, height] of [
  [320, 700],
  [390, 844],
  [768, 1024],
  [1366, 700],
  [1920, 1000],
  [2560, 1300],
])
  test(`layout at ${width}x${height}: nothing scrolls sideways, no errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(await noSideScroll(page)).toBe(true);
    await page.locator('footer').scrollIntoViewIfNeeded();
    expect(await noSideScroll(page)).toBe(true);
    expect(errors).toEqual([]);
  });

test('the nav links to the docs and GitHub, nothing else', async ({ page }) => {
  await page.goto('/');
  const links = page.getByRole('navigation', { name: 'Main' }).getByRole('link');
  await expect(links).toHaveCount(2);
  await expect(links.nth(0)).toHaveAttribute('href', 'https://oqura-ai.github.io/wisdom-docs');
  await expect(links.nth(1)).toHaveAttribute('href', 'https://github.com/Oqura-ai/wisdom');
});

test('the walkthrough is an MP4 that plays muted and stays paused once paused, and seeks', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const video = page.locator('.film video');
  await expect(video).toHaveAttribute('src', /\.mp4$/);
  await expect(video).toHaveJSProperty('muted', true);
  await video.scrollIntoViewIfNeeded();
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(false);
  await page.getByRole('button', { name: 'Pause walkthrough' }).click();
  await page.locator('footer').scrollIntoViewIfNeeded();
  await video.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  expect(await video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  await page.getByRole('button', { name: 'Play walkthrough' }).click();
  await page.getByRole('slider', { name: 'Seek' }).fill('70');
  await expect
    .poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime))
    .toBeGreaterThan(60);
});

test('features: one wheel notch moves one feature, clips draw, skip jumps past', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const section = page.locator('#features');
  const on = () => page.locator('.feat.on h2').textContent();
  await page.evaluate(() => {
    const s = document.getElementById('features')!;
    scrollTo({ top: s.offsetTop + 10, behavior: 'instant' });
  });
  await expect.poll(on).toContain('Work as usual.');
  await expect(page.locator('.feat.on .clip svg')).toHaveCount(1);
  await page.mouse.move(700, 450);
  await page.mouse.wheel(0, 100);
  await expect.poll(on).toContain('Two moves read');
  await page.getByRole('button', { name: 'Skip features' }).click();
  await expect
    .poll(() =>
      section.evaluate((s: HTMLElement) => scrollY >= s.offsetTop + s.offsetHeight - innerHeight),
    )
    .toBe(true);
});

test('phones get a static page: poster with native controls, flat board, every feature listed', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const video = page.locator('.film video');
  await expect(video).toHaveJSProperty('controls', true);
  expect(await video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  await expect(page.locator('.scrub')).toHaveCount(0);
  expect(await page.locator('.board').evaluate((b) => getComputedStyle(b).transform)).not.toContain(
    'matrix3d',
  );
  await expect(page.locator('.feat.on')).toHaveCount(9);
});

test('reduced motion: nothing plays on its own', async ({ browser }) => {
  const context = await browser.newContext({
    reducedMotion: 'reduce',
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  await page.goto('/');
  const video = page.locator('.film video');
  await video.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  expect(await video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  await context.close();
});
