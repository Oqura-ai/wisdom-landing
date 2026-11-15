'use client';

import { useEffect, useRef } from 'react';
import { motionAllowed } from '@/lib/motion';

/** The "o" of the footer wordmark: a bot whose eyes follow the pointer and blink now and then. */
export function FooterBot() {
  const bot = useRef<SVGSVGElement>(null);
  const eyes = useRef<SVGGElement>(null);

  useEffect(() => {
    const b = bot.current!,
      g = eyes.current!;
    let x = innerWidth / 2,
      y = 0,
      raf = 0,
      look = '';
    const aim = () => {
      raf = 0;
      const r = b.getBoundingClientRect(),
        dx = x - (r.left + r.width / 2),
        dy = y - (r.top + r.height / 2),
        d = Math.hypot(dx, dy) || 1,
        reach = Math.min(1, d / 320) * 11;
      look = `translate(${((dx / d) * reach).toFixed(2)} ${((dy / d) * reach * 0.8).toFixed(2)})`;
      g.setAttribute('transform', look);
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(aim);
    };
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      queue();
    };
    addEventListener('pointermove', move, { passive: true });
    addEventListener('scroll', queue, { passive: true });
    const blink = motionAllowed()
      ? setInterval(() => {
          g.setAttribute('transform', `${look} scale(1 .12)`);
          setTimeout(() => g.setAttribute('transform', look), 130);
        }, 4200)
      : 0;
    return () => {
      removeEventListener('pointermove', move);
      removeEventListener('scroll', queue);
      cancelAnimationFrame(raf);
      clearInterval(blink);
    };
  }, []);

  return (
    <svg className="bot" ref={bot} viewBox="-50 -50 100 100" aria-hidden="true">
      <defs>
        <radialGradient id="botFace" cx=".34" cy=".3" r=".85">
          <stop offset="0" stopColor="#30363d" />
          <stop offset=".6" stopColor="#1c2128" />
          <stop offset="1" stopColor="#11161d" />
        </radialGradient>
      </defs>
      <circle r="47" fill="url(#botFace)" stroke="#238636" strokeWidth="3" />
      <ellipse
        cx="-16"
        cy="-24"
        rx="18"
        ry="9"
        transform="rotate(-28 -16 -24)"
        fill="#fff"
        opacity=".07"
      />
      <g className="eyes" ref={eyes}>
        <rect x="-17" y="-11" width="8" height="22" rx="4" fill="#39d353" />
        <rect x="9" y="-11" width="8" height="22" rx="4" fill="#39d353" />
      </g>
    </svg>
  );
}
