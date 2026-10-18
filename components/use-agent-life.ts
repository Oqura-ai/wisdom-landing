'use client';
import { useEffect, type RefObject } from 'react';
import { agents } from '@/lib/demo';
import { getAgentPosition, type Point } from '@/lib/scene-geometry';

const MAX_GAZE_OFFSET = 2.6;
const GAZE_DISTANCE_SCALE = 18;

/** This hook owns only eye transforms and animation activity, never React layout state. */
export function useAgentLife(
  svgRef: RefObject<SVGSVGElement | null>,
  mobile: boolean,
  isSuspended: boolean,
) {
  useEffect(() => {
    const mountedSvg = svgRef.current;
    if (!mountedSvg) return;
    const svg: SVGSVGElement = mountedSvg;
    let isVisible = false;
    let pendingFrame = 0;
    let pointerPosition: Point | null = null;

    function updateActivity() {
      svg.dataset.awake = String(isVisible && !document.hidden && !isSuspended);
    }

    function resetGaze() {
      pointerPosition = null;
      cancelAnimationFrame(pendingFrame);
      pendingFrame = 0;
      svg
        .querySelectorAll<SVGGElement>('[data-gaze]')
        .forEach((eyes) => eyes.removeAttribute('transform'));
    }

    function paintGaze() {
      pendingFrame = 0;
      if (!pointerPosition || isSuspended) return;
      const screenTransform = svg.getScreenCTM();
      if (!screenTransform) return;

      // Convert browser pixels to scene coordinates so gaze works at every viewport size.
      const cursor = new DOMPoint(pointerPosition.x, pointerPosition.y).matrixTransform(
        screenTransform.inverse(),
      );
      svg.querySelectorAll<SVGGElement>('[data-gaze]').forEach((eyes) => {
        const agent = agents[Number(eyes.dataset.gaze)];
        const center = getAgentPosition(agent, mobile);
        const deltaX = cursor.x - center.x;
        const deltaY = cursor.y - center.y;
        const distance = Math.hypot(deltaX, deltaY);
        const attentionRadius = mobile ? 100 : 175;
        if (distance > attentionRadius) {
          eyes.removeAttribute('transform');
          return;
        }
        const offset = Math.min(MAX_GAZE_OFFSET, distance / GAZE_DISTANCE_SCALE);
        const safeDistance = Math.max(1, distance);
        const x = ((deltaX / safeDistance) * offset).toFixed(2);
        const y = ((deltaY / safeDistance) * offset).toFixed(2);
        eyes.setAttribute('transform', `translate(${x} ${y})`);
      });
    }

    function handlePointerMove(event: PointerEvent) {
      if (event.pointerType === 'touch' || isSuspended) return;
      pointerPosition = { x: event.clientX, y: event.clientY };
      // Coalesce pointer events; idle gaze does not run a continuous render loop.
      if (!pendingFrame) pendingFrame = requestAnimationFrame(paintGaze);
    }

    function handleVisibilityChange() {
      updateActivity();
      if (document.hidden) resetGaze();
    }

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      updateActivity();
      if (!isVisible) resetGaze();
    });
    observer.observe(svg);
    svg.addEventListener('pointermove', handlePointerMove);
    svg.addEventListener('pointerleave', resetGaze);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    updateActivity();

    return () => {
      resetGaze();
      observer.disconnect();
      svg.removeEventListener('pointermove', handlePointerMove);
      svg.removeEventListener('pointerleave', resetGaze);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [svgRef, mobile, isSuspended]);
}
