import React, { useCallback, useEffect, useRef, useState } from "react";
import { Play, Pause, ExternalLink, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  src: string;
  className?: string;
}

function fmt(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${`${s}`.padStart(2, "0")}`;
}

const RATES = [1, 1.5, 2] as const;

/** `MediaError` codes. 1 = aborted fetch, i.e. a teardown, not a failure. */
const MEDIA_ERR_ABORTED = 1;
const MEDIA_ERR_DECODE = 3;

/** What actually went wrong, in words the user can act on. */
function failureLabel(code: number | undefined): string {
  // A decode failure means the bytes arrived but the codec is unsupported.
  if (code === MEDIA_ERR_DECODE) return 'Format audio non pris en charge';
  // Network / unsupported-source almost always means the URL did not resolve
  // to a media file at all (a 404, or an HTML page served in its place).
  return 'Fichier audio introuvable';
}

/**
 * WhatsApp-style voice-note player.
 *
 * Built on our own controls rather than `<audio controls>` for two reasons:
 * the native widget gives no feedback when the media fails to load (a dead
 * grey bar — the "can't open the audio" symptom), and voice notes are
 * frequently streamed without duration metadata, which leaves the native
 * timeline stuck at 0:00.
 *
 * Duration is resolved defensively: `duration` when the container carries it,
 * otherwise the end of the seekable range. The previous workaround — seeking
 * to `Number.MAX_SAFE_INTEGER` to force the browser to read to the tail — is
 * gone: browsers either reject that value or leave the element stalled at the
 * end, which is exactly what made a clip refuse to play.
 */
export const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, className }) => {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(NaN);
  const [rate, setRate] = useState<number>(1);
  const [failed, setFailed] = useState(false);
  const [errorCode, setErrorCode] = useState<number | undefined>(undefined);

  // Reset when the clip changes (bubbles are recycled as pages load).
  useEffect(() => {
    setPlaying(false);
    setCurrent(0);
    setDuration(NaN);
    setFailed(false);
    setErrorCode(undefined);
  }, [src]);

  const resolveDuration = useCallback(() => {
    const audio = ref.current;
    if (!audio) return;
    if (Number.isFinite(audio.duration) && audio.duration > 0) {
      setDuration(audio.duration);
      return;
    }
    // Streamed without a duration header: the seekable range usually knows
    // where the media ends once enough of it has been buffered.
    try {
      if (audio.seekable.length > 0) {
        const end = audio.seekable.end(audio.seekable.length - 1);
        if (Number.isFinite(end) && end > 0) setDuration(end);
      }
    } catch {
      /* seekable throws on some not-yet-ready streams — ignore, retry later */
    }
  }, []);

  const toggle = useCallback(async () => {
    const audio = ref.current;
    if (!audio) return;
    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        // A rejected play() is not conclusive on its own — it also happens
        // when a pause() interrupts it. Only a real MediaError counts.
        if (audio.error && audio.error.code !== MEDIA_ERR_ABORTED) {
          setFailed(true);
        }
      }
    } else {
      audio.pause();
    }
  }, []);

  /**
   * `error` also fires when the element is torn down or its source swapped —
   * routine in a message list that re-renders — and that arrives as
   * MEDIA_ERR_ABORTED. Treating it as a broken file is what made working
   * clips show "Lecture impossible".
   */
  const handleError = useCallback(() => {
    const code = ref.current?.error?.code;
    if (code == null || code === MEDIA_ERR_ABORTED) return;
    // The resolved URL is the one thing needed to diagnose this, and it is
    // not visible anywhere in the UI.
    console.warn(
      `[AudioPlayer] lecture impossible (MediaError ${code}) — ${ref.current?.currentSrc || src}`,
    );
    setErrorCode(code);
    setFailed(true);
  }, [src]);

  const cycleRate = useCallback(() => {
    const next = RATES[(RATES.indexOf(rate as (typeof RATES)[number]) + 1) % RATES.length];
    setRate(next);
    if (ref.current) ref.current.playbackRate = next;
  }, [rate]);

  const onSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = ref.current;
    if (!audio) return;
    const value = Number(e.target.value);
    audio.currentTime = value;
    setCurrent(value);
  }, []);

  // Known length, or the furthest point reached — keeps the slider usable even
  // when the duration never resolves.
  const max = Number.isFinite(duration) && duration > 0 ? duration : Math.max(current, 1);

  // Nothing to play — render a placeholder rather than a broken control.
  if (!src) {
    return (
      <div
        className={cn(
          "flex items-center gap-2.5 rounded-lg bg-black/5 px-3 py-2 min-w-52",
          className,
        )}
      >
        <AlertCircle size={18} className="shrink-0 text-wa-muted" />
        <span className="text-xs text-wa-muted">Audio indisponible</span>
      </div>
    );
  }

  if (failed) {
    return (
      <div
        // The URL is the only thing that explains this; surface it on hover
        // rather than in the bubble.
        title={src}
        className={cn(
          "flex items-center gap-2.5 rounded-lg bg-black/5 px-3 py-2 min-w-52",
          className,
        )}
      >
        <AlertCircle size={18} className="shrink-0 text-wa-status-pending" />
        <span className="flex-1 text-xs text-wa-muted">{failureLabel(errorCode)}</span>
        {/* Opens in a tab instead of downloading: when the URL is wrong, a
            `download` silently saved the app's index.html, which helped
            nobody. A tab at least shows what the server actually returned. */}
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs text-wa-teal no-underline transition-colors hover:bg-wa-hover"
        >
          <ExternalLink size={12} />
          Ouvrir
        </a>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2.5 min-w-52 py-0.5", className)}>
      <audio
        ref={ref}
        src={src}
        preload="metadata"
        onLoadedMetadata={resolveDuration}
        onDurationChange={resolveDuration}
        onProgress={resolveDuration}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setCurrent(0);
          if (ref.current) ref.current.currentTime = 0;
        }}
        onTimeUpdate={() => setCurrent(ref.current?.currentTime ?? 0)}
        onError={handleError}
      />

      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause" : "Lire"}
        className="size-9 shrink-0 rounded-full bg-white/70 text-wa-icon flex items-center justify-center hover:bg-white transition-colors"
      >
        {playing ? <Pause size={17} /> : <Play size={17} className="ml-0.5" />}
      </button>

      <div className="flex-1 min-w-0">
        <input
          type="range"
          min={0}
          max={max}
          step={0.1}
          value={Math.min(current, max)}
          onChange={onSeek}
          aria-label="Position de lecture"
          className="w-full h-1 appearance-none rounded-full bg-black/15 accent-wa-teal cursor-pointer"
        />
        <div className="mt-1 flex items-center justify-between text-[11px] text-wa-muted leading-none">
          <span>{fmt(current)}</span>
          <span>{Number.isFinite(duration) ? fmt(duration) : "--:--"}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={cycleRate}
        aria-label="Vitesse de lecture"
        className={cn(
          "shrink-0 rounded-full px-1.5 py-0.5 text-[11px] font-medium transition-colors",
          rate === 1
            ? "text-wa-muted hover:bg-black/5"
            : "bg-wa-teal/10 text-wa-teal",
        )}
      >
        {rate}x
      </button>
    </div>
  );
};
