'use client';
import { useEffect, useRef, useState } from 'react';

// What the film shows, scene by scene, for screen readers.
const scenes = [
  'Your agent just shipped: 23 files changed in 4 minutes.',
  'Why? The chat is closed, and the diff only shows what.',
  'Wisdom keeps the record: what was asked, tried and changed, as it happened.',
  'Ask your agent. Its skill glances at the session, then opens only the turn it needs.',
  'Pass the work on: wisdom handoff codex. The next agent starts knowing what happened.',
  'Or clone it: the same agent, the whole history. The original is never touched.',
  'Share it with a teammate: one file, checked for secrets first, read-only on their side.',
  'Yours: on your machine. Nothing summarized. Nothing sent.',
  'Keep the work. Keep the why. npm install -g @oqura/wisdom',
];

/** The launch film as the hero: muted and looping. It plays only while on screen, never for
 * people who ask for less motion, and stays paused once someone pauses it.
 */
export default function Hero() {
  const video = useRef<HTMLVideoElement>(null);
  const pausedByHand = useRef(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    // React does not always set `muted` before the first play, and browsers autoplay only muted video.
    element.muted = true;
    const calm = matchMedia('(prefers-reduced-motion: reduce)');
    if (calm.matches) pausedByHand.current = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) element.pause();
        else if (!pausedByHand.current) element.play().catch(() => {});
      },
      { threshold: 0.25 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  function toggle() {
    const element = video.current;
    if (!element) return;
    pausedByHand.current = !element.paused;
    if (element.paused) element.play().catch(() => {});
    else element.pause();
  }

  return (
    <section className="film-hero" aria-label="Wisdom in 52 seconds">
      <video
        ref={video}
        className="film-video"
        src="/film/wisdom-film.mp4"
        poster="/film/wisdom-film-poster.jpg"
        muted
        loop
        playsInline
        preload="metadata"
        aria-describedby="film-scenes"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <button
        type="button"
        className="film-toggle"
        onClick={toggle}
        aria-label={playing ? 'Pause film' : 'Play film'}
      >
        {playing ? (
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M4 3h3v10H4zM9 3h3v10H9z" />
          </svg>
        ) : (
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M5 3l8 5-8 5z" />
          </svg>
        )}
      </button>
      <ol id="film-scenes" className="film-scenes">
        {scenes.map((scene) => (
          <li key={scene}>{scene}</li>
        ))}
      </ol>
    </section>
  );
}
