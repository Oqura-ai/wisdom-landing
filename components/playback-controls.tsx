import { DEMO_DURATION_SECONDS } from '@/lib/demo';

interface PlaybackControlsProps {
  timeSeconds: number;
  isPlaying: boolean;
  checkpointInterval: number;
  onToggle: () => void;
  onRestart: () => void;
  onSeek: (timeSeconds: number) => void;
  onCheckpointChange: (intervalSeconds: number) => void;
}

export default function PlaybackControls({
  timeSeconds,
  isPlaying,
  checkpointInterval,
  onToggle,
  onRestart,
  onSeek,
  onCheckpointChange,
}: PlaybackControlsProps) {
  return (
    <div className="playback">
      <button className="icon-button" aria-label={isPlaying ? 'Pause' : 'Play'} onClick={onToggle}>
        {isPlaying ? '\u2161' : '\u25b7'}
      </button>
      <button className="icon-button" aria-label="Restart" onClick={onRestart}>
        &#8634;
      </button>
      <input
        type="range"
        min="0"
        max={DEMO_DURATION_SECONDS}
        step=".05"
        value={timeSeconds}
        aria-label="Organization timeline"
        onChange={(event) => onSeek(Number(event.target.value))}
      />
      <output>{timeSeconds.toFixed(1)}s</output>
      <select
        value={checkpointInterval}
        aria-label="Checkpoint interval"
        onChange={(event) => onCheckpointChange(Number(event.target.value))}
      >
        {[2, 4, 8].map((interval) => (
          <option key={interval} value={interval}>
            Check &middot; {interval}s
          </option>
        ))}
      </select>
    </div>
  );
}
