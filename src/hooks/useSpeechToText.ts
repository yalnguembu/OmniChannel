import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// ─── Minimal Web Speech typings ──────────────────────────────────────────────
// Declared locally rather than globally: the API is unprefixed only in some
// browsers, and augmenting the global scope would clash with the DOM lib on
// TypeScript versions that already ship these names.

interface SpeechAlternativeLike {
  transcript: string;
}
interface SpeechResultLike {
  readonly length: number;
  readonly isFinal: boolean;
  [index: number]: SpeechAlternativeLike;
}
interface SpeechResultListLike {
  readonly length: number;
  [index: number]: SpeechResultLike;
}
interface SpeechResultEventLike {
  resultIndex: number;
  results: SpeechResultListLike;
}
interface SpeechErrorEventLike {
  error: string;
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SpeechResultEventLike) => void) | null;
  onerror: ((e: SpeechErrorEventLike) => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

interface Diagnosis {
  /** Message to surface, or null when the event is routine. */
  message: string | null;
  /**
   * The recogniser cannot work in this browser at all — retrying would just
   * repeat the same failure, so the control is disabled for the session.
   */
  fatal: boolean;
}

/**
 * Turn a recognition error code into something actionable.
 *
 * `network` is the subtle one. It does not mean the user is offline: the
 * recogniser streams audio to a vendor speech service, and Chromium forks
 * that ship without Google's speech keys — Brave most notably — report the
 * unreachable service as `network` even on a perfectly good connection.
 * `navigator.onLine` separates the two cases.
 */
function diagnose(code: string): Diagnosis {
  switch (code) {
    case 'not-allowed':
      // Recoverable: the user can still grant the permission.
      return {
        message: "Micro refusé. Autorisez l'accès au microphone pour dicter.",
        fatal: false,
      };
    case 'audio-capture':
      return { message: 'Aucun micro détecté.', fatal: false };
    case 'service-not-allowed':
      return {
        message:
          "Ce navigateur bloque le service de reconnaissance vocale. Essayez Chrome ou Edge.",
        fatal: true,
      };
    case 'network':
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        return {
          message: 'Vous êtes hors ligne — la dictée passe par un service en ligne.',
          fatal: false,
        };
      }
      return {
        message:
          "Le service de reconnaissance vocale n'est pas disponible dans ce navigateur " +
          '(Brave et Firefox le désactivent). Essayez Chrome ou Edge.',
        fatal: true,
      };
    case 'language-not-supported':
      return { message: 'Langue non prise en charge pour la dictée.', fatal: true };
    // Silence and manual aborts are normal; they are not worth a toast.
    case 'no-speech':
    case 'aborted':
      return { message: null, fatal: false };
    default:
      return { message: 'La dictée a échoué.', fatal: false };
  }
}

interface UseSpeechToTextOptions {
  lang?: string;
  /**
   * Full transcript for the current dictation session (finalised text plus
   * the in-flight guess). Called on every update, so the caller can render
   * the words as they are spoken.
   */
  onTranscript: (text: string) => void;
  onError?: (message: string) => void;
}

/** Silence can end a session on its own; below this gap a restart is a loop. */
const RESTART_DEBOUNCE_MS = 400;
const MAX_CONSECUTIVE_RESTARTS = 3;

/**
 * Dictation through the browser's own speech recogniser.
 *
 * Done client-side because the API exposes no transcription endpoint. Support
 * is uneven — Chrome, Edge and Safari have it, Firefox does not, and some
 * Chromium builds (Brave among them) ship it disabled, which surfaces as a
 * `network` or `service-not-allowed` error rather than as missing support.
 * `supported` therefore only tells you the constructor exists; a failure at
 * runtime still comes back through `onError`.
 */
export function useSpeechToText({
  lang = 'fr-FR',
  onTranscript,
  onError,
}: UseSpeechToTextOptions) {
  const supported = useMemo(() => getRecognitionCtor() !== null, []);
  const [listening, setListening] = useState(false);
  /** Set once the recogniser proves unusable here — see {@link diagnose}. */
  const [blockedReason, setBlockedReason] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  /** Text already finalised in this session. */
  const finalRef = useRef('');
  /** The user still wants to dictate — drives the auto-restart on silence. */
  const wantedRef = useRef(false);
  const restartsRef = useRef(0);
  const lastStartRef = useRef(0);

  // Kept in refs so re-renders never rebind the recogniser mid-session.
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const teardown = useCallback(() => {
    wantedRef.current = false;
    const rec = recognitionRef.current;
    recognitionRef.current = null;
    if (rec) {
      rec.onresult = null;
      rec.onerror = null;
      rec.onend = null;
      try {
        rec.abort();
      } catch {
        /* already stopped */
      }
    }
    setListening(false);
  }, []);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor || recognitionRef.current || blockedReason) return;

    const rec = new Ctor();
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const text = result?.[0]?.transcript ?? '';
        if (result?.isFinal) finalRef.current += text;
        else interim += text;
      }
      onTranscriptRef.current(finalRef.current + interim);
    };

    rec.onerror = (event) => {
      const { message, fatal } = diagnose(event.error);
      if (message) onErrorRef.current?.(message);
      // Disable the control rather than let the user hit the same wall again.
      if (fatal && message) setBlockedReason(message);
      // Only an error ends the session; silence is handled by onend.
      if (event.error !== 'no-speech') teardown();
    };

    rec.onend = () => {
      // Recognisers stop on their own after a pause. Restart while the user
      // has not pressed stop, but give up if it keeps ending immediately —
      // that means the service is refusing, not that the speaker paused.
      if (!wantedRef.current) {
        teardown();
        return;
      }
      const now = Date.now();
      restartsRef.current =
        now - lastStartRef.current < RESTART_DEBOUNCE_MS ? restartsRef.current + 1 : 0;
      if (restartsRef.current >= MAX_CONSECUTIVE_RESTARTS) {
        teardown();
        return;
      }
      lastStartRef.current = now;
      try {
        rec.start();
      } catch {
        teardown();
      }
    };

    finalRef.current = '';
    wantedRef.current = true;
    restartsRef.current = 0;
    lastStartRef.current = Date.now();

    try {
      rec.start();
      recognitionRef.current = rec;
      setListening(true);
    } catch {
      onErrorRef.current?.('La dictée a échoué.');
      teardown();
    }
  }, [lang, teardown, blockedReason]);

  const stop = useCallback(() => {
    wantedRef.current = false;
    const rec = recognitionRef.current;
    if (!rec) {
      setListening(false);
      return;
    }
    try {
      rec.stop(); // flushes the last result, then fires onend
    } catch {
      teardown();
    }
  }, [teardown]);

  const toggle = useCallback(() => {
    if (listening) stop();
    else start();
  }, [listening, start, stop]);

  useEffect(() => teardown, [teardown]);

  return {
    /** The API exists in this browser (it may still be blocked at runtime). */
    supported,
    /** Usable right now — false once the recogniser has proven blocked. */
    available: supported && blockedReason === null,
    /** Why dictation is unavailable, for the button's tooltip. */
    unavailableReason: supported
      ? blockedReason
      : "Dictée non prise en charge par ce navigateur",
    listening,
    start,
    stop,
    toggle,
  };
}
