/** Presentation fixtures only. These are not a proposed backend data contract. */
export const DEMO_DURATION_SECONDS = 24;
export const AGENTS_PER_TEAM = 5;
export const RUN_STEP_SECONDS = 0.4;
export const RUN_COMPLETION_SECONDS = 3.2;
export const CHANGE_STAGE_INDEX = 5;
export const VERIFICATION_STAGE_INDEX = 7;

export interface Agent {
  id: number;
  team: number;
  slot: number;
  born: number;
  tone: string;
}

export interface CapturedStep {
  id: string;
  agentId: number;
  stageIndex: number;
  title: string;
  timestampSeconds: number;
  hasCodeChange: boolean;
  parentId: string | null;
  sourceId: string | null;
}

export const tones = ['#c6d9e8', '#cfdfd1', '#e8d2c5', '#d9d1e8', '#e7dfc2'];
export const streams = ['Scope', 'Interfaces', 'Implementation', 'Integration', 'Verification'];
const TEAM_BIRTH_TIMES = [0, 4.8, 6.3, 9.3, 10.8];
const TEAM_RUN_START_TIMES = [0, 6.5, 10.5, 14.5, 18.5];
const TEAM_COLOR_MIXES = [
  [0, 1, 0, 3, 4],
  [1, 4, 1, 0, 2],
  [3, 0, 2, 3, 1],
  [2, 1, 4, 2, 0],
  [4, 3, 1, 0, 4],
];

export const agents: Agent[] = Array.from({ length: streams.length * AGENTS_PER_TEAM }, (_, id) => {
  const team = Math.floor(id / AGENTS_PER_TEAM);
  const slot = id % AGENTS_PER_TEAM;
  const birthSpacing = team === 0 ? 0.72 : 0.42;
  return {
    id,
    team,
    slot,
    born: TEAM_BIRTH_TIMES[team] + slot * birthSpacing,
    tone: tones[TEAM_COLOR_MIXES[team][slot]],
  };
});

export function getAgentName(agentId: number): string {
  return `A${String(agentId + 1).padStart(2, '0')}`;
}

export function getRunStartTime(agent: Agent): number {
  return agent.team === 0 ? agent.born : TEAM_RUN_START_TIMES[agent.team] + agent.slot * 0.12;
}

const RUN_STAGE_TITLES = [
  'Start',
  'Plan',
  'Request',
  'Response',
  'Action',
  'Change',
  'Check',
  'Result',
  'Done',
];

function createAgentSteps(agent: Agent): CapturedStep[] {
  const previousTeamLeadId = (agent.team - 1) * AGENTS_PER_TEAM;
  const priorTeamCompletion = agent.team > 0 ? `${previousTeamLeadId}-8` : null;

  return RUN_STAGE_TITLES.map((title, stageIndex) => ({
    id: `${agent.id}-${stageIndex}`,
    agentId: agent.id,
    stageIndex,
    title,
    timestampSeconds: getRunStartTime(agent) + stageIndex * RUN_STEP_SECONDS,
    hasCodeChange: stageIndex === CHANGE_STAGE_INDEX,
    parentId: stageIndex > 0 ? `${agent.id}-${stageIndex - 1}` : priorTeamCompletion,
    sourceId: stageIndex === 3 ? priorTeamCompletion : null,
  }));
}

export const capturedSteps: CapturedStep[] = agents
  .flatMap(createAgentSteps)
  .sort((first, second) => first.timestampSeconds - second.timestampSeconds);

export function getVisibleAgents(timeSeconds: number): Agent[] {
  return agents.filter((agent) => agent.born <= timeSeconds);
}

export function getCapturedSteps(timeSeconds: number): CapturedStep[] {
  return capturedSteps.filter((step) => step.timestampSeconds <= timeSeconds);
}

export function filterCapturedSteps(
  steps: CapturedStep[],
  agentId: number | null,
  query: string,
): CapturedStep[] {
  const search = query.toLowerCase();
  return steps.filter((step) => {
    const matchesAgent = agentId === null || step.agentId === agentId;
    const searchableText = `${getAgentName(step.agentId)} ${step.title} ${streams[agents[step.agentId].team]}`;
    return matchesAgent && searchableText.toLowerCase().includes(search);
  });
}

export function getRelatedSteps(
  step: CapturedStep,
  availableSteps: CapturedStep[],
): CapturedStep[] {
  const relatedIds = new Set([step.parentId, step.sourceId]);
  return availableSteps.filter((candidate) => relatedIds.has(candidate.id));
}
