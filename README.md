# Wisdom frontend

A standalone Next.js landing-page prototype. The hero is interactive; the story below it is static content with viewport-triggered animations that run once.

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
npx playwright install chromium
npm run test:e2e
```

Browser tests start the production app on port 3100. Build first. To use an existing Chromium installation, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to its executable path.

The tests cover six viewport widths, agent geometry, horizontal overflow, static context diagrams, causal task sources, causal references, keyboard dismissal and focus return, reduced motion, and offscreen playback suspension.

## Structure

The page is composed on the server. Only the hero, dashboard, and animation observers need client-side code.

```text
app/page.tsx
  Hero
    usePlayback               owns playback state and animation scheduling
    AgentNetwork              draws teams, connections, characters, and eyes
      useAgentLife            handles cursor gaze and visible/hidden activity
    WisdomLayer               shows captured contributions
    PlaybackControls          forwards user input to the playback hook
    Dashboard (loaded on demand)
      AgentContext            shared context diagram used again in the story
        AgentProfile          displays properties and access rules
        CapturedLedger        draws the static ledger stack and captured trail
  Story                       server-rendered illustrations
    StoryMotion               starts each viewport animation once
```

## Where to change what

| Change                                                  | File                                            |
| ------------------------------------------------------- | ----------------------------------------------- |
| Page content and section order                          | `app/page.tsx`, `components/story.tsx`          |
| Agent fixtures, run stages, and causal references       | `lib/demo.ts`                                   |
| Team placement, agent sizing, and connector endpoints   | `lib/scene-geometry.ts`                         |
| Eye shapes and expression timing                        | `lib/agent-expression.ts`                       |
| Cursor following and blink suspension                   | `components/use-agent-life.ts`                  |
| Play, pause, seek, restart, and reduced-motion behavior | `lib/playback.ts`, `components/use-playback.ts` |
| Profile labels and peer/developer visibility            | `lib/agent-profile.ts`                          |
| Dashboard diagram and modal focus                       | `components/dashboard.tsx`                      |
| Layout, colors, responsive rules, and CSS animations    | `app/globals.css`                               |

Time values in the model use seconds; browser animation timestamps use milliseconds. Geometry is calculated in SVG coordinates, not screen pixels. Desktop and mobile scenes share the same model; CSS chooses the visible layout without a hydration-time breakpoint shift.

Playback is capped at 20 updates per second and stops offscreen or when the tab is hidden. Cursor movement updates only SVG eye transforms, without React rerenders. Idle eye animations stop offscreen and while the dashboard is open. The page does not use an animation library, external fonts, or external images.

## Formatting and maintenance

```sh
npm run format
npm run format:check
```

Prettier formats the TypeScript, JSX, CSS, and tests. Keep rendering in components, pure calculations in `lib/`, and browser listeners or timers in hooks with explicit cleanup. Comments explain constraints and ownership rather than restating each line.

`tests/model.spec.ts` checks playback boundaries, causal ordering, and profile visibility. `tests/landing.spec.ts` checks the rendered UI and interactions. Both run with `npm run test:e2e`.

No accounts, transport contract, or live agent integration is implemented. All work records and permissions are illustrative. Task cards are derived from captured runs in `lib/agent-tasks.ts`; each demo run represents one task, with its requester resolved from an existing causal reference. The popup is a static context-sharing diagram; only its close button is interactive. Offset sheets illustrate the task archive without inventing additional captured records.

Feature illustrations reuse `AgentProfile`, `CapturedLedger`, `AgentContext`, and `WisdomLayer` from the hero. Omitting the Wisdom layer callbacks renders static cells rather than controls. Story content stays server-rendered; `StoryMotion` reveals the shared primitives once per section.
