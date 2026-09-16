import React, { useMemo, useState } from "react";
import { Loader2, Search, Satellite, ScanLine } from "lucide-react";
import { useReaboAuth } from "@/hooks/useReaboAuth";
import { useReaboSubscribers } from "@/hooks/useReabo";
import { useDecoderScan } from "@/hooks/useDecoderScan";
import { useWhatsAppStore } from "@/store/useWhatsappStore";
import { SubscriberCard } from "./SubscriberCard";
import { ReaboConnectionSheet } from "./ReaboConnectionSheet";
import { useReaboEnabled } from "./ReaboEntityContext";
import type { Subscriber } from "@/models/reabo.models";
import { TONE_ERROR_TEXT } from "./tone";

interface ReaboSubscriptionSectionProps {
  /** The conversation's WhatsApp number, in whatever form the API returned it. */
  phone?: string | null;
}

/**
 * The panel's own section separator, reproduced here.
 *
 * The section carries its own trailing band rather than being framed by two in
 * the panel: outside `/wareabo` it renders nothing, and a pair of separators
 * left behind would show as one double-height grey strip in the plain inbox.
 */
const Band = () => <div className="h-2 bg-wa-hover" />;

/** Same subscriber found twice (by phone and by scan) must appear once. */
function mergeSubscribers(...lists: Subscriber[][]): Subscriber[] {
  const seen = new Set<string>();
  const merged: Subscriber[] = [];
  for (const list of lists) {
    for (const s of list) {
      const id = `${s.numabo}-${s.cabo}`;
      if (!seen.has(id)) {
        seen.add(id);
        merged.push(s);
      }
    }
  }
  return merged;
}

/**
 * ReaboCanal subscriptions attached to this conversation.
 *
 * Mounted only when the details panel opens — `SidePanel` does not render its
 * children while closed — so opening a conversation to answer "bonjour" costs
 * nothing. From there one search runs on the conversation's number; everything
 * deeper waits for the agent.
 *
 * The customer's identity is already on the CRM record above; what this section
 * adds is the state of their subscription.
 */
export const ReaboSubscriptionSection: React.FC<ReaboSubscriptionSectionProps> = ({
  phone,
}) => {
  const enabled = useReaboEnabled();
  const { status } = useReaboAuth();
  const activeConversationId = useWhatsAppStore((s) => s.activeConversationId);
  const [connectOpen, setConnectOpen] = useState(false);
  const [manualTerm, setManualTerm] = useState("");
  const [submittedTerm, setSubmittedTerm] = useState<string | null>(null);

  /**
   * The declared subscriber phone is rarely the number writing on WhatsApp, so
   * the automatic attempt uses the conversation's number as-is and the agent
   * takes over with a decoder number, a name, or the thread scan.
   */
  const term = useMemo(
    () => submittedTerm ?? (phone ?? "").trim(),
    [submittedTerm, phone],
  );

  // `enabled` gates the query, not just the markup: an agent with a live Reabo
  // session browsing the plain `/wa` inbox must not fire a lookup for a section
  // that will not be rendered.
  const query = useReaboSubscribers(term, enabled && status === "connected");
  const { scan, progress, subscribers: scanned, isScanning } =
    useDecoderScan(activeConversationId);

  const subscribers = useMemo(
    () => mergeSubscribers(query.data ?? [], scanned),
    [query.data, scanned],
  );

  // The details panel is shared with the plain `/wa` inbox, where this section
  // simply does not exist.
  if (!enabled) return null;

  if (status !== "connected") {
    return (
      <>
        <div className="bg-white px-4 py-3.5">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-wa-muted">
            Abonnement Reabo
          </p>
          <button
            type="button"
            onClick={() => setConnectOpen(true)}
            className="flex w-full items-center gap-3 rounded-md border border-wa-border px-3 py-2.5 text-left transition-colors hover:bg-wa-hover"
          >
            <Satellite size={18} className="shrink-0 text-wa-icon" />
            <span className="flex-1 text-sm text-wa-text">
              {status === "expired"
                ? "Session Reabo expirée — se reconnecter"
                : "Se connecter à Reabo"}
            </span>
          </button>
        </div>
        <Band />
        <ReaboConnectionSheet
          open={connectOpen}
          onClose={() => setConnectOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="bg-white">
      <div className="flex items-center gap-2 px-4 pt-3.5">
        <p className="flex-1 text-xs font-medium uppercase tracking-wide text-wa-muted">
          Abonnement Reabo
        </p>
        {query.isFetching && (
          <Loader2 size={14} className="animate-spin text-wa-muted" />
        )}
      </div>

      {query.isError && (
        <p className={`px-4 py-3 text-sm ${TONE_ERROR_TEXT}`}>
          {(query.error as Error)?.message ?? "Recherche indisponible."}
        </p>
      )}

      {!query.isLoading && !query.isError && subscribers.length === 0 && (
        <p className="px-4 pt-2 text-sm text-wa-muted">
          Aucun abonné pour{" "}
          {term ? <span className="text-wa-text">{term}</span> : "ce numéro"}.
        </p>
      )}

      {subscribers.map((s, i) => (
        <SubscriberCard
          key={`${s.numabo}-${s.cabo}-${i}`}
          subscriber={s}
          defaultOpen={subscribers.length === 1}
        />
      ))}

      {/* Scan the thread — the decoders are in the conversation, nowhere else. */}
      <div className="px-4 pt-3">
        <button
          type="button"
          onClick={scan}
          disabled={isScanning || !activeConversationId}
          className="flex w-full items-center gap-3 rounded-md border border-wa-border px-3 py-2.5 text-left transition-colors hover:bg-wa-hover disabled:opacity-60"
        >
          {isScanning ? (
            <Loader2 size={17} className="shrink-0 animate-spin text-wa-icon" />
          ) : (
            <ScanLine size={17} className="shrink-0 text-wa-icon" />
          )}
          <span className="flex-1 text-sm text-wa-text">
            {isScanning ? "Lecture de la conversation…" : "Chercher les décodeurs du fil"}
          </span>
        </button>

        {progress.phase !== "idle" && (
          <p className="pt-1.5 text-xs text-wa-muted">
            {progress.phase === "reading" &&
              `${progress.messagesRead || "…"} messages lus`}
            {progress.phase === "resolving" &&
              `${progress.messagesRead} messages · ${progress.resolved}/${progress.candidates} numéros vérifiés`}
            {progress.phase === "done" && !progress.error && (
              <>
                {progress.messagesRead} messages lus · {progress.candidates} numéro
                {progress.candidates > 1 ? "s" : ""} trouvé
                {progress.candidates > 1 ? "s" : ""}
                {progress.truncated && " (fil tronqué aux 2000 derniers)"}
              </>
            )}
            {progress.error && (
              <span className={TONE_ERROR_TEXT}>{progress.error}</span>
            )}
          </p>
        )}
      </div>

      {/* Always available: the declared phone rarely matches the one writing. */}
      <form
        className="px-4 py-3"
        onSubmit={(e) => {
          e.preventDefault();
          const next = manualTerm.trim();
          if (next) setSubmittedTerm(next);
        }}
      >
        <div className="relative">
          <Search
            size={15}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-wa-icon"
          />
          <input
            id="reabo-manual-search"
            value={manualTerm}
            onChange={(e) => setManualTerm(e.target.value)}
            placeholder="N° décodeur, n° abonné ou nom"
            className="w-full rounded-md border border-wa-border bg-white py-2 pl-8 pr-3 text-sm text-wa-text placeholder:text-wa-muted focus:border-wa-teal focus:outline-none"
          />
        </div>
      </form>

      <Band />
    </div>
  );
};
