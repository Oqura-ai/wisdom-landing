import { streams, VERIFICATION_STAGE_INDEX, type Agent, type CapturedStep } from './demo';

export type AccessView = 'peer' | 'developer';
export interface ProfileTile {
  label: string;
  value: string;
  description: string;
}
const DESIGNATIONS = ['Coordinator', 'Builder', 'Reviewer', 'Integrator', 'Verifier'];
const PERSONALITIES = ['Measured', 'Curious', 'Precise', 'Collaborative', 'Methodical'];

/** UI-only visibility preview; real access control belongs on a future server. */
export function getProfileTiles(
  agent: Agent,
  availableSteps: CapturedStep[],
  accessView: AccessView,
): ProfileTile[] {
  const hasVerification = availableSteps.some(
    (step) => step.agentId === agent.id && step.stageIndex === VERIFICATION_STAGE_INDEX,
  );
  const isDeveloper = accessView === 'developer';

  return [
    {
      label: 'Designation',
      value: DESIGNATIONS[agent.slot],
      description: `${streams[agent.team]} / ${agent.slot === 0 ? 'Local team lead' : 'Team contributor'}`,
    },
    {
      label: 'Personality',
      value: PERSONALITIES[agent.slot],
      description: 'Evidence first. Surface uncertainty.',
    },
    { label: 'Skills', value: '4 capabilities', description: 'Inspect · Query · Change · Check' },
    {
      label: 'Boundaries',
      value: 'Defined',
      description: 'Workspace scope. Stop at the task boundary.',
    },
    {
      label: 'Shareable',
      value: hasVerification ? 'Verified result' : 'Awaiting evidence',
      description: 'Learnings stay connected to the captured work.',
    },
    {
      label: 'Confidential',
      value: isDeveloper ? 'Private' : 'Restricted',
      description: isDeveloper
        ? 'Example private note: prefer smaller review steps.'
        : 'Available only in the developer view.',
    },
  ];
}
