import type { FilmCore, WindowState } from './film.generated.js';

/**
 * The landing's steady cut of the film, used by the feature clips. Same windows, panels and typing as the
 * film, on one fixed stage: the terminal rests at the left (x 100) with its panel to the right (x 1340-1840);
 * browser windows open left-aligned in the same place and fade through with the desk instead of sliding.
 * No camera, backdrop, captions or cards, so every clip shares one crop (STEADY_CROP).
 */
export const STEADY_CROP = [100, 126, 1740, 808] as const;

const STAGE = { term: 700, web: 800, y: 530 };
/** Where the film parks the terminal while a browser window has the screen. */
const TERM_AWAY = -1220;

const originals = new WeakMap<FilmCore, FilmCore['windows']>();

export function steadyFrame(core: FilmCore, videoTime: number): string {
  const w = core.windows;
  let own = originals.get(core);
  if (!own) {
    own = { winState: w.winState, browState: w.browState, ghState: w.ghState };
    originals.set(core, own);
  }
  const t = core.keys(videoTime, core.WARP, (v) => core.clamp(v))[0];
  // how much of the desk shows: 1 at rest, 0 while the film has the terminal away for a browser window
  const desk = core.clamp((own.winState(t).cx - TERM_AWAY) / (STAGE.term - TERM_AWAY));
  const atRest = (s: WindowState, cx: number): WindowState => ({ ...s, cx, cy: STAGE.y, s: 1 });
  const o = own;
  w.winState = (x) => ({ ...atRest(o.winState(x), STAGE.term), dim: 0 });
  w.browState = (x) => atRest(o.browState(x), STAGE.web);
  w.ghState = (x) => atRest(o.ghState(x), STAGE.web);
  try {
    core.resetIds();
    const p = core.parts;
    const deskSvg =
      p.termWindow(t) +
      p.installCards(t) +
      p.recHud(t) +
      p.askPanel(t) +
      p.contPanel(t) +
      p.teamPanel(t) +
      p.particles(t);
    const webSvg = p.browserWindow(t) + p.mouse(t) + p.ghWindow2(t) + p.ghMouse(t);
    // fade through: the outgoing window fades fully before the incoming one appears, so the two
    // never overlap in the same place (a cross-fade there doubles every line of text)
    const deskOp = core.clamp(desk * 2 - 1),
      webOp = core.clamp(1 - desk * 2);
    return (
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">${core.DEFS}` +
      (deskOp > 0 ? `<g opacity="${deskOp.toFixed(3)}">${deskSvg}</g>` : '') +
      (webOp > 0 ? `<g opacity="${webOp.toFixed(3)}">${webSvg}</g>` : '') +
      '</svg>'
    );
  } finally {
    w.winState = o.winState;
    w.browState = o.browState;
    w.ghState = o.ghState;
  }
}
