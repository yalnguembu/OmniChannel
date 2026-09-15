import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { Loader2, Tv } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReaboAuth } from "@/hooks/useReaboAuth";
import { useReaboSubscribers } from "@/hooks/useReabo";
import { ReaboSheet } from "./ReaboSheet";
import { SubscriberCard } from "./SubscriberCard";
import { TONE_ERROR_TEXT, TONE_STATE } from "./tone";
import {
  expiryLabel,
  isSubscriptionActive,
  subscriberName,
  type Subscriber,
} from "@/models/reabo.models";

interface ReaboEntityValue {
  /** Opens the lookup under a decoder number found in a message. */
  openDecoder: (decoder: string, anchor: DOMRect) => void;
}

/**
 * Null by default on purpose: `RichText` is a plain rendering component and
 * must keep working — decoder numbers staying plain text — anywhere the
 * provider is not mounted.
 */
const ReaboEntityContext = createContext<ReaboEntityValue | null>(null);

export function useReaboEntity(): ReaboEntityValue | null {
  return useContext(ReaboEntityContext);
}

const POPOVER_WIDTH = 300;
const VIEWPORT_MARGIN = 12;

/** Keeps the card under the number it belongs to, and inside the screen. */
function placement(anchor: DOMRect): React.CSSProperties {
  const width = Math.min(POPOVER_WIDTH, window.innerWidth - VIEWPORT_MARGIN * 2);
  const left = Math.min(
    Math.max(VIEWPORT_MARGIN, anchor.left),
    window.innerWidth - width - VIEWPORT_MARGIN,
  );
  const below = anchor.bottom + 6;
  // Flip above when there is no room underneath — a lookup that opens off
  // screen is a lookup the agent has to scroll to find.
  const flip = below + 260 > window.innerHeight && anchor.top > 280;

  return flip
    ? { left, bottom: window.innerHeight - anchor.top + 6, width }
    : { left, top: below, width };
}

/**
 * Lookup opened by tapping a decoder number in the thread.
 *
 * A dropdown anchored to the number, not a dialog over the conversation: the
 * agent is reading the message that contains it, and covering that message to
 * answer "who is this?" defeats the point. Resolution happens on the tap —
 * never while the thread renders — and the answer is cached under the same key
 * the details panel uses, so the two never fetch twice.
 */
const DecoderPopover: React.FC<{
  decoder: string;
  anchor: DOMRect;
  onClose: () => void;
  onOpen: (subscriber: Subscriber) => void;
}> = ({ decoder, anchor, onClose, onOpen }) => {
  const { status } = useReaboAuth();
  const query = useReaboSubscribers(decoder, status === "connected");
  const subscribers = query.data ?? [];

  return (
    <>
      {/* Click-away layer only — no dim, so the conversation stays readable. */}
      <div className="fixed inset-0 z-[940]" onClick={onClose} />
      <div
        role="dialog"
        aria-label={`Décodeur ${decoder}`}
        style={placement(anchor)}
        className="fixed z-[941] overflow-hidden rounded-xl border border-wa-border bg-white shadow-[0_8px_28px_-8px_rgba(0,0,0,0.3)]"
      >
        <p className="border-b border-wa-border px-3 py-2 font-mono text-xs text-wa-muted">
          {decoder}
        </p>

        {status !== "connected" && (
          <p className="px-3 py-3 text-sm text-wa-muted">
            Connectez-vous à Reabo pour consulter ce numéro.
          </p>
        )}

        {status === "connected" && query.isLoading && (
          <p className="flex items-center gap-2 px-3 py-3 text-sm text-wa-muted">
            <Loader2 size={14} className="animate-spin" />
            Recherche…
          </p>
        )}

        {status === "connected" && query.isError && (
          <p className={cn("px-3 py-3 text-sm", TONE_ERROR_TEXT)}>
            {(query.error as Error)?.message ?? "Recherche indisponible."}
          </p>
        )}

        {status === "connected" &&
          !query.isLoading &&
          !query.isError &&
          subscribers.length === 0 && (
            <p className="px-3 py-3 text-sm text-wa-muted">
              Aucun abonné ne correspond à ce numéro.
            </p>
          )}

        {subscribers.map((s, i) => {
          const active = isSubscriptionActive(s.finabo);
          return (
            <button
              key={`${s.numabo}-${s.cabo}-${i}`}
              type="button"
              onClick={() => onOpen(s)}
              className="flex w-full items-center gap-2.5 border-b border-wa-border/60 px-3 py-2.5 text-left last:border-0 hover:bg-wa-hover"
            >
              <Tv size={17} className="shrink-0 text-wa-icon" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-wa-text">
                  {subscriberName(s)}
                </span>
                <span className="block truncate text-xs text-wa-muted">
                  {s.optionmajeureabo || "Formule inconnue"}
                </span>
              </span>
              <span
                className={cn(
                  "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                  active
                    ? TONE_STATE.success
                    : TONE_STATE.failed,
                )}
              >
                {expiryLabel(s.finabo)}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
};

/**
 * Makes decoder numbers in message bodies actionable.
 *
 * Wraps the inbox so every `RichText` inside the thread can turn a decoder
 * number into a button without a single prop being threaded through
 * `ChatArea`, `MessagesList` and `MessageBubble`.
 */
export const ReaboEntityProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [popover, setPopover] = useState<{ decoder: string; anchor: DOMRect } | null>(
    null,
  );
  const [opened, setOpened] = useState<Subscriber | null>(null);

  const openDecoder = useCallback(
    (decoder: string, anchor: DOMRect) => setPopover({ decoder, anchor }),
    [],
  );
  const value = useMemo<ReaboEntityValue>(() => ({ openDecoder }), [openDecoder]);

  return (
    <ReaboEntityContext.Provider value={value}>
      {children}

      {popover && (
        <DecoderPopover
          decoder={popover.decoder}
          anchor={popover.anchor}
          onClose={() => setPopover(null)}
          onOpen={(subscriber) => {
            setPopover(null);
            setOpened(subscriber);
          }}
        />
      )}

      <ReaboSheet
        open={!!opened}
        title={opened ? subscriberName(opened) : ""}
        onClose={() => setOpened(null)}
      >
        {opened && <SubscriberCard subscriber={opened} defaultOpen />}
      </ReaboSheet>
    </ReaboEntityContext.Provider>
  );
};
