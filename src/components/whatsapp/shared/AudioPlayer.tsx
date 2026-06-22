import React, { useCallback, useRef } from "react";

interface AudioPlayerProps {
  src: string;
  className?: string;
}

/**
 * Native <audio> with controls, plus a workaround for the common case where the
 * media is streamed without a Content-Length / duration metadata (typical of
 * WhatsApp voice notes). In that case the browser reports `duration` as
 * `Infinity`, so the controls show "0:00" until the clip is played to the end.
 *
 * On metadata load we seek far past the end once, which forces the browser to
 * resolve the real duration; we then reset the playhead to the start.
 */
export const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, className }) => {
  const ref = useRef<HTMLAudioElement>(null);

  const handleLoadedMetadata = useCallback(() => {
    const audio = ref.current;
    if (!audio) return;
    if (audio.duration === Infinity || Number.isNaN(audio.duration)) {
      const reset = () => {
        audio.removeEventListener("timeupdate", reset);
        // Back to the start once the duration has been resolved.
        audio.currentTime = 0;
      };
      audio.addEventListener("timeupdate", reset);
      // Seeking beyond the end makes the browser download to the tail and emit
      // a `durationchange`, yielding the true duration.
      audio.currentTime = Number.MAX_SAFE_INTEGER;
    }
  }, []);

  return (
    <audio
      ref={ref}
      src={src}
      controls
      preload="metadata"
      onLoadedMetadata={handleLoadedMetadata}
      className={className}
    />
  );
};
