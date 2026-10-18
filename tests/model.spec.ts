import { test, expect } from '@playwright/test';
import { agents, capturedSteps, getCapturedSteps, getRelatedSteps } from '../lib/demo';
import { getProfileTiles } from '../lib/agent-profile';
import { initialPlaybackState, playbackReducer } from '../lib/playback';

test('playback clamps seeks and stops exactly at the end', () => {
  expect(playbackReducer(initialPlaybackState, { type: 'seek', timeSeconds: -10 })).toEqual({
    timeSeconds: 0,
    isPlaying: false,
  });
  expect(playbackReducer(initialPlaybackState, { type: 'seek', timeSeconds: 80 })).toEqual(
    initialPlaybackState,
  );
  const finalFrame = playbackReducer(
    { timeSeconds: 23.95, isPlaying: true },
    { type: 'tick', deltaSeconds: 0.1 },
  );
  expect(finalFrame).toEqual(initialPlaybackState);
  expect(playbackReducer(finalFrame, { type: 'tick', deltaSeconds: 1 })).toEqual(finalFrame);
  expect(playbackReducer(finalFrame, { type: 'toggle' })).toEqual({
    timeSeconds: 0,
    isPlaying: true,
  });
});

test('a slow frame cannot make the simulation jump ahead', () => {
  const result = playbackReducer(
    { timeSeconds: 1, isPlaying: true },
    { type: 'tick', deltaSeconds: 10 },
  );
  expect(result.timeSeconds).toBeCloseTo(1.15);
  expect(playbackReducer(initialPlaybackState, { type: 'advance' })).toEqual({
    timeSeconds: 0,
    isPlaying: false,
  });
});

test('every causal reference points to a record available at capture time', () => {
  const byId = new Map(capturedSteps.map((step) => [step.id, step]));
  expect(byId.size).toBe(capturedSteps.length);
  for (const step of capturedSteps) {
    for (const id of [step.parentId, step.sourceId].filter(Boolean)) {
      expect(byId.has(id!)).toBe(true);
      expect(byId.get(id!)!.timestampSeconds).toBeLessThanOrEqual(step.timestampSeconds);
    }
    const available = getCapturedSteps(step.timestampSeconds);
    expect(
      getRelatedSteps(step, available).every(
        (related) => related.timestampSeconds <= step.timestampSeconds,
      ),
    ).toBe(true);
  }
});

test('peer profile contains no private note, even after developer inspection', () => {
  const developer = getProfileTiles(agents[0], capturedSteps, 'developer');
  expect(developer.find((tile) => tile.label === 'Confidential')?.description).toContain(
    'Example private note',
  );
  const peer = getProfileTiles(agents[0], capturedSteps, 'peer');
  expect(peer.find((tile) => tile.label === 'Confidential')?.value).toBe('Restricted');
  expect(JSON.stringify(peer)).not.toContain('prefer smaller review steps');
});

// Task cards must follow captured evidence, including when the timeline is rewound.
test('task ledger derives requester from captured history and hides future work', async () => {
  const { getAgentTasks } = await import('../lib/agent-tasks');
  const { agents, getCapturedSteps } = await import('../lib/demo');
  expect(getAgentTasks(agents[5], getCapturedSteps(6))).toEqual([]);
  const [started] = getAgentTasks(agents[5], getCapturedSteps(6.5));
  expect(started.requesterId).toBe(0);
  expect(started.complete).toBe(false);
  expect(started.steps).toHaveLength(1);
  const [finished] = getAgentTasks(agents[5], getCapturedSteps(24));
  expect(finished.complete).toBe(true);
  expect(finished.steps.length).toBeLessThanOrEqual(10);
});
