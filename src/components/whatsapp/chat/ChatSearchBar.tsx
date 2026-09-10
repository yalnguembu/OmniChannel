import React, { useEffect, useRef, useState } from 'react';
import { Search, X, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { DatePicker } from '../shared/DatePicker';

interface ChatSearchBarProps {
  visible: boolean;
  value: string;
  onChange: (v: string) => void;
  onClose: () => void;
  /** Number of messages matching the term across everything loaded. */
  matchCount: number;
  /** 1-based position of the focused hit, counted from the most recent. */
  activePosition: number;
  /** An older hit exists, or an older page can still be pulled in. */
  canGoOlder: boolean;
  canGoNewer: boolean;
  onPrevMatch: () => void;
  onNextMatch: () => void;
  /** Older pages are being pulled in looking for a match. */
  isSearchingOlder?: boolean;
  /** Scroll to the first message of `yyyy-mm-dd`; false when there is none. */
  onJumpToDate: (day: string) => Promise<boolean>;
  isJumpingToDate?: boolean;
}

export const ChatSearchBar: React.FC<ChatSearchBarProps> = ({
  visible,
  value,
  onChange,
  onClose,
  matchCount,
  activePosition,
  canGoOlder,
  canGoNewer,
  onPrevMatch,
  onNextMatch,
  isSearchingOlder = false,
  onJumpToDate,
  isJumpingToDate = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [day, setDay] = useState('');

  useEffect(() => {
    if (visible) inputRef.current?.focus();
  }, [visible]);

  const handleDay = async (next: string) => {
    setDay(next);
    if (!next) return;
    const found = await onJumpToDate(next);
    if (!found) {
      toast.info('Aucun message à cette date dans cette conversation');
    }
  };

  // Enter walks backwards through hits (most recent first), Shift+Enter forward
  // — the same direction WhatsApp uses for its up/down chevrons.
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) onNextMatch();
      else onPrevMatch();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const hasTerm = !!value.trim();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="bg-wa-input-bg border-b border-wa-border overflow-hidden shrink-0"
        >
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2">
            {/* Term */}
            <div className="flex flex-1 min-w-52 items-center gap-2">
              <Search size={16} className="text-wa-icon shrink-0" />
              <input
                ref={inputRef}
                type="search"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Rechercher dans la conversation..."
                className="flex-1 min-w-0 bg-transparent outline-none border-none text-sm text-wa-text placeholder:text-wa-muted"
              />
            </div>

            {/* Hit counter + navigation */}
            {hasTerm && (
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-xs text-wa-muted tabular-nums min-w-14 text-right">
                  {isSearchingOlder ? (
                    <span className="inline-flex items-center gap-1">
                      <Loader2 size={12} className="animate-spin" />
                      …
                    </span>
                  ) : matchCount > 0 ? (
                    `${activePosition} / ${matchCount}`
                  ) : (
                    'aucun'
                  )}
                </span>
                <button
                  onClick={onPrevMatch}
                  disabled={!canGoOlder}
                  aria-label="Résultat plus ancien"
                  title="Résultat plus ancien (Entrée)"
                  className="p-1 rounded-full text-wa-icon hover:bg-wa-active disabled:opacity-35 disabled:hover:bg-transparent transition-colors"
                >
                  <ChevronUp size={17} />
                </button>
                <button
                  onClick={onNextMatch}
                  disabled={!canGoNewer}
                  aria-label="Résultat plus récent"
                  title="Résultat plus récent (Maj+Entrée)"
                  className="p-1 rounded-full text-wa-icon hover:bg-wa-active disabled:opacity-35 disabled:hover:bg-transparent transition-colors"
                >
                  <ChevronDown size={17} />
                </button>
              </div>
            )}

            {/* Jump to a date */}
            <DatePicker
              value={day}
              onChange={handleDay}
              placeholder="Aller à une date"
              align="right"
              disabled={isJumpingToDate}
              busy={isJumpingToDate}
              className="shrink-0"
            />

            <button
              onClick={onClose}
              aria-label="Fermer la recherche"
              className="shrink-0 text-wa-icon hover:text-wa-text transition-colors p-1 rounded-full hover:bg-wa-active"
            >
              <X size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
