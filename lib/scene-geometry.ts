import { agents, AGENTS_PER_TEAM, DEMO_DURATION_SECONDS, type Agent } from './demo';

export interface Point {
  x: number;
  y: number;
}
export interface ConnectionSegment {
  start: Point;
  end: Point;
}

export const SCENE_DIMENSIONS = {
  desktop: { width: 1000, height: 504 },
  mobile: { width: 360, height: 848 },
};
const TEAM_CENTERS = {
  desktop: [
    [498, 236],
    [196, 113],
    [784, 142],
    [265, 390],
    [772, 390],
  ],
  mobile: [
    [174, 96],
    [100, 264],
    [250, 422],
    [105, 580],
    [246, 744],
  ],
};
const MEMBER_OFFSETS = [
  [0.04, -0.04],
  [-0.95, -0.65],
  [0.62, -0.93],
  [1, 0.55],
  [-0.64, 1],
];
const CROSS_TEAM_RELATIONS: [number, number][] = [
  [0, 5],
  [0, 10],
  [5, 15],
  [10, 20],
  [15, 20],
  [5, 10],
];
const LOCAL_RELATIONS: [number, number][] = agents
  .filter((agent) => agent.slot > 0)
  .map((agent) => [agent.team * AGENTS_PER_TEAM, agent.id]);
export const agentRelations = [...LOCAL_RELATIONS, ...CROSS_TEAM_RELATIONS];

export function getAgentPosition(agent: Agent, mobile = false): Point {
  const centers = mobile ? TEAM_CENTERS.mobile : TEAM_CENTERS.desktop;
  const teamRadius = mobile ? 50 : 64;
  const [centerX, centerY] = centers[agent.team];
  const [offsetX, offsetY] = MEMBER_OFFSETS[agent.slot];
  return { x: centerX + offsetX * teamRadius, y: centerY + offsetY * teamRadius };
}

export function getAgentRadius(agent: Agent, timeSeconds: number, mobile = false): number {
  const baseRadius = agent.slot === 0 ? 25 + (agent.team % 3) * 0.3 : 16 + (agent.id % 4);
  const ageSeconds = Math.max(0, timeSeconds - agent.born);
  const ageScale = 1 + (0.22 * ageSeconds) / DEMO_DURATION_SECONDS;
  return baseRadius * ageScale * (mobile ? 0.8 : 1);
}

/** Leave a small gap at both circles, including as they grow with age. */
export function getConnectionSegment(
  from: Agent,
  to: Agent,
  timeSeconds: number,
  mobile = false,
): ConnectionSegment {
  const startCenter = getAgentPosition(from, mobile);
  const endCenter = getAgentPosition(to, mobile);
  const dx = endCenter.x - startCenter.x;
  const dy = endCenter.y - startCenter.y;
  const distance = Math.max(1, Math.hypot(dx, dy));
  const startPadding = getAgentRadius(from, timeSeconds, mobile) + 5;
  const endPadding = getAgentRadius(to, timeSeconds, mobile) + 5;
  return {
    start: {
      x: startCenter.x + (dx / distance) * startPadding,
      y: startCenter.y + (dy / distance) * startPadding,
    },
    end: {
      x: endCenter.x - (dx / distance) * endPadding,
      y: endCenter.y - (dy / distance) * endPadding,
    },
  };
}

export function getTransmissionPoint(
  segment: ConnectionSegment,
  timeSeconds: number,
  relationIndex: number,
): Point {
  const progress = (timeSeconds * 0.45 + relationIndex * 0.31) % 1;
  return {
    x: segment.start.x + (segment.end.x - segment.start.x) * progress,
    y: segment.start.y + (segment.end.y - segment.start.y) * progress,
  };
}
