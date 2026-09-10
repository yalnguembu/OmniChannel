import React, { useEffect } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SidePanelProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  /** Set on a sub-view: the leading button becomes a back arrow. */
  onBack?: () => void;
  /** Trailing control in the header bar (WhatsApp puts the edit pencil there). */
  headerAction?: React.ReactNode;
  /** Pinned below the scrolling body — the panel's primary action. */
  footer?: React.ReactNode;
  /** Desktop drawer width, in px. */
  width?: number;
}

const DEFAULT_WIDTH = 400;
/** Past this drag distance (or flick speed) the sheet is dismissed. */
const DISMISS_OFFSET = 120;
const DISMISS_VELOCITY = 600;

/**
 * The detail surface WhatsApp and Telegram both use: a drawer docked to the
 * right of the conversation on desktop, and a bottom sheet on mobile.
 *
 * On desktop it is a real flex sibling of the chat column (not an overlay), so
 * opening it narrows the conversation instead of covering it — that is what
 * makes it read as part of the layout rather than as a modal. On mobile it
 * slides up over the chat, dimming it, and can be flicked back down.
 */
export const SidePanel: React.FC<SidePanelProps> = ({
  open,
  title,
  onClose,
  children,
  onBack,
  headerAction,
  footer,
  width = DEFAULT_WIDTH,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const header = (
    <div className="flex items-center gap-3 border-b border-wa-border bg-wa-header px-4 py-3.5 shrink-0">
      <button
        type="button"
        onClick={onBack ?? onClose}
        aria-label={onBack ? 'Retour' : 'Fermer'}
        className="size-9 shrink-0 rounded-full flex items-center justify-center text-wa-icon hover:bg-wa-active transition-colors"
      >
        {onBack ? <ArrowLeft size={20} /> : <X size={20} />}
      </button>
      <h2 className="flex-1 min-w-0 text-base font-medium text-wa-text truncate">
        {title}
      </h2>
      {!onBack && headerAction}
      {/* On a sub-view the leading control goes back, so closing the whole
          panel needs its own way out. */}
      {onBack && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="size-9 shrink-0 rounded-full flex items-center justify-center text-wa-icon hover:bg-wa-active transition-colors"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );

  const body = (
    <div className="flex-1 min-h-0 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:rgba(0,0,0,0.2)_transparent]">
      {children}
    </div>
  );

  const foot = footer ? (
    <div className="border-t border-wa-border bg-white px-4 py-3 shrink-0">{footer}</div>
  ) : null;

  return (
    <>
      {/* ── Desktop: docked drawer ── */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.aside
            key="side-panel"
            initial={{ width: 0 }}
            animate={{ width }}
            exit={{ width: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="hidden md:flex shrink-0 flex-col overflow-hidden border-l border-wa-border bg-white"
          >
            {/* Fixed inner width: without it the content would reflow on every
                animation frame while the drawer expands. */}
            <div style={{ width }} className="flex h-full flex-col">
              {header}
              {body}
              {foot}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Mobile: bottom sheet ── */}
      <AnimatePresence>
        {open && (
          <React.Fragment key="sheet">
            <motion.div
              className="md:hidden fixed inset-0 z-[900] bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={onClose}
            />
            <motion.div
              role="dialog"
              aria-label={title}
              className={cn(
                'md:hidden fixed inset-x-0 bottom-0 z-[901] flex max-h-[85dvh] flex-col',
                'rounded-t-2xl bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.22)]',
              )}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 320 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.4 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > DISMISS_OFFSET || info.velocity.y > DISMISS_VELOCITY) {
                  onClose();
                }
              }}
            >
              {/* Grab handle — also the drag affordance */}
              <div className="flex justify-center pt-2.5 pb-1 shrink-0 cursor-grab active:cursor-grabbing">
                <span className="h-1 w-10 rounded-full bg-black/20" />
              </div>
              {header}
              {body}
              {foot}
            </motion.div>
          </React.Fragment>
        )}
      </AnimatePresence>
    </>
  );
};
