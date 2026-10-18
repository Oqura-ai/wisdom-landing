import Wordmark from './wordmark';
import Slogan from './slogan';
import AgentFace from './agent-face';
import StoryMotion from './story-motion';
import AgentProfile from './agent-profile';
import CapturedLedger from './captured-ledger';
import AgentContext from './agent-context';
import WisdomLayer from './wisdom-layer';
import { agents, getCapturedSteps, DEMO_DURATION_SECONDS } from '@/lib/demo';

const completedSteps = getCapturedSteps(DEMO_DURATION_SECONDS);
export default function Story() {
  return (
    <div className="story">
      <StoryMotion />
      <section className="story-intro" id="how-it-works">
        <p className="eyebrow">A shared understanding of work</p>
        <h2>
          More agents.
          <br />
          <em>Still one direction.</em>
        </h2>
      </section>
      <section className="story-row" data-reveal id="captured-work">
        <div className="story-copy">
          <span className="section-number">01 / A visible trail</span>
          <h2>
            Progress leaves
            <br />a trail.
          </h2>
          <p>
            The work, its outcome, and what changed.
            <br />
            Connected as it happens.
          </p>
        </div>
        <div className="study capture-study">
          <div className="study-heading">
            <AgentFace id={15} large />
            <span>A16</span>
          </div>
          <CapturedLedger agent={agents[15]} availableSteps={completedSteps} />
        </div>
      </section>
      <section className="story-row reverse" data-reveal id="shared-context">
        <div className="story-copy">
          <span className="section-number">02 / Individual strengths</span>
          <h2>
            Different strengths.
            <br />
            Shared understanding.
          </h2>
          <p>
            Each agent brings its own capabilities.
            <br />
            The right context travels with the work.
          </p>
        </div>
        <div className="study profile-study">
          <div className="study-heading">
            <AgentFace id={7} large />
            <span>A08</span>
          </div>
          <AgentProfile agent={agents[7]} availableSteps={completedSteps} />
        </div>
      </section>
      <section className="connection-study" data-reveal>
        <div className="section-center">
          <span className="section-number">03 / Work that travels</span>
          <h2>
            Good work
            <br />
            <em>carries forward.</em>
          </h2>
          <p>A shared layer between your agents and the tools you use.</p>
        </div>
        <div className="context-study">
          <div className="study-heading">
            <AgentFace id={15} large />
            <span>A16</span>
          </div>
          <AgentContext
            agent={agents[15]}
            availableSteps={completedSteps}
            peers={[agents[0], agents[7], agents[20]]}
          />
        </div>
      </section>
      <section className="story-row" data-reveal id="oversight">
        <div className="story-copy">
          <span className="section-number">04 / Shared progress</span>
          <h2>
            Many contributions.
            <br />
            One shared view.
          </h2>
          <p>
            See how each agent&apos;s work
            <br />
            becomes part of the whole.
          </p>
        </div>
        <div className="layer-study">
          <WisdomLayer capturedSteps={completedSteps} agentCount={agents.length} />
        </div>
      </section>
      <section className="closing">
        <h2>
          Let the team grow.
          <br />
          <em>Keep the work clear.</em>
        </h2>
      </section>
      <footer>
        <span className="footer-brand">
          <Wordmark />
        </span>
        <p>
          <Slogan />
        </p>
        <small>
          An{' '}
          <a href="https://oqura.ai" target="_blank" rel="noopener noreferrer">
            Oqura
          </a>{' '}
          product
        </small>
      </footer>
    </div>
  );
}
