'use client';

import { useEffect, useRef } from 'react';
import { WORD_WIDTH, YEARS } from '@/lib/board';
import { isPhone } from '@/lib/motion';

/**
 * The contribution board behind the hero: a tilted 3D floor on desktop, the word alone and flat on phones.
 * Its scale (--k) follows the smaller of width and height; it dims as soon as the page scrolls and is gone
 * past the hero. Cells light on hover (CSS) and stay lit on click.
 */
export function Board() {
  const floor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = floor.current!;
    const root = document.documentElement;
    const fit = () => {
      const k = isPhone()
        ? (innerWidth - 24) / WORD_WIDTH
        : Math.max(0.3, 0.76 * Math.min(innerWidth / 1440, innerHeight / 800));
      root.style.setProperty('--k', k.toFixed(3));
    };
    const quiet = () => {
      if (isPhone()) return el.classList.remove('quiet', 'gone');
      el.classList.toggle('quiet', scrollY > 4);
      el.classList.toggle('gone', scrollY > innerHeight * 0.55);
    };
    const pick = (e: MouseEvent) => {
      if (isPhone()) return;
      (e.target as Element).closest('.bcells i')?.classList.toggle('sel');
    };
    fit();
    quiet();
    addEventListener('resize', fit);
    addEventListener('scroll', quiet, { passive: true });
    el.addEventListener('click', pick);
    return () => {
      removeEventListener('resize', fit);
      removeEventListener('scroll', quiet);
      el.removeEventListener('click', pick);
    };
  }, []);

  return (
    <div className="floor" aria-hidden="true" ref={floor}>
      <div className="board">
        {YEARS.map((y, n) => (
          <section key={n} className={y.now ? 'byear now' : 'byear'}>
            <div className="bcells">
              {y.cells.map((c, k) => (
                <i key={k} data-l={c.level || undefined} data-w={c.word ? '' : undefined} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
