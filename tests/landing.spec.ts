import { test, expect } from '@playwright/test';

for (const width of [320, 390, 650, 768, 1280, 1600])
  test(`layout at ${width}px: the film fits and nothing scrolls sideways`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const film = page.locator('.film-hero');
    await expect(film).toBeVisible();
    const box = (await film.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width);
    expect(Math.abs(box.width / box.height - 16 / 9)).toBeLessThan(0.02);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    ).toBeTruthy();
    await page.locator('footer').scrollIntoViewIfNeeded();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    ).toBeTruthy();
    expect(errors).toEqual([]);
  });

test('the film plays muted, stays paused once paused, and stops off screen', async ({ page }) => {
  await page.goto('/');
  const video = page.locator('.film-video');
  await expect(video).toHaveJSProperty('muted', true);
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(false);
  await page.getByRole('button', { name: 'Pause film' }).click();
  await expect(page.getByRole('button', { name: 'Play film' })).toBeVisible();
  await page.locator('footer').scrollIntoViewIfNeeded();
  await page.locator('.hero-heading').scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  expect(await video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  await page.getByRole('button', { name: 'Play film' }).click();
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(false);
  await page.locator('footer').scrollIntoViewIfNeeded();
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
});

test('with reduced motion the film waits for a press', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.waitForTimeout(600);
  expect(await page.locator('.film-video').evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  await expect(page.getByRole('button', { name: 'Play film' })).toBeVisible();
  await expect(page.locator('#film-scenes li')).toHaveCount(9);
});

test('feature sections keep their diagrams without controls', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#captured-work .ledger-stack .task-trail')).toHaveCount(1);
  await expect(page.locator('#shared-context .agent-properties .property-block')).toHaveCount(2);
  await expect(page.locator('.connection-study .agent-context-diagram')).toHaveCount(1);
  await expect(page.locator('#oversight .wisdom-layer .contribution-cell')).toHaveCount(25);
  // Every team's boxes are one size, including a team alone on the last row.
  const widths = await page
    .locator('#oversight .contribution-cell')
    .evaluateAll((cells) => cells.map((cell) => cell.getBoundingClientRect().width));
  expect(Math.max(...widths) - Math.min(...widths)).toBeLessThan(1);
  await expect(
    page.locator('.story button, .story section a, .story details, .story input, .story select'),
  ).toHaveCount(0);
});

test('the story reveals once, and stays static with reduced motion', async ({ page }) => {
  await page.goto('/');
  await page.locator('#captured-work').scrollIntoViewIfNeeded();
  await expect(page.locator('#captured-work')).toHaveClass(/revealed/);
  await page.locator('.story-intro').scrollIntoViewIfNeeded();
  await expect(page.locator('#captured-work')).toHaveClass(/revealed/);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await page.locator('#captured-work').scrollIntoViewIfNeeded();
  await expect(page.locator('.motion-ready')).toHaveCount(0);
  expect(
    await page
      .locator('#captured-work .ledger-stack')
      .first()
      .evaluate((el) => getComputedStyle(el).opacity),
  ).toBe('1');
});

test('only wordmark bots follow the cursor and the slogan stays plain', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName(
    'Agents who know progress. Agents who can talk better.',
  );
  await expect(page.locator('h1 .face')).toHaveCount(0);
  await expect(page.locator('.wordmark .wordmark-bot')).toHaveCount(1);
  await expect(page.locator('.footer-brand .wordmark-bot')).toHaveCount(1);
  const eyes = page.locator('.wordmark .face-eyes');
  // Retry the pointer event until the lazy page hydration has attached listeners.
  await expect
    .poll(async () => {
      await page.mouse.move(900, 100);
      return eyes.getAttribute('style');
    })
    .toMatch(/translate/);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(eyes).not.toHaveAttribute('style', /translate/);
});
