import { useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { fetchMessageWindow } from "@/hooks/useWhatsapp";
import { useWhatsAppStore } from "@/store/useWhatsappStore";
import { collectDecoderCandidates } from "@/lib/reaboDecoders";
import {
  fetchSubscribers,
  reaboDataKeys,
  SUBSCRIBER_STALE_TIME,
} from "@/hooks/useReabo";
import type { Subscriber } from "@/models/reabo.models";

/**
 * Upper bound on how far back a scan reads. A thread of ten thousand messages
 * is not worth pulling to find a decoder number the customer almost certainly
 * repeated recently — the scan says so rather than grinding.
 */
const MAX_SCAN_MESSAGES = 2000;

/** First window to ask for, when the thread on screen is still the initial page. */
const FIRST_WINDOW = 250;

/** Lookups in flight while resolving candidates. */
const RESOLVE_CONCURRENCY = 3;

export interface ScanProgress {
  phase: "idle" | "reading" | "resolving" | "done";
  messagesRead: number;
  totalMessages: number;
  candidates: number;
  resolved: number;
  /** The thread was longer than {@link MAX_SCAN_MESSAGES}. */
  truncated: boolean;
  error: string | null;
}

const IDLE: ScanProgress = {
  phase: "idle",
  messagesRead: 0,
  totalMessages: 0,
  candidates: 0,
  resolved: 0,
  truncated: false,
  error: null,
};

/** Runs `worker` over `items`, at most `limit` at a time, preserving order. */
async function pooled<T, R>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;

  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    for (;;) {
      const index = cursor;
      cursor += 1;
      if (index >= items.length) return;
      results[index] = await worker(items[index]);
    }
  });

  await Promise.all(runners);
  return results;
}

/**
 * Finds the decoders a conversation talks about, by reading the conversation.
 *
 * Nothing is memorised anywhere: the thread is the source. The scan widens the
 * loaded window until the whole thread is in the store, collects every decoder
 * candidate, and resolves each one against ReaboCanal. Because the store is
 * what the message list renders from, a scan also **brings the older messages
 * on screen** — the agent gets the history loaded as a side effect.
 *
 * It is always agent-triggered. On a long thread it costs a few seconds, which
 * is precisely why it must not run on its own when a conversation opens.
 */
export function useDecoderScan(conversationId: string | null) {
  const qc = useQueryClient();
  const mergeMessages = useWhatsAppStore((s) => s.mergeMessages);

  const [progress, setProgress] = useState<ScanProgress>(IDLE);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [decoders, setDecoders] = useState<string[]>([]);
  /** Guards against a second scan while one is running. */
  const running = useRef(false);

  const reset = useCallback(() => {
    setProgress(IDLE);
    setSubscribers([]);
    setDecoders([]);
  }, []);

  const scan = useCallback(async () => {
    if (!conversationId || running.current) return;
    running.current = true;
    setProgress({ ...IDLE, phase: "reading" });

    try {
      // One widening step, not a loop: the first response reports `totalCount`,
      // so the second request can ask for the whole thread at once instead of
      // crawling page by page.
      let page = await fetchMessageWindow(conversationId, FIRST_WINDOW);
      mergeMessages(page.items);

      const total = page.totalCount;
      const truncated = total > MAX_SCAN_MESSAGES;

      if (page.hasNextPage && total > page.items.length) {
        setProgress((p) => ({
          ...p,
          messagesRead: page.items.length,
          totalMessages: total,
        }));
        page = await fetchMessageWindow(
          conversationId,
          Math.min(total, MAX_SCAN_MESSAGES),
        );
        mergeMessages(page.items);
      }

      const candidates = collectDecoderCandidates(page.items);
      setDecoders(candidates);
      setProgress((p) => ({
        ...p,
        phase: "resolving",
        messagesRead: page.items.length,
        totalMessages: total,
        candidates: candidates.length,
        truncated,
      }));

      if (candidates.length === 0) {
        setProgress((p) => ({ ...p, phase: "done" }));
        return;
      }

      const found: Subscriber[] = [];
      const seen = new Set<string>();

      await pooled(candidates, RESOLVE_CONCURRENCY, async (candidate) => {
        try {
          // Through the cache, under the same key as `useReaboSubscribers`, so
          // a card opened afterwards reuses this result instead of re-asking.
          const rows = await qc.fetchQuery({
            queryKey: reaboDataKeys.subscribers(candidate),
            queryFn: () => fetchSubscribers(candidate),
            staleTime: SUBSCRIBER_STALE_TIME,
          });
          for (const row of rows) {
            const id = `${row.numabo}-${row.cabo}`;
            if (!seen.has(id)) {
              seen.add(id);
              found.push(row);
            }
          }
        } catch {
          // A candidate that resolves to nothing is the normal case — it was
          // an amount, a reference, or a number from another operator. Silence
          // is the right outcome; only a total failure is worth reporting.
        }
        setProgress((p) => ({ ...p, resolved: p.resolved + 1 }));
      });

      setSubscribers(found);
      setProgress((p) => ({ ...p, phase: "done" }));
    } catch (error) {
      setProgress((p) => ({
        ...p,
        phase: "done",
        error:
          (error as Error)?.message ??
          "La lecture de la conversation a échoué.",
      }));
    } finally {
      running.current = false;
    }
  }, [conversationId, mergeMessages, qc]);

  return {
    scan,
    reset,
    progress,
    /** Subscribers resolved from the thread, deduplicated. */
    subscribers,
    /** Raw candidates found, whether or not they resolved. */
    decoders,
    isScanning: progress.phase === "reading" || progress.phase === "resolving",
  };
}
