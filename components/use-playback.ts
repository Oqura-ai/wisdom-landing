'use client';
import { useEffect, useReducer, useRef, type RefObject } from 'react';
import { initialPlaybackState, playbackReducer, PLAYBACK_FRAME_INTERVAL_MS } from '@/lib/playback';

export function usePlayback(hostRef: RefObject<HTMLElement | null>) {
  const [state, dispatch] = useReducer(playbackReducer, initialPlaybackState);
  const autoplayHandled = useRef(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || document.hidden || autoplayHandled.current) return;
      autoplayHandled.current = true;
      if (!motion.matches) dispatch({ type: 'toggle' });
      observer.disconnect();
    });
    observer.observe(host);
    function handleMotionChange() {
      if (motion.matches) {
        autoplayHandled.current = true;
        dispatch({ type: 'pause' });
      }
    }
    motion.addEventListener('change', handleMotionChange);
    return () => {
      observer.disconnect();
      motion.removeEventListener('change', handleMotionChange);
    };
  }, [hostRef]);

  // A deliberate user action always takes precedence over pending autoplay.
  function takeControl() {
    autoplayHandled.current = true;
  }

  useEffect(() => {
    if (!state.isPlaying) return;
    let frameId = 0;
    let lastPaintTime = performance.now();

    function tick(now: number) {
      // The hero updates at most 20 times/second, independent of monitor refresh rate.
      if (now - lastPaintTime >= PLAYBACK_FRAME_INTERVAL_MS) {
        dispatch({ type: 'tick', deltaSeconds: (now - lastPaintTime) / 1000 });
        lastPaintTime = now;
      }
      frameId = requestAnimationFrame(tick);
    }

    function handleVisibilityChange() {
      if (document.hidden) dispatch({ type: 'pause' });
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) dispatch({ type: 'pause' });
    });
    if (hostRef.current) observer.observe(hostRef.current);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [hostRef, state.isPlaying]);

  function togglePlayback() {
    takeControl();
    const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    dispatch({ type: prefersReducedMotion ? 'advance' : 'toggle' });
  }

  return {
    ...state,
    togglePlayback,
    pause: () => {
      takeControl();
      dispatch({ type: 'pause' });
    },
    restart: () => {
      takeControl();
      dispatch({ type: 'restart' });
    },
    seek: (timeSeconds: number) => {
      takeControl();
      dispatch({ type: 'seek', timeSeconds });
    },
  };
}
