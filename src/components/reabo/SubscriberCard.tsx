import React, { useState } from "react";
import {
  ArrowUpCircle,
  CalendarPlus,
  ChevronDown,
  Link2,
  Loader2,
  Lock,
  ReceiptText,
  RefreshCw,
  Tv,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  useSubscriptionDetails,
  useReaboOperations,
  useReactivateDecoder,
} from "@/hooks/useReabo";
import { useWhatsAppStore } from "@/store/useWhatsappStore";
import { reactivationMessage } from "@/lib/reaboMessages";
import { ConfirmActionDialog } from "./ConfirmActionDialog";
import { OperationRow } from "./OperationRow";
import {
  OperationSearchBar,
  type OperationFilters,
} from "./OperationSearchBar";
import {
  ReaboOperationSheet,
  type ReaboOperationMode,
} from "./ReaboOperationSheet";
import { TONE_ERROR_TEXT, TONE_STATE } from "./tone";
import {
  defaultOperationRange,
  expiryLabel,
  isSubscriptionActive,
  parseFrDate,
  subscriberName,
  subscriptionKey,
  type Subscriber,
} from "@/models/reabo.models";

/** Label/value line, aligned like the rest of the details panel. */
const Row: React.FC<{ label: string; value?: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div className="flex items-baseline gap-3 py-1">
    <span className="w-28 shrink-0 text-xs text-wa-muted">{label}</span>
    <span className="min-w-0 break-words text-sm text-wa-text">{value || "—"}</span>
  </div>
);

/** One row of the action list. */
const Action: React.FC<{
  icon: React.ReactNode;
  label: string;
  hint?: string;
  disabled?: boolean;
  onClick?: () => void;
  trailing?: React.ReactNode;
}> = ({ icon, label, hint, disabled, onClick, trailing }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors",
      disabled ? "opacity-45" : "hover:bg-wa-hover",
    )}
  >
    <span className="shrink-0 text-wa-icon">{icon}</span>
    <span className="min-w-0 flex-1">
      <span className="block truncate text-sm text-wa-text">{label}</span>
      {hint && <span className="block text-xs text-wa-muted">{hint}</span>}
    </span>
    {trailing}
  </button>
);

interface SubscriberCardProps {
  subscriber: Subscriber;
  /** Open on mount — used when the search returned a single subscriber. */
  defaultOpen?: boolean;
}

/**
 * One subscriber found for this conversation.
 *
 * Collapsed it shows only what tells the agent whether to act: who, which
 * package, and how long before it lapses. The subscription and the transactions
 * each load on their own expansion — never on render, so opening the panel costs
 * exactly one search.
 */
