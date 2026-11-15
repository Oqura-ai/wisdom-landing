import {
  createFilm,
  FILM_DUR,
  FILM_WARP,
  type FilmCore,
  type FilmFonts,
} from './film.generated.js';
import { steadyFrame } from './steady';

/** Video length in seconds. */
export const FILM_DURATION = FILM_DUR;

/** The film's script time (the clock its captions and keyframes use) to video time. */
export function videoTime(scriptTime: number): number {
  const W = FILM_WARP;
  for (let i = 1; i < W.length; i++) {
    const [v0, t0] = W[i - 1],
      [v1, t1] = W[i];
    if (scriptTime <= t1) return v0 + ((v1 - v0) * Math.max(0, scriptTime - t0)) / (t1 - t0);
  }
  return FILM_DUR;
}

export type Film = {
  /**
   * One frame as SVG markup, cropped to `crop` ("x y w h" in film coordinates). `steady` draws the
   * landing's steady cut (see steady.ts). `idPrefix` keeps SVG ids unique when several frames share a page.
   */
  frame(videoTime: number, crop: string, idPrefix: string, steady?: boolean): string;
};

const HEAD = 'viewBox="0 0 1920 1080" width="1920" height="1080"';

/** Reads the self-hosted font families the layout puts on <html> as CSS variables. */
function fontsFromPage(): FilmFonts {
  const css = getComputedStyle(document.documentElement);
  // single quotes: the film writes these into double-quoted SVG attributes
  const v = (name: string) => css.getPropertyValue(name).trim().replace(/"/g, "'");
  return {
    head: `${v('--font-mona')},${v('--font-inter')},'Segoe UI',Arial,sans-serif`,
    mono: `${v('--font-jetbrains')},'Cascadia Mono',Consolas,monospace`,
    sans: `${v('--font-inter')},'Segoe UI',Arial,sans-serif`,
  };
}

function wrap(core: FilmCore): Film {
  return {
    frame(v, crop, idPrefix, steady = false) {
      return (steady ? steadyFrame(core, v) : core.render(v))
        .replace(HEAD, `viewBox="${crop}" preserveAspectRatio="xMidYMid meet"`)
        .replace(/id="/g, `id="${idPrefix}`)
        .replace(/url\(#/g, `url(#${idPrefix}`);
    },
  };
}

let film: Film | null = null;

/** The film, built once per page on first use (browser only: it reads the page's fonts). */
export function getFilm(): Film {
  return (film ??= wrap(createFilm(fontsFromPage())));
}
