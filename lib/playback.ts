import { DEMO_DURATION_SECONDS } from './demo';

export const PLAYBACK_FRAME_INTERVAL_MS = 50;
export const MAX_FRAME_DELTA_SECONDS = 0.15;
const REDUCED_MOTION_STEP_SECONDS = 4;

export interface PlaybackState {
  timeSeconds: number;
  isPlaying: boolean;
}
export type PlaybackAction =
  | { type: 'toggle' }
  | { type: 'pause' }
  | { type: 'restart' }
  | { type: 'seek'; timeSeconds: number }
  | { type: 'advance' }
  | { type: 'tick'; deltaSeconds: number };

export const initialPlaybackState: PlaybackState = {
  timeSeconds: DEMO_DURATION_SECONDS,
  isPlaying: false,
};

export function playbackReducer(state: PlaybackState, action: PlaybackAction): PlaybackState {
  switch (action.type) {
    case 'toggle':
      return {
        timeSeconds: state.timeSeconds >= DEMO_DURATION_SECONDS ? 0 : state.timeSeconds,
        isPlaying: !state.isPlaying,
      };
    case 'pause':
      return { ...state, isPlaying: false };
    case 'restart':
      return { timeSeconds: 0, isPlaying: false };
    case 'seek':
      return {
        timeSeconds: Math.max(0, Math.min(DEMO_DURATION_SECONDS, action.timeSeconds)),
        isPlaying: false,
      };
    case 'advance':
      return {
        timeSeconds:
          state.timeSeconds >= DEMO_DURATION_SECONDS
            ? 0
            : Math.min(DEMO_DURATION_SECONDS, state.timeSeconds + REDUCED_MOTION_STEP_SECONDS),
        isPlaying: false,
      };
    case 'tick': {
      if (!state.isPlaying) return state;
      const delta = Math.max(0, Math.min(MAX_FRAME_DELTA_SECONDS, action.deltaSeconds));
      const timeSeconds = Math.min(DEMO_DURATION_SECONDS, state.timeSeconds + delta);
      return { timeSeconds, isPlaying: timeSeconds < DEMO_DURATION_SECONDS };
    }
  }
}