export const SubscriberCard: React.FC<SubscriberCardProps> = ({
  subscriber,
  defaultOpen = false,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const [showOps, setShowOps] = useState(false);
  const [opsFilters, setOpsFilters] = useState<OperationFilters | null>(null);
  const [confirmReactivate, setConfirmReactivate] = useState(false);
  const [sheetMode, setSheetMode] = useState<ReaboOperationMode | null>(null);

  const key = subscriptionKey(subscriber);
  const active = isSubscriptionActive(subscriber.finabo);

  const details = useSubscriptionDetails(
    key?.numabo ?? null,
    key?.subscriptionNumber ?? null,
    open,
  );
  const decoder = details.data?.numdecabo ?? null;
  /**
   * The search starts on the decoder and the agent widens it from there. It is
   * derived rather than stored until they touch it, so a card opened on another
   * subscriber does not inherit the previous one's filters.
   */
  const filters: OperationFilters = opsFilters ?? {
    term: decoder ?? "",
    count: 10,
    // The subscription's own start anchors the range when it predates the
    // default floor — an abonné of ten years still gets their whole history.
    ...defaultOperationRange(parseFrDate(subscriber.debabo)),
  };
  const operations = useReaboOperations(
    filters.term,
    { nbOper: filters.count, startDate: filters.from, endDate: filters.to },
    showOps,
  );

  const setComposerDraft = useWhatsAppStore((s) => s.setComposerDraft);
  const reactivate = useReactivateDecoder();

  const onReactivate = async () => {
    if (!key) return;
    try {
      await reactivate.mutateAsync(key);
      setConfirmReactivate(false);
      toast.success("Réactivation lancée");
      // The agent reads and sends: the operation is done, telling the customer
      // what to do next is still a human decision.
      setComposerDraft(
        reactivationMessage({
          name: details.data?.prenomabo || subscriber.prenomabo,
          decoder,
        }),
      );
    } catch (error) {
      toast.error((error as Error)?.message ?? "Réactivation impossible");
    }
  };

  return (
    <div className="bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-wa-hover"
      >
        <Tv size={19} className="mt-0.5 shrink-0 text-wa-icon" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-wa-text">
            {subscriberName(subscriber)}
          </p>
          <p className="truncate text-xs text-wa-muted">
            {subscriber.optionmajeureabo || "Formule inconnue"}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
            active
              ? TONE_STATE.success
              : TONE_STATE.failed,
          )}
        >
          {expiryLabel(subscriber.finabo)}
        </span>
        <ChevronDown
          size={16}
          className={cn(
            "mt-0.5 shrink-0 text-wa-icon transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="px-4 pb-3">
          {!key && (
            <p className={cn("text-sm", TONE_ERROR_TEXT)}>
              Cet abonné n’a pas de code (cabo) : son abonnement ne peut pas être
              ouvert.
            </p>
          )}

          {key && details.isLoading && (
            <p className="flex items-center gap-2 py-2 text-sm text-wa-muted">
              <Loader2 size={14} className="animate-spin" />
              Chargement de l’abonnement…
            </p>
          )}

          {key && details.isError && (
            <p className={cn("py-2 text-sm", TONE_ERROR_TEXT)}>
              {(details.error as Error)?.message ??
                "Abonnement indisponible pour le moment."}
            </p>
          )}

          {details.data && (
            <>
              <Row label="Décodeur" value={details.data.numdecabo} />
              <Row label="Contrat" value={details.data.numeroContrat || undefined} />
              <Row label="Offre en cours" value={details.data.offreLibelleLC} />
              <Row label="Activité" value={details.data.activiteLC} />
              {/* The subscription period is the réabo pair — `admin-web` maps
                  its own start/end dates from those two. The `LC` pair is the
                  last contract and is often empty, so it only shows when the
                  API actually filled it. */}
              <Row
                label="Période"
                value={
                  details.data.dateDebutReabo || details.data.dateFinReabo
                    ? `${details.data.dateDebutReabo ?? "?"} → ${details.data.dateFinReabo ?? "?"}`
                    : undefined
                }
              />
              {(details.data.dateDebutLC || details.data.dateFinLC) && (
                <Row
                  label="Dernier contrat"
                  value={`${details.data.dateDebutLC ?? "?"} → ${details.data.dateFinLC ?? "?"}`}
                />
              )}
              <Row label="Téléphone" value={details.data.telephoneAbonne} />
              {/* The distributor's name is frequently blank; its number is not,
                  and it is what identifies the point of sale. */}
              <Row
                label="Distributeur"
                value={
                  [details.data.nomdistLC, details.data.numdistLC]
                    .map((v) => (v ?? "").trim())
                    .filter(Boolean)
                    .join(" · ") || undefined
                }
              />

              <div className="mt-2 border-t border-wa-border pt-2">
                <Action
                  icon={<CalendarPlus size={18} />}
                  label="Réabonner"
                  onClick={() => setSheetMode("reabo")}
                />
                <Action
                  icon={<ArrowUpCircle size={18} />}
                  label="Changer d'offre"
                  hint="Upgrade, ajout ou retrait d'option"
                  onClick={() => setSheetMode("upgrade")}
                />
                <Action
                  icon={<Link2 size={18} />}
                  label="Envoyer un lien de paiement"
                  hint="Le client paie lui-même"
                  onClick={() => setSheetMode("paylink")}
                />
                <Action
                  icon={
                    reactivate.isPending ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <RefreshCw size={18} />
                    )
                  }
                  label="Réactiver les images"
                  disabled={!key || reactivate.isPending}
                  onClick={() => setConfirmReactivate(true)}
                />
                <Action
                  icon={<Lock size={18} />}
                  label="Réinitialiser le code parental"
                  hint="Pas encore disponible côté API"
                  disabled
                />
                <Action
                  icon={<ReceiptText size={18} />}
                  label="Transactions"
                  disabled={!decoder}
                  onClick={() => setShowOps((v) => !v)}
                  trailing={
                    <ChevronDown
                      size={15}
                      className={cn(
                        "shrink-0 text-wa-icon transition-transform",
                        showOps && "rotate-180",
                      )}
                    />
                  }
                />
              </div>

              {showOps && (
                <div className="pl-2">
                  <OperationSearchBar value={filters} onChange={setOpsFilters} />
                  {operations.isLoading && (
                    <p className="flex items-center gap-2 py-2 text-sm text-wa-muted">
                      <Loader2 size={14} className="animate-spin" />
                      Chargement…
                    </p>
                  )}
                  {operations.isError && (
                    <p className={cn("py-2 text-sm", TONE_ERROR_TEXT)}>
                      {(operations.error as Error)?.message ??
                        "Transactions indisponibles."}
                    </p>
                  )}
                  {operations.data?.length === 0 && (
                    <p className="py-2 text-sm text-wa-muted">
                      Aucune transaction pour{" "}
                      <span className="text-wa-text">{filters.term}</span>
                      {filters.from || filters.to ? " sur cette période" : ""}.
                    </p>
                  )}
                  {!!operations.data?.length && (
                    <ul>
                      {operations.data.map((op, i) => (
                        <OperationRow
                          key={op.transReferenceInterne ?? `${op.operCreateDate}-${i}`}
                          op={op}
                        />
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <ReaboOperationSheet
                open={sheetMode !== null}
                mode={sheetMode ?? "paylink"}
                onClose={() => setSheetMode(null)}
                details={details.data}
              />
            </>
          )}
        </div>
      )}

      <ConfirmActionDialog
        open={confirmReactivate}
        title="Réactiver les images"
        description="Les droits du décodeur vont être renvoyés. L'abonné devra éteindre puis rallumer son décodeur."
        facts={[
          ["Abonné", subscriberName(subscriber)],
          ["Décodeur", decoder],
          ["N° abonné", subscriber.numabo],
          ["Offre", details.data?.offreLibelleLC ?? subscriber.optionmajeureabo],
        ]}
        confirmLabel="Réactiver"
        isPending={reactivate.isPending}
        onConfirm={onReactivate}
        onClose={() => setConfirmReactivate(false)}
      />
    </div>
  );
};
