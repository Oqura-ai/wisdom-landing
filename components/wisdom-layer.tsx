import { agents, getAgentName, streams, type CapturedStep } from '@/lib/demo';

interface WisdomLayerProps {
  capturedSteps: CapturedStep[];
  agentCount: number;
  onSelectAgent?: (agentId: number) => void;
}

export default function WisdomLayer({
  capturedSteps,
  agentCount,
  onSelectAgent,
}: WisdomLayerProps) {
  const contributors = new Set(
    capturedSteps.filter((step) => step.hasCodeChange).map((step) => step.agentId),
  );

  return (
    <div className="wisdom-layer">
      <div className="layer-heading">
        <div>
          <h2>Wisdom layer</h2>
          <p>Shared work. Captured as it happens.</p>
        </div>
      </div>
      <div className="contribution-grid">
        {streams.map((stream, teamIndex) => (
          <div key={stream}>
            <span>{stream}</span>
            <div className="contribution-cells">
              {agents
                .filter((agent) => agent.team === teamIndex)
                .map((agent) => {
                  const hasContribution = contributors.has(agent.id);
                  if (!onSelectAgent) {
                    return (
                      <span
                        key={agent.id}
                        className="contribution-cell"
                        aria-label={`${getAgentName(agent.id)}: ${stream} contribution`}
                        style={{ background: hasContribution ? agent.tone : undefined }}
                      />
                    );
                  }
                  return (
                    <button
                      key={agent.id}
                      disabled={!hasContribution}
                      aria-label={`${getAgentName(agent.id)}: ${stream} contribution`}
                      onClick={() => onSelectAgent(agent.id)}
                      style={{ background: hasContribution ? agent.tone : undefined }}
                    />
                  );
                })}
            </div>
          </div>
        ))}
      </div>
      <div className="layer-foot">
        <span>
          {agentCount} agents <i /> {capturedSteps.length} captured steps
        </span>
        <span className="color-key">
          <b />
          <b />
          <b /> Shared progress
        </span>
      </div>
    </div>
  );
}
