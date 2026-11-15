import { useSyncExternalStore } from 'react';

/** Phones get a static page: no animation, no board interaction. */
export const PHONE = '(max-width:700px)';
/** Features stack as a plain list below this width. */
export const STACKED = '(max-width:860px)';
const REDUCED = '(prefers-reduced-motion: reduce)';

export const isPhone = () => matchMedia(PHONE).matches;
/** Whether anything on the page may move on its own. */
export const motionAllowed = () => !isPhone() && !matchMedia(REDUCED).matches;
export const scrollBehavior = (): ScrollBehavior => (motionAllowed() ? 'smooth' : 'auto');

function subscribe(onChange: () => void) {
  const lists = [matchMedia(PHONE), matchMedia(REDUCED)];
  lists.forEach((l) => l.addEventListener('change', onChange));
  return () => lists.forEach((l) => l.removeEventListener('change', onChange));
}

/** motionAllowed() as React state; the server assumes a desktop that may move. */
export function useMotionAllowed() {
  return useSyncExternalStore(subscribe, motionAllowed, () => true);
}
