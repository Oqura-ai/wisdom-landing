// The hero board: contribution years of 53 weeks x 7 days, "wisdom" written in the middle year.
// Deterministic (seeded), so the server and the browser draw the same cells.

export const WEEKS = 53;
export const CELL = 40;
export const GAP = 7;

/** xorshift32: a tiny seeded generator. */
export const rng = (seed: number) => {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
};

const GLYPHS: Record<string, string[]> = {
  w: ['X...X', 'X...X', 'X...X', 'X.X.X', 'X.X.X', 'XX.XX', 'X...X'],
  i: ['XXX', '.X.', '.X.', '.X.', '.X.', '.X.', 'XXX'],
  s: ['.XXXX', 'X....', 'X....', '.XXX.', '....X', '....X', 'XXXX.'],
  d: ['XXXX.', 'X...X', 'X...X', 'X...X', 'X...X', 'X...X', 'XXXX.'],
  o: ['.XXX.', 'X...X', 'X...X', 'X...X', 'X...X', 'X...X', '.XXX.'],
  m: ['X...X', 'XX.XX', 'X.X.X', 'X.X.X', 'X...X', 'X...X', 'X...X'],
};

/** The word as columns of 7 booleans, one blank column between letters. */
export const WORD: boolean[][] = (() => {
  const cols: boolean[][] = [];
  [...'wisdom'].forEach((ch, k, all) => {
    const g = GLYPHS[ch];
    for (let x = 0; x < g[0].length; x++) cols.push(g.map((r) => r[x] === 'X'));
    if (k < all.length - 1) cols.push(Array(7).fill(false));
  });
  return cols;
})();

/** Width of the word in board pixels (unscaled). */
export const WORD_WIDTH = WORD.length * (CELL + GAP) - GAP;

export type Cell = { level: 0 | 1 | 2 | 3 | 4; word: boolean };
export type Year = { now: boolean; cells: Cell[] };

function year(seed: number, withWord: boolean): Year {
  const pad = Math.floor((WEEKS - WORD.length) / 2);
  const cells: Cell[] = [];
  for (let c = 0; c < WEEKS; c++)
    for (let r = 0; r < 7; r++) {
      const v = rng(seed * 99991 + c * 7919 + r * 104729 + 23)();
      const word = withWord && c >= pad && c < pad + WORD.length && WORD[c - pad][r];
      const level = word ? (v < 0.82 ? 4 : 3) : v < 0.66 ? 0 : v < 0.92 ? 1 : 2;
      cells.push({ level: level as Cell['level'], word });
    }
  return { now: withWord, cells };
}

/** Five years, the word in the middle one. */
export const YEARS: Year[] = [
  year(3, false),
  year(1, false),
  year(0, true),
  year(2, false),
  year(4, false),
];

/** The strip under the features: 3 rows of contributions that light up with progress. */
export const HEAT: (1 | 2 | 3 | 4)[] = Array.from({ length: WEEKS * 3 }, (_, k) => {
  const c = Math.floor(k / 3),
    r = k % 3;
  const v = rng(c * 131 + r * 977 + 5)();
  return v < 0.3 ? 1 : v < 0.6 ? 2 : v < 0.85 ? 3 : 4;
});
