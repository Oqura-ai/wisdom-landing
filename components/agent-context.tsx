import { getAgentName, type Agent, type CapturedStep } from '@/lib/demo';
import AgentFace from './agent-face';
import AgentProfile from './agent-profile';
import CapturedLedger from './captured-ledger';

interface AgentContextProps {
  agent: Agent;
  availableSteps: CapturedStep[];
  peers: Agent[];
}

/** Shared, non-interactive diagram for the hero popup and feature sections. */
export default function AgentContext({ agent, availableSteps, peers }: AgentContextProps) {
  return (
    <div className="agent-context-diagram">
      <div className="agent-owned-panel">
        <AgentProfile agent={agent} availableSteps={availableSteps} />
        <CapturedLedger agent={agent} availableSteps={availableSteps} />
      </div>
      <div className="sharing-bridge" aria-label="Context shared according to access rules">
        <span>Shared</span>
      </div>
      <aside className="participant-rail" aria-label="Other agents and higher-order harness">
        <div className="peer-faces">
          {peers.map((peer) => (
            <span key={peer.id} role="img" aria-label={getAgentName(peer.id)}>
              <AgentFace id={peer.id} />
            </span>
          ))}
        </div>
        <span className="rail-continuation" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="harness-mark" role="img" aria-label="Orchestrator harness or developer">
          H
        </span>
      </aside>
    </div>
  );
}
