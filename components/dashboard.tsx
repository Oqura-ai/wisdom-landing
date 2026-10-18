'use client';
import { useEffect, useRef, type MouseEvent } from 'react';
import { agents, getAgentName, getCapturedSteps, getVisibleAgents, streams } from '@/lib/demo';
import AgentFace from './agent-face';
import AgentContext from './agent-context';

interface DashboardProps {
  agentId: number | null;
  time: number;
  onClose: () => void;
}

export default function Dashboard({ agentId, time, onClose }: DashboardProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previouslyFocusedElement = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = 'hidden';

    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      previouslyFocusedElement?.focus();
    };
  }, []);

  const selectedAgent = agents[agentId ?? 0];
  const availableSteps = getCapturedSteps(time);
  const peers = getVisibleAgents(time)
    .filter((agent) => agent.id !== selectedAgent.id)
    .slice(0, 3);

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const outsideDialog =
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom;
    if (outsideDialog) onClose();
  }

  return (
    <dialog
      className="dashboard"
      ref={dialogRef}
      aria-labelledby="dashboard-title"
      onCancel={onClose}
      onClick={handleBackdropClick}
    >
      <div className="dashboard-heading">
        <div className="dashboard-identity">
          {selectedAgent && <AgentFace id={selectedAgent.id} large />}
          <div>
            <h2 id="dashboard-title">
              {selectedAgent ? getAgentName(selectedAgent.id) : 'Causal ledger'}
            </h2>
            <p>{streams[selectedAgent.team]}</p>
          </div>
        </div>
        <button className="icon-button" aria-label="Close agent dashboard" onClick={onClose}>
          &times;
        </button>
      </div>
      <AgentContext agent={selectedAgent} availableSteps={availableSteps} peers={peers} />
    </dialog>
  );
}
