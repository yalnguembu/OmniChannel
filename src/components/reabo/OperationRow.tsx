import React, { useState } from "react";
import { ChevronDown, Download, FileText, Loader2, RotateCw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useVerifyOperation } from "@/hooks/useReabo";
import { useSendMedia } from "@/hooks/useWhatsapp";
import { useWhatsAppStore } from "@/store/useWhatsappStore";
import { buildReceiptBlob, toReceiptData } from "@/lib/reaboReceipt";
import {
  fmtFcfa,
  operationStatus,
  operationStatusLabel,
  type Operation,
} from "@/models/reabo.models";
import { TONE_ERROR_TEXT, TONE_STATE } from "./tone";

const Row: React.FC<{ label: string; value?: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div className="flex items-baseline gap-3 py-1">
    <span className="w-28 shrink-0 text-xs text-wa-muted">{label}</span>
    <span className="min-w-0 break-words text-sm text-wa-text">{value || "—"}</span>
  </div>
);

const RowAction: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  hint?: string;
}> = ({ icon, label, onClick, disabled, hint }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={hint}
    className={cn(
      "flex items-center gap-1.5 rounded-full border border-wa-border px-3 py-1.5 text-xs text-wa-text transition-colors",
      disabled ? "opacity-45" : "hover:bg-wa-hover",
    )}
  >
    {icon}
    {label}
  </button>
);

/**
 * One transaction of a decoder.
 *
 * The status drives both the colour and what can be done: a successful
 * operation has a receipt to hand the customer, a failed or draft one has a
 * settlement to re-check. The label itself stays the API's own wording — if the
 * platform invents a state tomorrow, the agent reads it rather than seeing it
 * silently folded into "brouillon".
 */
export const OperationRow: React.FC<{ op: Operation }> = ({ op }) => {
  const [open, setOpen] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);

  const status = operationStatus(op);
  const label = operationStatusLabel(op);

  const activeConv = useWhatsAppStore((s) => s.getActiveConversation());
  const sendMedia = useSendMedia();
  const verify = useVerifyOperation();

  const receiptName = `recu-${op.transReferenceInterne || op.operId || "reabo"}.pdf`;

  const buildFile = async (): Promise<File> => {
    const blob = await buildReceiptBlob(toReceiptData(op, fmtFcfa));
    return new File([blob], receiptName, { type: "application/pdf" });
  };

  const onDownload = async () => {
    setIsBuilding(true);
    try {
      const file = await buildFile();
      const url = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = url;
      a.download = receiptName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      // Revoked on the next tick so the download has picked the blob up.
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch (e) {
      toast.error((e as Error)?.message ?? "Facture impossible à générer");
    } finally {
      setIsBuilding(false);
    }
  };

  const onSendToCustomer = async () => {
    const to = activeConv?.contactAddress ?? "";
    if (!to) {
      toast.error("Aucune conversation active pour envoyer la facture.");
      return;
    }
    setIsBuilding(true);
    try {
      const file = await buildFile();
      await sendMedia.mutateAsync({
        to,
        items: [{ file, caption: `Reçu de paiement — ${fmtFcfa(op.operAmount ?? op.transAmount ?? null)}` }],
      });
    } catch (e) {
      toast.error((e as Error)?.message ?? "Envoi de la facture impossible");
    } finally {
      setIsBuilding(false);
    }
  };

  const onRelaunch = async () => {
    if (op.operId == null) return;
    try {
      await verify.mutateAsync(op.operId);
      toast.success("Opération relancée — statut mis à jour");
    } catch (e) {
      toast.error((e as Error)?.message ?? "Relance impossible");
    }
  };

  return (
    <li className="border-b border-wa-border/60 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 py-2 text-left"
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm text-wa-text">
            {op.operArticles || op.operOperationType || "Opération"}
          </span>
          <span className="block truncate text-xs text-wa-muted">
            {op.operCreateDate}
          </span>
        </span>
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
            TONE_STATE[status],
          )}
        >
          {label}
        </span>
        <span className="shrink-0 text-sm tabular-nums text-wa-text">
          {fmtFcfa(op.operAmount ?? op.transAmount ?? null)}
        </span>
        <ChevronDown
          size={15}
          className={cn(
            "shrink-0 text-wa-icon transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {/* Every field the agent could need is already on the row, so the
          expansion is local — the API has no per-operation detail call. */}
      {open && (
        <div className="pb-3 pl-1">
          <Row label="Statut" value={label} />
          <Row label="Type" value={op.operOperationType} />
          <Row label="Décodeur" value={op.operNumDecoder} />
          <Row label="Contrat" value={op.operNumContrat || undefined} />
          <Row label="Payeur" value={op.transTelephonePayeur} />
          <Row label="Moyen" value={op.transPaymentMethod} />
          <Row
            label="Frais"
            value={op.transFees != null ? fmtFcfa(op.transFees) : undefined}
          />
          <Row label="Réf. interne" value={op.transReferenceInterne} />
          <Row label="Réf. opérateur" value={op.transReferenceProvider} />
          <Row label="Message" value={op.transMessageProvider} />
          <Row
            label="Abonnement"
            value={
              op.custStartDateAbo || op.custEndDateAbo
                ? `${op.custStartDateAbo ?? "?"} → ${op.custEndDateAbo ?? "?"}`
                : undefined
            }
          />
          <Row label="Vendu par" value={op.usersFullName} />

          <div className="flex flex-wrap gap-2 pt-2">
            {status === "success" ? (
              <>
                <RowAction
                  icon={
                    isBuilding ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Download size={14} />
                    )
                  }
                  label="Facture"
                  disabled={isBuilding}
                  onClick={onDownload}
                />
                <RowAction
                  icon={
                    isBuilding || sendMedia.isPending ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <FileText size={14} />
                    )
                  }
                  label="Envoyer au client"
                  disabled={isBuilding || sendMedia.isPending || !activeConv}
                  onClick={onSendToCustomer}
                />
              </>
            ) : (
              <RowAction
                icon={
                  verify.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <RotateCw size={14} />
                  )
                }
                label="Relancer l'opération"
                disabled={op.operId == null || verify.isPending}
                hint={
                  op.operId == null
                    ? "Identifiant d'opération absent de cette liste"
                    : undefined
                }
                onClick={onRelaunch}
              />
            )}
          </div>

          {status !== "success" && op.operId == null && (
            <p className={cn("pt-1.5 text-xs", TONE_ERROR_TEXT)}>
              Relance indisponible : cette liste ne porte pas l'identifiant de
              l'opération.
            </p>
          )}
        </div>
      )}
    </li>
  );
};
