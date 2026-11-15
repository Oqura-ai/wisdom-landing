// Types for film.generated.js (written by scripts/sync-film.mjs).

/** Font stacks the film draws its text with: the site's self-hosted families first. */
export type FilmFonts = { head: string; mono: string; sans: string };

/** Where a window sits: centre, scale, opacity and dim, in the film's 1920x1080 coordinates. */
export type WindowState = { cx: number; cy: number; s: number; op: number; dim: number };

type Part = (t: number) => string;

export type FilmCore = {
  /** One 1920x1080 SVG for a time in the video (seconds). */
  render(videoTime: number): string;
  /** Video length in seconds. */
  DUR: number;
  /** Video time to the film's script time, as [videoTime, scriptTime] pairs. */
  WARP: [number, number][];
  keys(t: number, ks: number[][], ease?: (v: number) => number): number[];
  clamp(v: number, a?: number, b?: number): number;
  DEFS: string;
  resetIds(): void;
  parts: Record<
    | 'termWindow'
    | 'installCards'
    | 'recHud'
    | 'askPanel'
    | 'contPanel'
    | 'teamPanel'
    | 'particles'
    | 'browserWindow'
    | 'mouse'
    | 'ghWindow2'
    | 'ghMouse',
    Part
  >;
  windows: {
    winState: (t: number) => WindowState;
    browState: (t: number) => WindowState;
    ghState: (t: number) => WindowState;
  };
};

export function createFilm(fonts: FilmFonts): FilmCore;

/** Video length in seconds. */
export const FILM_DUR: number;
/** Video time to script time, as [videoTime, scriptTime] pairs. */
export const FILM_WARP: [number, number][];
