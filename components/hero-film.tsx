'use client';

import { useEffect, useRef, useState } from 'react';
import { WALKTHROUGH } from '@/lib/content';
import { FILM_DURATION } from '@/lib/film';
import { useMotionAllowed } from '@/lib/motion';

const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

/**
 * The walkthrough: the film as an MP4, muted and looping, under a plain video bar (play, a draggable
 * progress line, time, full screen). Plays only while on screen and stays paused once the visitor pauses
 * it. Phones and reduced motion get the poster and native controls instead of autoplay.
 */
export function HeroFilm() {
  const video = useRef<HTMLVideoElement>(null);
  const bar = useRef<HTMLInputElement>(null);
  const time = useRef<HTMLSpanElement>(null);
  const userPaused = useRef(false);
  const [playing, setPlaying] = useState(false);
  const moving = useMotionAllowed();

  useEffect(() => {
    const v = video.current!;
    if (!moving) return;
    let raf = 0;
    // progress is painted straight onto the bar, not through React state, so playback never re-renders
    const paint = () => {
      const d = v.duration || FILM_DURATION,
        b = bar.current;
      if (b) {
        b.value = String(v.currentTime);
        b.style.setProperty('--p', `${(v.currentTime / d) * 100}%`);
      }
      if (time.current) time.current.textContent = `${clock(v.currentTime)} / ${clock(d)}`;
      if (!v.paused) raf = requestAnimationFrame(paint);
    };
    const sync = () => {
      setPlaying(!v.paused);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(paint);
    };
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !userPaused.current) v.play().catch(() => {});
        else if (!e.isIntersecting) v.pause();
      },
      { threshold: 0.1 },
    );
    io.observe(v);
    const events = ['play', 'pause', 'seeked', 'loadedmetadata'];
    for (const ev of events) v.addEventListener(ev, sync);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      for (const ev of events) v.removeEventListener(ev, sync);
    };
  }, [moving]);

  const toggle = () => {
    const v = video.current!;
    if (v.paused) {
      userPaused.current = false;
      v.play().catch(() => {});
    } else {
      userPaused.current = true;
      v.pause();
    }
  };
  const seek = (e: React.FormEvent<HTMLInputElement>) => {
    const v = video.current!,
      t = Number(e.currentTarget.value);
    v.currentTime = t;
    e.currentTarget.style.setProperty('--p', `${(t / (v.duration || FILM_DURATION)) * 100}%`);
  };
  const fullScreen = () => {
    const v = video.current! as HTMLVideoElement & { webkitEnterFullscreen?: () => void };
    if (v.requestFullscreen) v.requestFullscreen().catch(() => {});
    else v.webkitEnterFullscreen?.();
  };

  return (
    <div className="stage">
      <div className="film">
        <video
          ref={video}
          src={WALKTHROUGH.src}
          poster={WALKTHROUGH.poster}
          muted
          loop
          playsInline
          preload={moving ? 'auto' : 'metadata'}
          controls={!moving}
          aria-label="Walkthrough of Wisdom: recording, reading, the dashboard and team mode"
        />
      </div>
      {moving && (
        <div className="scrub">
          <button
            className="play"
            type="button"
            onClick={toggle}
            aria-label={playing ? 'Pause walkthrough' : 'Play walkthrough'}
          >
            {playing ? (
              <svg viewBox="0 0 12 12">
                <rect x="1.5" y="1" width="3" height="10" rx="1" />
                <rect x="7.5" y="1" width="3" height="10" rx="1" />
              </svg>
            ) : (
              <svg viewBox="0 0 12 12">
                <path d="M2.5 1.2v9.6L10.5 6Z" />
              </svg>
            )}
          </button>
          <input
            ref={bar}
            className="bar"
            type="range"
            min={0}
            max={FILM_DURATION}
            step={0.01}
            defaultValue={0}
            onInput={seek}
            aria-label="Seek"
          />
          <span className="time" ref={time}>
            {`0:00 / ${clock(FILM_DURATION)}`}
          </span>
          <button className="fs" type="button" onClick={fullScreen} aria-label="Full screen">
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
