import React from "react";
import { Loader2 } from "lucide-react";
import { ReaboSheet, ReaboPrimaryButton, ReaboGhostButton } from "./ReaboSheet";

interface ConfirmActionDialogProps {
  open: boolean;
  title: string;
  /** What is about to happen, in the agent's words. */
  description: React.ReactNode;
  /** Key facts of the target, spelled out so a wrong target is obvious. */
  facts?: Array<[string, React.ReactNode]>;
  confirmLabel: string;
  isPending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * Confirmation before an action that reaches the customer's equipment or money.
 *
 * It exists to make the *target* visible, not to add a click: the risk in this
 * inbox is not a mistyped intent, it is running the right operation against the
 * wrong subscriber. Hence the facts list rather than a bare "are you sure?".
 */
export const ConfirmActionDialog: React.FC<ConfirmActionDialogProps> = ({
  open,
  title,
  description,
  facts = [],
  confirmLabel,
  isPending = false,
  onConfirm,
  onClose,
}) => (
  <ReaboSheet
    open={open}
    title={title}
    onClose={() => !isPending && onClose()}
    footer={
      <div className="flex items-center gap-2">
        <ReaboGhostButton onClick={onClose} disabled={isPending} className="flex-1">
          Annuler
        </ReaboGhostButton>
        <ReaboPrimaryButton onClick={onConfirm} disabled={isPending} className="flex-1">
          {isPending && <Loader2 className="size-4 animate-spin" />}
          {confirmLabel}
        </ReaboPrimaryButton>
      </div>
    }
  >
    <div className="px-4 py-4">
      <p className="text-sm text-wa-text">{description}</p>

      {facts.length > 0 && (
        <dl className="mt-3 rounded-lg border border-wa-border px-3 py-2">
          {facts.map(([label, value]) => (
            <div key={label} className="flex items-baseline gap-3 py-1">
              <dt className="w-28 shrink-0 text-xs text-wa-muted">{label}</dt>
              <dd className="min-w-0 break-words text-sm text-wa-text">
                {value || "—"}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  </ReaboSheet>
);
