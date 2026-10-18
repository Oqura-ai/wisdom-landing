'use client';
import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { getCapturedSteps, getVisibleAgents } from '@/lib/demo';
import HarnessLabel from './harness-label';
import AgentNetwork from './agent-network';
import PlaybackControls from './playback-controls';
import WisdomLayer from './wisdom-layer';
import { usePlayback } from './use-playback';

// Load the inspection UI only when someone opens an agent or the shared ledger.
const Dashboard = dynamic(() => import('./dashboard'));
interface DashboardSelection {
  agentId: number | null;
}

export default function Hero() {
  const hostRef = useRef<HTMLElement>(null);
  const playback = usePlayback(hostRef);
  const [dashboard, setDashboard] = useState<DashboardSelection | null>(null);
  const [checkpointInterval, setCheckpointInterval] = useState(4);
  const visibleAgentCount = getVisibleAgents(playback.timeSeconds).length;
  const capturedSteps = getCapturedSteps(playback.timeSeconds);

  function openDashboard(agentId: number | null) {
    playback.pause();
    setDashboard({ agentId });
  }

  return (
    <section className="hero-demo" aria-label="Interactive Wisdom demonstration" ref={hostRef}>
      <div className="organization">
        <div className="supervisor">
          <span className="harness" aria-hidden="true">
            H
          </span>
          <HarnessLabel />
          <span
            className="supervisor-checks"
            aria-label={`${Math.floor(playback.timeSeconds / checkpointInterval)} checkpoints`}
          >
            {[1, 2, 3].map((checkpoint) => (
              <i
                key={checkpoint}
                style={{
                  opacity: playback.timeSeconds >= checkpointInterval * checkpoint ? 1 : 0.2,
                }}
              />
            ))}
          </span>
        </div>
        <div className="network-frame">
          {/* CSS chooses the layout without a hydration-time breakpoint shift. */}
          <AgentNetwork
            timeSeconds={playback.timeSeconds}
            isPlaying={playback.isPlaying}
            isSuspended={dashboard !== null}
            onSelectAgent={openDashboard}
          />
          <AgentNetwork
            timeSeconds={playback.timeSeconds}
            isPlaying={playback.isPlaying}
            isSuspended={dashboard !== null}
            onSelectAgent={openDashboard}
            mobile
          />
        </div>
      </div>
      <WisdomLayer
        capturedSteps={capturedSteps}
        agentCount={visibleAgentCount}
        onSelectAgent={openDashboard}
      />
      <PlaybackControls
        timeSeconds={playback.timeSeconds}
        isPlaying={playback.isPlaying}
        checkpointInterval={checkpointInterval}
        onToggle={playback.togglePlayback}
        onRestart={playback.restart}
        onSeek={playback.seek}
        onCheckpointChange={setCheckpointInterval}
      />
      <div className="growth-stages">
        <span aria-current={visibleAgentCount === 1}>Solo</span>
        <i />
        <span aria-current={visibleAgentCount > 1 && visibleAgentCount < 15}>Startup</span>
        <i />
        <span aria-current={visibleAgentCount >= 15}>Company</span>
      </div>
      <p className="hero-hint">Select an agent. Explore the work behind it.</p>
      {dashboard !== null && (
        <Dashboard
          agentId={dashboard.agentId}
          time={playback.timeSeconds}
          onClose={() => setDashboard(null)}
        />
      )}
    </section>
  );
}
