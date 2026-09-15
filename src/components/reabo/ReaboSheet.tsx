import React, { useEffect } from "react";
import { ArrowLeft, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TONE_PRIMARY } from "./tone";

interface ReaboSheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  /** Set on a sub-step: the leading control becomes a back arrow. */
  onBack?: () => void;
  /** Pinned under the scrolling body — where the committing action lives. */
  footer?: React.ReactNode;
  /** Desktop drawer width, in px. */
  width?: number;
}

const DEFAULT_WIDTH = 420;

/**
 * The surface every Reabo flow opens into.
 *
 * Mobile first: a bottom sheet, because that is where a thumb already is and
 * because a centred dialog on a phone covers the very conversation the agent is
 * reading to fill it in. On desktop the same content docks to the right edge,
 * like the conversation's own details panel — the agent keeps the thread in
 * view while they work.
 *
 * It is deliberately *not* {@link ../whatsapp/shared/SidePanel}: that one is a
 * flex sibling of the chat column and can only be rendered from the chat
 * layout, while these flows open from inside the details panel, from a card, or
 * from a number in a message.
 */
export const ReaboSheet: React.FC<ReaboSheetProps> = ({
  open,
  title,
  onClose,
  children,
  onBack,
  footer,
  width = DEFAULT_WIDTH,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const header = (
    <div className="flex shrink-0 items-center gap-3 border-b border-wa-border bg-wa-header px-4 py-3.5">
      <button
        type="button"
        onClick={onBack ?? onClose}
        aria-label={onBack ? "Retour" : "Fermer"}
        className="flex size-9 shrink-0 items-center justify-center rounded-full text-wa-icon transition-colors hover:bg-wa-active"
      >
        {onBack ? <ArrowLeft size={20} /> : <X size={20} />}
      </button>
      <h2 className="min-w-0 flex-1 truncate text-base font-medium text-wa-text">
        {title}
      </h2>
      {onBack && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-wa-icon transition-colors hover:bg-wa-active"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );

  const body = (
    <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-color:rgba(0,0,0,0.2)_transparent] [scrollbar-width:thin]">
      {children}
    </div>
  );

  const foot = footer ? (
    <div className="shrink-0 border-t border-wa-border bg-white px-4 py-3">
      {footer}
    </div>
  ) : null;

  return (
    <AnimatePresence>
      {open && (
        <React.Fragment key="reabo-sheet">
          <motion.div
            className="fixed inset-0 z-[950] bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
          />

          {/* ── Mobile: bottom sheet ── */}
          <motion.div
            role="dialog"
            aria-label={title}
            className="fixed inset-x-0 bottom-0 z-[951] flex max-h-[88dvh] flex-col overflow-hidden rounded-t-2xl bg-white md:hidden"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
          >
            <div className="flex justify-center pt-2">
              <span className="h-1 w-9 rounded-full bg-wa-border" />
            </div>
            {header}
            {body}
            {foot}
          </motion.div>

          {/* ── Desktop: right drawer ── */}
          <motion.aside
            role="dialog"
            aria-label={title}
            style={{ width }}
            className="fixed inset-y-0 right-0 z-[951] hidden flex-col border-l border-wa-border bg-white md:flex"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
          >
            {header}
            {body}
            {foot}
          </motion.aside>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
};

/**
 * Committing action of a sheet — the feature's teal, never the framework's
 * default blue, so the accent here is the accent of the app it lives in.
 */
export const ReaboPrimaryButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ className, children, ...props }) => (
  <button
    type="button"
    {...props}
    className={cn(
      "flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5",
      "text-sm font-medium transition-colors disabled:cursor-not-allowed",
      TONE_PRIMARY,
      className,
    )}
  >
    {children}
  </button>
);

/** Secondary action — same shape, quiet fill. */
export const ReaboGhostButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ className, children, ...props }) => (
  <button
    type="button"
    {...props}
    className={cn(
      "flex items-center justify-center gap-2 rounded-full px-4 py-2.5",
      "text-sm font-medium text-wa-text transition-colors",
      "hover:bg-wa-hover disabled:opacity-50",
      className,
    )}
  >
    {children}
  </button>
);
