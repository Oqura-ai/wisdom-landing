'use client';
import { useEffect, useRef } from 'react';
import AgentFace from './agent-face';

/** Typography uses the same bot asset as the hero; gaze never triggers a React render. */
export default function Wordmark() {
  const rootRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const faces = Array.from(root.querySelectorAll<HTMLElement>('.face'));
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    let frame = 0;
    let cursor: { x: number; y: number } | null = null;

    function reset() {
      cancelAnimationFrame(frame);
      frame = 0;
      cursor = null;
      faces.forEach((face) =>
        face.querySelector<HTMLElement>('.face-eyes')?.style.removeProperty('transform'),
      );
    }
    function paint() {
      frame = 0;
      if (!cursor) return;
      faces.forEach((face) => {
        const bounds = face.getBoundingClientRect();
        const dx = cursor!.x - bounds.left - bounds.width / 2;
        const dy = cursor!.y - bounds.top - bounds.height / 2;
        const distance = Math.max(1, Math.hypot(dx, dy));
        const offset = Math.min(bounds.width * 0.1, distance / 45);
        const eyes = face.querySelector<HTMLElement>('.face-eyes');
        if (eyes)
          eyes.style.transform = `translate(${(dx / distance) * offset}px, ${(dy / distance) * offset}px)`;
      });
    }
    function follow(event: PointerEvent) {
      if (!visible || document.hidden || motion.matches || event.pointerType === 'touch') return;
      cursor = { x: event.clientX, y: event.clientY };
      if (!frame) frame = requestAnimationFrame(paint);
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) reset();
    });
    observer.observe(root);
    window.addEventListener('pointermove', follow, { passive: true });
    document.documentElement.addEventListener('pointerleave', reset);
    document.addEventListener('visibilitychange', reset);
    motion.addEventListener('change', reset);
    return () => {
      reset();
      observer.disconnect();
      window.removeEventListener('pointermove', follow);
      document.documentElement.removeEventListener('pointerleave', reset);
      document.removeEventListener('visibilitychange', reset);
      motion.removeEventListener('change', reset);
    };
  }, []);

  return (
    <span className="brand-word" ref={rootRef}>
      <span className="sr-only">wisdom</span>
      <span aria-hidden="true">
        wisd
        <span className="wordmark-bot">
          <AgentFace />
        </span>
        m
      </span>
    </span>
  );
}
