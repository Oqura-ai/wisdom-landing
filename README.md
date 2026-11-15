# Wisdom landing

The Wisdom landing page: a Next.js app that renders to one static page.

- **Hero:** a tilted contribution board with "wisdom" written in it, and the walkthrough film as an MP4.
- **Features:** a commit tree that walks through them one at a time, each with a clip from the film.
- **Footer:** the wordmark, with the bot as its "o".

## Run

```sh
npm install
npm run dev
```

Open http://localhost:3000. For a production preview:

```sh
npm run build
npm run start
```

## Checks

```sh
npm run lint
npm run build
npm run test:e2e
```

The browser tests start the production app on port 3100, so build first. To use an existing Chromium or Edge, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to its executable path.

The tests cover:

- Layout at six viewport sizes, from 320px to 2560px: no sideways scroll and no page errors.
- The nav links.
- The walkthrough video: it plays muted, stays paused once paused, and the progress bar seeks.
- The features: one wheel notch moves one feature, the clips draw, and skip jumps past the section.
- The static phone page.
- Reduced motion.

## The film

The film page, `../assets/wisdom-team-final.html`, is the source for both the hero and the feature clips. Every frame of it is a pure function of time, `render(t)`.

| What             | How                                                                              | Output                                              |
| ---------------- | -------------------------------------------------------------------------------- | --------------------------------------------------- |
| Hero walkthrough | `npm run film:render`: draws every frame at 1920×1080 and encodes it with ffmpeg | `public/film/wisdom-walkthrough.mp4` and its poster |
| Feature clips    | `npm run film:sync`: copies the film's drawing code                              | `lib/film/film.generated.js`                        |

The feature clips are drawn live in the browser, at their own size. `lib/film/steady.ts` stages them as a _steady cut_:

- The terminal rests at the left and its panel at the right.
- Browser windows open in the same place and fade through (one fully out, then the other in) instead of sliding.
- There's no camera, backdrop or captions.

So every clip shares one crop, and its left edge lines up with the text above it.

When the film changes, run both commands again. The sync script stops with a message if the film's structure changes in a way it can't follow. `film:render` needs ffmpeg on PATH and takes about 15 minutes.

## Structure

The page is composed on the server. The client components only add behaviour.

```text
app/layout.tsx            fonts (self-hosted), metadata, the page scale --z set before first paint
app/page.tsx              nav, hero, features, footer
app/globals.css           all styles; sizes scale with --z (page), --k (board) and --s (features)
components/
  board.tsx               the hero board: cells, --k, dimming on scroll, click to light a cell
  hero-film.tsx           the MP4 under a plain video bar (play, progress, time, full screen); plays only on screen
  features.tsx            the commit tree and features: scroll, wheel and keys step; clips; skip; auto-advance
  footer.tsx              links, wordmark, social icons
  footer-bot.tsx          the bot's eyes follow the pointer
  copy-button.tsx         a shell command with a copy button
  to-top.tsx              back to top
lib/
  content.tsx             every word and link on the page, tree, features, footer links
  board.ts                the seeded board and heat strip
  motion.ts               phone and reduced-motion rules
  feature-clips.ts        plays film ranges into the clip figures
  film/                   the generated film, its types, the steady cut, the video-time map
scripts/
  sync-film.mjs           film page -> lib/film/film.generated.js
  render-walkthrough.mjs  film page -> public/film/*.mp4 and poster
```

## Behaviour worth knowing

- **Phones (700px and narrower) get a static page.**
  - The board is flat, showing just the word.
  - Nothing animates.
  - The walkthrough shows its poster with native controls.
  - Every feature is listed with a still frame.
- **Reduced motion** keeps the desktop layout, but nothing plays on its own.
- **Big screens:**
  - `--z` grows past 1 from about a 1600×1000 window, by the smaller of width and height, up to 2.
  - The board scales with its own perspective, so the tilt looks the same at every size.
- **The features walk:**
  - Each clip plays once, holds its last frame for 1.6 seconds, then the next feature comes up.
  - A feature without a clip stays for 5 seconds.
  - It only moves on its own while the section is pinned on screen and the tab is visible.
- **Fonts are self-hosted through `next/font`.** The clips read the font names from CSS variables on `<html>`, so the browser makes no requests to Google.
