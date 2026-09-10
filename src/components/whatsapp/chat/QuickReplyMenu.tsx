import React, { useEffect, useRef } from 'react';
import { Zap, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QuickReply } from '@/shared/db/quickReplies';

interface QuickReplyMenuProps {
  replies: QuickReply[];
  /** What was typed after the slash, for highlighting the matched part. */
  query: string;
  activeIndex: number;
  onHover: (index: number) => void;
  onPick: (reply: QuickReply) => void;
  onManage: () => void;
}

/**
 * Slash-command palette above the composer, in the shape people already know
 * from editors and CLIs: type `/`, keep typing to narrow, ↑/↓ to move,
 * Enter or Tab to insert.
 *
 * Selection lives in the composer, not here: the textarea keeps focus while
 * the menu is open, so it is the one receiving the key events.
 */
export const QuickReplyMenu: React.FC<QuickReplyMenuProps> = ({
  replies,
  query,
  activeIndex,
  onHover,
  onPick,
  onManage,
}) => {
  const listRef = useRef<HTMLUListElement>(null);

  // Keep the highlighted row in view when navigating with the keyboard.
  useEffect(() => {
    const active = listRef.current?.children[activeIndex] as HTMLElement | undefined;
    active?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  return (
    <div className="absolute bottom-full left-4 right-4 z-50 mb-2 overflow-hidden rounded-xl border border-wa-border bg-white shadow-xl">
      <div className="flex items-center gap-2 border-b border-wa-border px-3 py-1.5">
        <Zap size={13} className="shrink-0 text-wa-teal" />
        <span className="flex-1 text-[11px] font-semibold uppercase tracking-wider text-wa-muted">
          Réponses rapides
        </span>
        <button
          type="button"
          // The textarea must keep focus, otherwise the menu closes before the
          // click lands.
          onMouseDown={(e) => e.preventDefault()}
          onClick={onManage}
          className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] text-wa-teal transition-colors hover:bg-wa-hover"
        >
          <Settings2 size={12} />
          Gérer
        </button>
      </div>

      {replies.length === 0 ? (
        <p className="px-3 py-4 text-center text-xs text-wa-muted">
          Aucune réponse rapide pour «&nbsp;/{query}&nbsp;».{' '}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onManage}
            className="text-wa-teal underline underline-offset-2"
          >
            En créer une
          </button>
        </p>
      ) : (
        <ul ref={listRef} role="listbox" className="max-h-64 overflow-y-auto py-1">
          {replies.map((reply, index) => (
            <li
              key={reply.id}
              role="option"
              aria-selected={index === activeIndex}
              onMouseEnter={() => onHover(index)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onPick(reply)}
              className={cn(
                'cursor-pointer px-3 py-2',
                index === activeIndex && 'bg-wa-hover',
              )}
            >
              <div className="flex items-baseline gap-2">
                <span className="shrink-0 font-mono text-[13px] font-medium text-wa-teal">
                  /{reply.shortcut}
                </span>
                {reply.label && (
                  <span className="min-w-0 truncate text-xs text-wa-text">
                    {reply.label}
                  </span>
                )}
              </div>
              <p className="mt-0.5 line-clamp-2 text-xs text-wa-muted">
                {reply.content}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
