import { test, expect } from '@playwright/test';
for (const width of [320, 390, 650, 768, 1280, 1600])
  test(`layout and agent geometry at ${width}px`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.getByLabel('Organization timeline').press('End');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    ).toBeTruthy();
    const geometry = await page
      .locator(width <= 650 ? '.mobile-network' : '.desktop-network')
      .evaluate((svg) => {
        const nodes = Array.from(svg.querySelectorAll('.network-agent')).map((g) => {
          const c = g.querySelectorAll('circle')[1].getBoundingClientRect();
          return { x: c.x + c.width / 2, y: c.y + c.height / 2, r: c.width / 2 };
        });
        const bounds = svg.getBoundingClientRect();
        return {
          count: nodes.length,
          outside: nodes.some(
            (n) =>
              n.x - n.r < bounds.left ||
              n.x + n.r > bounds.right ||
              n.y - n.r < bounds.top ||
              n.y + n.r > bounds.bottom,
          ),
          overlap: nodes.some((a, i) =>
            nodes.some((b, j) => j > i && Math.hypot(a.x - b.x, a.y - b.y) < a.r + b.r + 1),
          ),
        };
      });
    expect(geometry).toEqual({ count: 25, outside: false, overlap: false });
    await page
      .getByRole('button', { name: 'A01, Scope. Explore agent.' })
      .filter({ visible: true })
      .click();
    await expect(page.getByRole('dialog')).toBeVisible();
    expect(
      await page.getByRole('dialog').evaluate((el) => el.scrollWidth <= el.clientWidth),
    ).toBeTruthy();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await page.locator('footer').scrollIntoViewIfNeeded();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    ).toBeTruthy();
    expect(errors).toEqual([]);
  });
test('agent context diagram is static and retains captured task evidence', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Organization timeline').press('End');
  const agent = page
    .getByRole('button', { name: 'A06, Interfaces. Explore agent.' })
    .filter({ visible: true });
  await agent.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: 'Personality & traits' })).toBeVisible();
  await expect(dialog.getByRole('heading', { name: 'Access rules' })).toBeVisible();
  await expect(dialog.getByRole('heading', { name: 'Causal ledger' })).toBeVisible();
  await expect(dialog.locator('button')).toHaveCount(1);
  await expect(
    dialog.locator('input, select, details, a, [tabindex], .dashboard-foot'),
  ).toHaveCount(0);
  await expect(dialog.locator('.agent-owned-panel .task-card')).toHaveCount(1);
  await expect(dialog.getByLabel('Task from A01')).toBeVisible();
  await expect(dialog.locator('.task-trail li')).toHaveCount(9);
  await expect(dialog.locator('.sharing-bridge')).toHaveText('Shared');
  await expect(dialog.locator('.participant-rail .face')).toHaveCount(3);
  await expect(
    dialog.getByRole('img', { name: 'Orchestrator harness or developer' }),
  ).toBeVisible();
  await dialog.locator('.task-card').click();
  await expect(dialog.locator('#dashboard-title')).toHaveText('A06');
  await page.keyboard.press('Escape');
  await expect(agent).toBeFocused();
});
test('playback stops outside viewport and story reveals only once', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Organization timeline').press('End');
  await page.getByRole('button', { name: 'Restart', exact: true }).click();
  await expect(page.locator('.desktop-network .network-agent')).toHaveCount(1);
  await page.getByRole('button', { name: 'Play', exact: true }).click();
  await page.waitForTimeout(700);
  await expect(page.getByRole('button', { name: 'Pause', exact: true })).toBeVisible();
  await page.locator('#captured-work').scrollIntoViewIfNeeded();
  await expect(page.getByRole('button', { name: 'Play', exact: true })).toHaveCount(1);
  await expect(page.locator('#captured-work')).toHaveClass(/revealed/);
  const time = await page.locator('.playback output').textContent();
  await page.waitForTimeout(300);
  await expect(page.locator('.playback output')).toHaveText(time!);
  await page.locator('.story-intro').scrollIntoViewIfNeeded();
  await expect(page.locator('#captured-work')).toHaveClass(/revealed/);
  await expect(
    page.locator('.story button,.story section a,.story input,.story select,.story details'),
  ).toHaveCount(0);
});
test('reduced motion stays static and playback advances in steps', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByLabel('Organization timeline').press('End');
  await page.locator('#captured-work').scrollIntoViewIfNeeded();
  await expect(page.locator('.motion-ready')).toHaveCount(0);
  expect(
    await page
      .locator('#captured-work .ledger-stack')
      .first()
      .evaluate((el) => getComputedStyle(el).opacity),
  ).toBe('1');
  await page.getByRole('button', { name: 'Play', exact: true }).click();
  await expect(page.locator('.playback output')).toHaveText('0.0s');
  await page.getByRole('button', { name: 'Play', exact: true }).click();
  await expect(page.locator('.playback output')).toHaveText('4.0s');
});

