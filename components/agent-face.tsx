import type { CSSProperties } from 'react';
import { agents } from '@/lib/demo';
export default function AgentFace({ id = 0, large = false }: { id?: number; large?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`face ${large ? 'large' : ''}`}
      style={{ '--tone': agents[id].tone, '--contour': `${id * 17 - 25}deg` } as CSSProperties}
    >
      <span className="face-eyes">
        <i />
        <i />
      </span>
    </span>
  );
}
