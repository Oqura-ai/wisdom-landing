import { getFilm, videoTime } from './film';
import { STEADY_CROP } from './film/steady';

const CROP = STEADY_CROP.join(' ');
/** Seconds a finished clip holds its last frame before it counts as done. */
const HOLD = 1.6;
/** Frame interval in ms (about 30 fps). */
const FRAME = 33;

export const CLIP_ASPECT = STEADY_CROP[2] / STEADY_CROP[3];

type Clip = {
  el: HTMLElement;
  prefix: string;
  from: number;
  len: number;
  still: number;
  visible: boolean;
  live: boolean;
  t0: number;
  last: number;
  plays: number;
};

/**
 * Plays parts of the film's steady cut into `figures` (one per feature that has a clip; `ranges` in script time).
 * Each draws its last frame at once; when `animate`, the one whose feature is active plays while on screen,
 * and `onDone(i)` fires each time it finishes a play. Returns a stop function.
 */
export function startClips(
  figures: HTMLElement[],
  ranges: [number, number][],
  isActive: (i: number) => boolean,
  onDone: (i: number) => void,
  animate: boolean,
): () => void {
  const film = getFilm();
  const clips: Clip[] = figures.map((el, i) => {
    const [a, b] = ranges[i];
    const from = videoTime(a);
    return {
      el,
      prefix: `c${i}-`,
      from,
      len: videoTime(b) - from,
      still: videoTime(b - 0.6),
      visible: false,
      live: false,
      t0: 0,
      last: 0,
      plays: 0,
    };
  });
  const draw = (c: Clip, v: number) => {
    c.el.innerHTML = film.frame(v, CROP, c.prefix, true);
  };
  clips.forEach((c) => draw(c, c.still));
  if (!animate) return () => {};

  const io = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        const c = clips.find((x) => x.el === e.target);
        if (c) c.visible = e.isIntersecting;
      }),
    { threshold: 0.2 },
  );
  clips.forEach((c) => io.observe(c.el));
  let raf = 0;
  const tick = (now: number) => {
    clips.forEach((c, i) => {
      const live = c.visible && !document.hidden && isActive(i);
      if (live && !c.live) {
        c.t0 = now;
        c.plays = 0;
      }
      c.live = live;
      if (!live || now - c.last < FRAME) return;
      const el = (now - c.t0) / 1000,
        play = Math.floor(el / (c.len + HOLD));
      if (play > c.plays) {
        c.plays = play;
        onDone(i);
      }
      c.last = now;
      draw(c, c.from + Math.min(el % (c.len + HOLD), c.len));
    });
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(raf);
    io.disconnect();
  };
}