test('agent expressions, cursor gaze and blinks stay alive without moving the timeline', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByLabel('Organization timeline').press('End');
  const network = page.locator('.desktop-network');
  await expect(network).toHaveAttribute('data-awake', 'true');
  const eyes = network.locator('[data-gaze="0"]');
  const agent = network.locator('.network-agent').first();
  const bounds = (await agent.boundingBox())!;
  await page.mouse.move(bounds.x + bounds.width / 2 + 45, bounds.y + bounds.height / 2 - 25);
  await expect(eyes).toHaveAttribute('transform', /translate\(/);
  await expect(page.locator('.playback output')).toHaveText('24.0s');
  const shapeCount = await network
    .locator('.agent-blink path')
    .evaluateAll((paths) => new Set(paths.map((p) => p.getAttribute('d'))).size);
  expect(shapeCount).toBeGreaterThan(1);
  expect(
    await network
      .locator('.agent-blink')
      .first()
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe('eye-blink');
  await page.mouse.move(10, 10);
  await expect(eyes).not.toHaveAttribute('transform', /translate/);
  await page.getByRole('button', { name: 'Restart', exact: true }).click();
  await expect(eyes).toHaveAttribute('data-expression', 'curious');
  const slider = page.getByLabel('Organization timeline');
  await slider.focus();
  for (let i = 0; i < 12; i++) await slider.press('ArrowRight');
  await expect(eyes).toHaveAttribute('data-expression', 'focused');
  await agent.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(network).toHaveAttribute('data-awake', 'false');
  await expect(page.locator('.sprites,.archive-sprites')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await page.locator('footer').scrollIntoViewIfNeeded();
  await expect(network).toHaveAttribute('data-awake', 'false');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(
    await network
      .locator('.agent-blink')
      .first()
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe('none');
});

test('feature sections reuse hero diagrams without controls', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Organization timeline').press('End');
  await expect(page.locator('#captured-work .ledger-stack .task-trail')).toHaveCount(1);
  await expect(page.locator('#shared-context .agent-properties .property-block')).toHaveCount(2);
  await expect(page.locator('.connection-study .agent-context-diagram')).toHaveCount(1);
  await expect(page.locator('#oversight .wisdom-layer .contribution-cell')).toHaveCount(25);
  await expect(
    page.locator('.story button, .story section a, .story details, .story input, .story select'),
  ).toHaveCount(0);
});

test('only wordmark bots follow the cursor and the slogan stays plain', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Organization timeline').press('End');
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

test('hero autoplays once and respects a manual pause', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Pause', exact: true })).toBeVisible();
  await expect
    .poll(async () => parseFloat((await page.locator('.playback output').textContent())!))
    .toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  const time = await page.locator('.playback output').textContent();
  await page.locator('footer').scrollIntoViewIfNeeded();
  await page.locator('.hero-heading').scrollIntoViewIfNeeded();
  await expect(page.getByRole('button', { name: 'Play', exact: true })).toBeVisible();
  await expect(page.locator('.playback output')).toHaveText(time!);
});
