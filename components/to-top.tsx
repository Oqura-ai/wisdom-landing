'use client';

import { useEffect, useState } from 'react';
import { scrollBehavior } from '@/lib/motion';

/** A round button, bottom right, once the first screen is behind you. */
export function ToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const check = () => setShow(scrollY > innerHeight * 0.8);
    check();
    addEventListener('scroll', check, { passive: true });
    return () => removeEventListener('scroll', check);
  }, []);
  return (
    <button
      className={show ? 'totop show' : 'totop'}
      type="button"
      aria-label="Back to top"
      onClick={() => scrollTo({ top: 0, behavior: scrollBehavior() })}
    >
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M8 13V3M3.5 7.5L8 3l4.5 4.5" />
      </svg>
    </button>
  );
}
