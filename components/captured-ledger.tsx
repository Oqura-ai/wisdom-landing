import { getAgentName, type Agent, type CapturedStep } from '@/lib/demo';
import { getAgentTasks } from '@/lib/agent-tasks';
import AgentFace from './agent-face';

interface CapturedLedgerProps {
  agent: Agent;
  availableSteps: CapturedStep[];
}

export default function CapturedLedger({ agent, availableSteps }: CapturedLedgerProps) {
  const tasks = getAgentTasks(agent, availableSteps);
  return (
    <section className="task-ledger" aria-label="Causal ledger">
      {/* The offset sheets illustrate the task archive, not additional captured records. */}
      <div className="ledger-stack">
        {tasks.map((task) => (
          <article className="task-card" key={task.id}>
            <div className="ledger-card-heading">
              <h3>Causal ledger</h3>
              {task.requesterId !== null && (
                <span
                  className="ledger-requester"
                  aria-label={`Task from ${getAgentName(task.requesterId)}`}
                >
                  <AgentFace id={task.requesterId} />
                  <span>{getAgentName(task.requesterId)}</span>
                </span>
              )}
            </div>
            <p className="ledger-task-title">{task.title}</p>
            <ol className="task-trail" aria-label="Captured task sequence">
              {task.steps.map((step) => (
                <li
                  key={step.id}
                  className={step.hasCodeChange ? 'changed' : ''}
                  aria-label={`${step.title}, ${step.timestampSeconds.toFixed(1)} seconds`}
                />
              ))}
            </ol>
          </article>
        ))}
        {tasks.length === 0 && (
          <article className="task-card">
            <h3>Causal ledger</h3>
            <p className="ledger-task-title">Awaiting a task</p>
          </article>
        )}
      </div>
    </section>
  );
}
