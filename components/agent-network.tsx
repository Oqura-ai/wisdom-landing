'use client';
import { useId, useRef, type CSSProperties } from 'react';
import {
  agents,
  getAgentName,
  getVisibleAgents,
  streams,
  AGENTS_PER_TEAM,
  type Agent,
} from '@/lib/demo';
import {
  agentRelations,
  getAgentPosition,
  getAgentRadius,
  getConnectionSegment,
  getTransmissionPoint,
  SCENE_DIMENSIONS,
} from '@/lib/scene-geometry';
import { eyeShapes, getAgentExpression } from '@/lib/agent-expression';
import { useAgentLife } from './use-agent-life';

interface AgentNetworkProps {
  timeSeconds: number;
  isPlaying: boolean;
  isSuspended: boolean;
  mobile?: boolean;
  onSelectAgent: (agentId: number) => void;
}

interface AgentMarkerProps {
  agent: Agent;
  timeSeconds: number;
  mobile: boolean;
  clipId: string;
  onSelectAgent: (agentId: number) => void;
}

function AgentMarker({ agent, timeSeconds, mobile, clipId, onSelectAgent }: AgentMarkerProps) {
  const center = getAgentPosition(agent, mobile);
  const radius = getAgentRadius(agent, timeSeconds, mobile);
  const expression = getAgentExpression(agent, timeSeconds);
  const eyeAnimationStyle = {
    '--blink-period': `${4.5 + (agent.id % 5) * 0.53}s`,
    '--blink-delay': `${-agent.id * 0.71}s`,
    '--breathe-period': `${3.8 + (agent.id % 4) * 0.4}s`,
    '--eye-tilt': `${agent.id % 2 ? 2 : -2}deg`,
  } as CSSProperties;

  return (
    <g
      className="network-agent"
      transform={`translate(${center.x} ${center.y})`}
      role="button"
      tabIndex={0}
      aria-label={`${getAgentName(agent.id)}, ${streams[agent.team]}. Explore agent.`}
      onClick={() => onSelectAgent(agent.id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelectAgent(agent.id);
        }
      }}
    >
      <circle className="agent-focus" r={Math.max(radius + 5, 22)} />
      <circle r={radius} fill={agent.tone} stroke="#879fb7" strokeOpacity=".55" strokeWidth=".9" />
      <g clipPath={`url(#${clipId})`} pointerEvents="none">
        <ellipse
          cx={radius * 0.2}
          cy={radius * 0.85}
          rx={radius * 1.2}
          ry={radius * 0.7}
          fill="#6d8da9"
          opacity=".15"
          transform={`rotate(${((agent.id * 13) % 65) - 30})`}
        />
        {agent.slot === 0 && (
          <ellipse
            cx={radius * 0.8}
            cy={0}
            rx={radius * 0.55}
            ry={radius * 1.1}
            fill="#6885a3"
            opacity=".12"
          />
        )}
        <ellipse
          cx={-radius * 0.7}
          cy={-radius * 0.4}
          rx={radius * 0.45}
          ry={radius}
          fill="#fff"
          opacity=".22"
        />
      </g>
      <g
        className="agent-gaze"
        data-gaze={agent.id}
        data-expression={expression}
        pointerEvents="none"
      >
        <g className="agent-eye-life" style={eyeAnimationStyle}>
          <g className="agent-blink">
            <path
              d={eyeShapes[expression]}
              stroke="#344d6b"
              fill="none"
              strokeWidth={expression === 'happy' ? 2.3 : 2.7}
              strokeLinecap="round"
            />
          </g>
        </g>
      </g>
    </g>
  );
}

export default function AgentNetwork({
  timeSeconds,
  isPlaying,
  isSuspended,
  mobile = false,
  onSelectAgent,
}: AgentNetworkProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const clipPrefix = useId().replace(/:/g, '');
  const dimensions = mobile ? SCENE_DIMENSIONS.mobile : SCENE_DIMENSIONS.desktop;
  const visibleAgents = getVisibleAgents(timeSeconds);
  useAgentLife(svgRef, mobile, isSuspended);

  function clipId(agentId: number) {
    return `${clipPrefix}-clip-${agentId}`;
  }

  return (
    <svg
      ref={svgRef}
      className={`network ${mobile ? 'mobile-network' : 'desktop-network'}`}
      viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
      aria-label="Agent organization. Select an agent to explore its work."
    >
      <defs>
        {agents.map((agent) => (
          <clipPath key={agent.id} id={clipId(agent.id)}>
            <circle r={getAgentRadius(agent, timeSeconds, mobile)} />
          </clipPath>
        ))}
      </defs>
      {streams.map((stream, teamIndex) => {
        const lead = agents[teamIndex * AGENTS_PER_TEAM];
        if (lead.born > timeSeconds) return null;
        const center = getAgentPosition(lead, mobile);
        return (
          <ellipse
            key={stream}
            cx={center.x}
            cy={center.y}
            rx={mobile ? 72 : 91}
            ry={mobile ? 69 : 83}
            fill={lead.tone}
            opacity=".15"
            transform={`rotate(${teamIndex * 7 - 15} ${center.x} ${center.y})`}
          />
        );
      })}
      <g className="connections" aria-hidden="true">
        {agentRelations.map(([fromId, toId], relationIndex) => {
          const from = agents[fromId],
            to = agents[toId];
          if (from.born > timeSeconds || to.born > timeSeconds) return null;
          const segment = getConnectionSegment(from, to, timeSeconds, mobile);
          const packet = getTransmissionPoint(segment, timeSeconds, relationIndex);
          const showPacket = isPlaying && relationIndex % 4 === 0;
          return (
            <g key={`${fromId}-${toId}`}>
              <line
                x1={segment.start.x}
                y1={segment.start.y}
                x2={segment.end.x}
                y2={segment.end.y}
              />
              {showPacket && <circle cx={packet.x} cy={packet.y} r="2.6" fill="#7f9fb8" />}
            </g>
          );
        })}
      </g>
      {visibleAgents.map((agent) => (
        <AgentMarker
          key={agent.id}
          agent={agent}
          timeSeconds={timeSeconds}
          mobile={mobile}
          clipId={clipId(agent.id)}
          onSelectAgent={onSelectAgent}
        />
      ))}
    </svg>
  );
}
