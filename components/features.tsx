'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { HEAT, WEEKS } from '@/lib/board';
import { CHECKS, FEATURES, INSTALL, TREE } from '@/lib/content';
import { CLIP_ASPECT, startClips } from '@/lib/feature-clips';
import { motionAllowed, scrollBehavior, STACKED } from '@/lib/motion';
import { Command } from './copy-button';

const N = FEATURES.length;
/** A feature without a clip stays this long before the walk moves on. */
const DWELL = 5000;
/** One wheel notch moves one feature; further notches wait this long. */
const STEP_LOCK = 700;
/** How far the section scrolls while pinned. */
const spanOf = (s: HTMLElement) => s.offsetHeight - innerHeight;
const CLIPPED = FEATURES.flatMap((f, i) => (f.clip ? [i] : []));

const subscribeStacked = (cb: () => void) => {
  const m = matchMedia(STACKED);
  m.addEventListener('change', cb);
  return () => m.removeEventListener('change', cb);
};

/**
 * The features: a short commit tree beside one feature at a time, pinned while you scroll through it.
 * One wheel notch or key press moves one commit; each feature's clip plays once and the walk moves on;
 * "skip" jumps past. Below 860px it is a plain list.
 */
export function Features() {
  const section = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const figures = useRef<(HTMLElement | null)[]>([]);
  const [cur, setCur] = useState(0);
  const curRef = useRef(0);
  const stacked = useSyncExternalStore(
    subscribeStacked,
    () => matchMedia(STACKED).matches,
    () => false,
  );

  const inside = useCallback(() => {
    const s = section.current!;
    return scrollY >= s.offsetTop - 8 && scrollY <= s.offsetTop + spanOf(s) + 8;
  }, []);
  const go = useCallback((k: number) => {
    const s = section.current!;
    scrollTo({ top: s.offsetTop + (spanOf(s) * (k + 0.5)) / N, behavior: scrollBehavior() });
  }, []);
  const advance = useCallback(
    (i: number) => {
      if (!motionAllowed() || matchMedia(STACKED).matches || document.hidden || !inside()) return;
      if (i === curRef.current && i + 1 < N) go(i + 1);
    },
    [go, inside],
  );

  // the step follows the scroll position
  useEffect(() => {
    const update = () => {
      if (matchMedia(STACKED).matches) return;
      const s = section.current!;
      const p = Math.min(0.999, Math.max(0, (scrollY - s.offsetTop) / Math.max(1, spanOf(s))));
      const i = Math.floor(p * N);
      curRef.current = i;
      setCur(i);
    };
    update();
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);
    return () => {
      removeEventListener('scroll', update);
      removeEventListener('resize', update);
    };
  }, []);

  // one wheel notch or key press, one feature; past the first or last, the page scrolls as usual
  useEffect(() => {
    let lock = 0,
      acc = 0;
    const step = (dir: number, e: Event) => {
      const next = curRef.current + dir;
      if (next < 0 || next >= N) return;
      e.preventDefault();
      const now = performance.now();
      if (now < lock) return;
      lock = now + STEP_LOCK;
      go(next);
    };
    const wheel = (e: WheelEvent) => {
      if (matchMedia(STACKED).matches || e.ctrlKey || !inside()) return;
      const dir = Math.sign(e.deltaY);
      if (!dir || curRef.current + dir < 0 || curRef.current + dir >= N) return;
      e.preventDefault();
      acc += Math.abs(e.deltaY);
      if (acc < 12) return;
      acc = 0;
      step(dir, e);
    };
    const key = (e: KeyboardEvent) => {
      if (
        matchMedia(STACKED).matches ||
        !inside() ||
        (e.target as Element).closest('input,textarea,select')
      )
        return;
      const dir = (
        { ArrowDown: 1, PageDown: 1, ' ': 1, ArrowUp: -1, PageUp: -1 } as Record<string, number>
      )[e.key];
      if (dir) step(dir, e);
    };
    addEventListener('wheel', wheel, { passive: false });
    addEventListener('keydown', key);
    return () => {
      removeEventListener('wheel', wheel);
      removeEventListener('keydown', key);
    };
  }, [go, inside]);

  // clips: each plays while its feature shows; a finished play moves the walk on
  useEffect(() => {
    const els = CLIPPED.map((i) => figures.current[i]!);
    return startClips(
      els,
      CLIPPED.map((i) => FEATURES[i].clip!),
      (k) => matchMedia(STACKED).matches || CLIPPED[k] === curRef.current,
      (k) => advance(CLIPPED[k]),
      motionAllowed(),
    );
  }, [advance]);

  // a feature without a clip stays for DWELL
  useEffect(() => {
    if (FEATURES[cur].clip) return;
    const t = setTimeout(() => advance(cur), DWELL);
    return () => clearTimeout(t);
  }, [cur, advance]);

  const skip = () => {
    const s = section.current!;
    const top = parseFloat(getComputedStyle(pin.current!).top) || 0;
    scrollTo({ top: s.offsetTop + s.offsetHeight - top, behavior: scrollBehavior() });
  };

  let commit = -1;
  const lit = Math.round(((cur + 1) / N) * WEEKS);

  return (
    <section
      className="features"
      id="features"
      aria-label="Features"
      ref={section}
      style={{ '--n': N } as React.CSSProperties}
    >
      <div className="pin" ref={pin}>
        <div className="pinin wrap">
          <div className="side">
            <ol className="tree" aria-label="Commits">
              {TREE.map((row, k) => {
                if (row.kind === 'fork')
                  return (
                    <li key={k} className="row x">
                      <span className="g">
                        <svg viewBox="0 0 44 34">
                          <path d="M12 0V34" stroke="#30363d" strokeWidth="2" fill="none" />
                          <path
                            d="M12 4C12 22 32 16 32 34"
                            stroke="#a371f7"
                            strokeWidth="2"
                            fill="none"
                          />
                        </svg>
                      </span>
                      <span />
                      <span className="msg">
                        branch <b>team-mode</b>
                      </span>
                    </li>
                  );
                if (row.kind === 'merge')
                  return (
                    <li key={k} className="row x">
                      <span className="g">
                        <svg viewBox="0 0 44 34">
                          <path d="M12 0V34" stroke="#30363d" strokeWidth="2" fill="none" />
                          <path
                            d="M32 0C32 14 12 12 12 17"
                            stroke="#a371f7"
                            strokeWidth="2"
                            fill="none"
                          />
                          <circle
                            cx="12"
                            cy="17"
                            r="5"
                            fill="#0d1117"
                            stroke="#30363d"
                            strokeWidth="2"
                          />
                        </svg>
                      </span>
                      <span className="hash">{row.hash}</span>
                      <span className="msg">
                        Merge branch &apos;<b>team-mode</b>&apos;
                      </span>
                    </li>
                  );
                const i = ++commit;
                const state = !stacked && i === cur ? ' on' : !stacked && i < cur ? ' done' : '';
                return (
                  <li
                    key={k}
                    className={`row c${row.team ? ' t' : ''}${state}`}
                    onClick={() => go(i)}
                  >
                    <span className="g">
                      <i />
                    </span>
                    <span className="hash">{row.hash}</span>
                    <span className="msg">
                      {row.msg}
                      {row.ref && <span style={{ opacity: 0.6 }}> ({row.ref})</span>}
                    </span>
                  </li>
                );
              })}
            </ol>
            <button className="skip" type="button" aria-label="Skip features" onClick={skip}>
              skip
            </button>
          </div>
          <div className="panel">
            {FEATURES.map((f, i) => (
              <article
                key={i}
                className={`feat${f.team ? ' t' : ''}${stacked || i === cur ? ' on' : ''}`}
              >
                <h2>
                  {f.title} <em>{f.accent}</em>
                </h2>
                {f.body && <p>{f.body}</p>}
                {f.clip && (
                  <figure
                    className="clip"
                    style={
                      {
                        aspectRatio: CLIP_ASPECT,
                        '--ar': CLIP_ASPECT.toFixed(3),
                      } as React.CSSProperties
                    }
                    ref={(el) => {
                      figures.current[i] = el;
                    }}
                  />
                )}
                {f.extra === 'checks' && (
                  <ul className="checks">
                    {CHECKS.map(([strong, rest]) => (
                      <li key={strong}>
                        <span>
                          <b>{strong}</b> {rest}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                {f.extra === 'install' && (
                  <div className="install">
                    <Command text={INSTALL} />
                    <Command text="wisdom connect" />
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
        <div
          className="heat"
          aria-hidden="true"
          style={{ gridTemplateColumns: `repeat(${WEEKS},minmax(0,1fr))` }}
        >
          {HEAT.map((l, k) => (
            <i key={k} data-l={l} className={Math.floor(k / 3) < lit ? 'lit' : undefined} />
          ))}
        </div>
      </div>
    </section>
  );
}
