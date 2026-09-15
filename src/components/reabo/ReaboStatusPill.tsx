import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { useReaboAuth } from "@/hooks/useReaboAuth";
import { ReaboConnectionSheet } from "./ReaboConnectionSheet";
import { TONE_DOT } from "./tone";

const TONE = {
  connected: {
    dot: TONE_DOT.connected,
    label: "Reabo",
    title: (name: string) => `Connecté à Reabo — ${name}`,
  },
  expired: {
    dot: TONE_DOT.expired,
    label: "Reabo expiré",
    title: () => "Session Reabo expirée — cliquez pour vous reconnecter",
  },
  disconnected: {
    dot: TONE_DOT.disconnected,
    label: "Reabo",
    title: () => "Non connecté à Reabo — cliquez pour configurer",
  },
} as const;

/**
 * Permanent connection indicator, in the inbox header.
 *
 * It is always visible for one reason: every réabonnement action depends on
 * this session, and an agent must never discover it lapsed at the moment they
 * take a customer's money. The dot carries the state, the click opens the
 * connection panel.
 */
export const ReaboStatusPill: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { status, account } = useReaboAuth();
  const tone = TONE[status];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={tone.title(account?.name ?? "")}
        aria-label={tone.title(account?.name ?? "")}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
          "text-wa-icon hover:bg-wa-active transition-colors whitespace-nowrap",
        )}
      >
        <span className={cn("size-2 rounded-full shrink-0", tone.dot)} />
        {tone.label}
      </button>

      <ReaboConnectionSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
};
