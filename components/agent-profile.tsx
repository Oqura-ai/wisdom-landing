import { type Agent, type CapturedStep } from '@/lib/demo';
import { getProfileTiles } from '@/lib/agent-profile';

interface AgentProfileProps {
  agent: Agent;
  availableSteps: CapturedStep[];
}

export default function AgentProfile({ agent, availableSteps }: AgentProfileProps) {
  const [designation, personality] = getProfileTiles(agent, availableSteps, 'peer');
  return (
    <section className="agent-properties" aria-label="Agent properties">
      <div className="property-block personality-block">
        <h3>Personality &amp; traits</h3>
        <div className="property-tags">
          <span>{personality.value}</span>
          <span>{designation.value}</span>
          <span>Skills</span>
        </div>
      </div>
      <div className="property-block access-block">
        <h3>Access rules</h3>
        <div className="property-tags">
          <span className="shared-property">Shareable</span>
          <span className="private-property">Confidential</span>
        </div>
      </div>
    </section>
  );
}
