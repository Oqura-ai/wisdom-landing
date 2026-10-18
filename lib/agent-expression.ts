import { getRunStartTime, type Agent } from './demo';

export const eyeShapes = {
  curious: 'M -5 -4 v 7 M 5 -2 v 5',
  focused: 'M -6 -1 l 2 1 M 4 0 l 2 -1',
  wondering: 'M -7 -2 l 4 -1 M 5 -3 v 6',
  sharing: 'M -5 -2 v 5 M 5 -2 v 5',
  happy: 'M -8 1 Q -5 -5 -2 1 M 2 1 Q 5 -5 8 1',
  relaxed: 'M -5 -1 v 3 M 5 -1 v 3',
};
export type AgentExpression = keyof typeof eyeShapes;
const RESTING_EXPRESSIONS: AgentExpression[] = ['relaxed', 'curious', 'happy', 'relaxed'];

export function getAgentExpression(agent: Agent, timeSeconds: number): AgentExpression {
  const runAge = timeSeconds - getRunStartTime(agent);
  if (runAge < 0.4) return 'curious';
  if (runAge < 0.8) return 'focused';
  if (runAge < 1.2) return 'sharing';
  if (runAge < 2) return 'focused';
  if (runAge < 2.8) return 'wondering';
  if (runAge < 3.6) return 'happy';
  return RESTING_EXPRESSIONS[agent.id % RESTING_EXPRESSIONS.length];
}
