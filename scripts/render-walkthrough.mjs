// Renders the film page to the hero's MP4 and poster.
//
//   node scripts/render-walkthrough.mjs [path/to/wisdom-team-final.html]
//
// Every frame is the film's own render(t), drawn at 1920x1080 in a browser and piped to ffmpeg (H.264, 30 fps,
// faststart). Needs ffmpeg on PATH and a Playwright browser (PLAYWRIGHT_CHROMIUM_EXECUTABLE, or the msedge
// channel). Takes about 15 minutes for the 122-second film.
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.resolve(
  process.argv[2] ?? path.join(root, '..', 'assets', 'wisdom-team-final.html'),
);
const out = path.join(root, 'public', 'film', 'wisdom-walkthrough.mp4');
const poster = path.join(root, 'public', 'film', 'wisdom-walkthrough-poster.jpg');
const FPS = 30;
/** The poster frame: the recording view, in video seconds. */
const POSTER_AT = 21.1;

const exe = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
const browser = await chromium.launch(exe ? { executablePath: exe } : { channel: 'msedge' });
const page = await browser.newPage({
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: 1,
});
await page.goto(`${pathToFileURL(src).href}?export`);
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(1500);
const frames = Math.round((await page.evaluate(() => DUR)) * FPS);
const shot = { type: 'png', clip: { x: 0, y: 0, width: 1920, height: 1080 } };
const draw = (t) =>
  page.evaluate((t) => (document.getElementById('stage').innerHTML = render(t)), t);

const ffmpeg = spawn(
  'ffmpeg',
  [
    '-y',
    '-loglevel',
    'error',
    '-f',
    'image2pipe',
    '-framerate',
    String(FPS),
    '-i',
    '-',
    '-c:v',
    'libx264',
    '-preset',
    'slow',
    '-crf',
    '20',
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    '+faststart',
    out,
  ],
  { stdio: ['pipe', 'inherit', 'inherit'] },
);
const started = Date.now();
for (let i = 0; i < frames; i++) {
  await draw(i / FPS);
  if (!ffmpeg.stdin.write(await page.screenshot(shot)))
    await new Promise((r) => ffmpeg.stdin.once('drain', r));
  if (i % 300 === 0)
    console.log(`frame ${i}/${frames}, ${Math.round((Date.now() - started) / 1000)}s`);
}
ffmpeg.stdin.end();
const code = await new Promise((r) => ffmpeg.on('close', r));
if (code !== 0) throw new Error(`ffmpeg exited with ${code}`);
await draw(POSTER_AT);
await page.screenshot({ ...shot, type: 'jpeg', quality: 88, path: poster });
await browser.close();
console.log(
  `wrote ${path.relative(root, out)} and ${path.relative(root, poster)} (${frames} frames)`,
);
