'use client';
import { useEffect } from 'react';

/** Observe static, server-rendered sections; no React rerenders are needed to reveal them. */
export default function StoryMotion() {
  useEffect(() => {
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const sections = document.querySelectorAll<HTMLElement>('[data-reveal]');
    if (reducedMotion.matches || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2 },
    );

    sections.forEach((section) => {
      section.classList.add('motion-ready');
      observer.observe(section);
    });

    function handleMotionPreferenceChange() {
      if (!reducedMotion.matches) return;
      observer.disconnect();
      sections.forEach((section) => section.classList.remove('motion-ready'));
    }

    reducedMotion.addEventListener('change', handleMotionPreferenceChange);
    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener('change', handleMotionPreferenceChange);
      sections.forEach((section) => section.classList.remove('motion-ready'));
    };
  }, []);

  return null;
}
