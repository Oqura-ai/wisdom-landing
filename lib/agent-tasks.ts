import { type Agent, type CapturedStep } from './demo';

const TASK_TITLES = [
  'Define the scope',
  'Shape the interfaces',
  'Build the shared work',
  'Connect the pieces',
  'Verify the result',
];

/** Each demo run is one task. Derive its source from captured causal references,
 * rather than inventing assignments or exposing future timeline events. */
export function getAgentTasks(agent: Agent, availableSteps: CapturedStep[]) {
  const steps = availableSteps.filter((step) => step.agentId === agent.id);
  if (!steps.length) return [];
  const source = availableSteps.find((step) => step.id === steps[0].parentId);
  return [
    {
      id: steps[0].id,
      title: TASK_TITLES[agent.team],
      requesterId: source?.agentId ?? null,
      complete: steps.some((step) => step.title === 'Done'),
      steps: steps.slice(-10),
    },
  ];
}
