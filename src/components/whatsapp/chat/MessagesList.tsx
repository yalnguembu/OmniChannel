import React, { useEffect, useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Loader2 } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import type { MessageViewModel } from '@/hooks/chatViewModel';

interface MessagesListProps {
  vms: MessageViewModel[];
  isLoading: boolean;
  onReply: (vm: MessageViewModel) => void;
  onInfo: (id: string) => void;
  onImageClick: (url: string, alt: string) => void;
}

// ─── Row types ────────────────────────────────────────────────────────────────

type DateRow = { type: 'sep'; label: string };
type MsgRow  = { type: 'msg'; vm: MessageViewModel };
type Row = DateRow | MsgRow;

function formatDateSep(ts: string | null | undefined): string {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return 'Hier';
  if (diff < 7) return d.toLocaleDateString('fr-FR', { weekday: 'long' });
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

// ─── Component ────────────────────────────────────────────────────────────────

export const MessagesList: React.FC<MessagesListProps> = ({
  vms,
  isLoading,
  onReply,
  onInfo,
  onImageClick,
}) => {
  const parentRef = useRef<HTMLDivElement>(null);

  // Build a flat array interleaving date separators and message rows
  const rows = useMemo<Row[]>(() => {
    const result: Row[] = [];
    let lastDate = '';
    for (const vm of vms) {
      const ts = vm.rawMessage.sentAt || vm.rawMessage.receivedAt || vm.rawMessage.createdAt;
      const label = formatDateSep(ts);
      if (label && label !== lastDate) {
        lastDate = label;
        result.push({ type: 'sep', label });
      }
      result.push({ type: 'msg', vm });
    }
    return result;
  }, [vms]);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (i) => {
      const row = rows[i];
      if (!row || row.type === 'sep') return 32;
      if (row.vm.medias && row.vm.medias.length > 0) return 300;
      return 72;
    },
    overscan: 6,
    getItemKey: (i) => {
      const row = rows[i];
      if (!row) return i;
      return row.type === 'sep' ? `sep-${row.label}` : `msg-${row.vm.id}`;
    },
  });

  // Auto-scroll to bottom when new messages arrive or conversation first loads.
  // Uses vms.length so date-separator-only changes don't trigger a scroll.
  useEffect(() => {
    if (rows.length === 0) return;
    // requestAnimationFrame ensures the virtualizer has computed item positions
    requestAnimationFrame(() => {
      virtualizer.scrollToIndex(rows.length - 1, { align: 'end', behavior: 'auto' });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vms.length]);

  return (
    <div
      ref={parentRef}
      className="flex-1 overflow-y-auto px-[5%] [scrollbar-width:thin] [scrollbar-color:rgba(0,0,0,0.15)_transparent]"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-wa-green" />
        </div>
      ) : vms.length === 0 ? (
        <div className="text-center text-wa-muted text-sm py-12">Aucun message</div>
      ) : (
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const row = rows[virtualItem.index];
            return (
              <div
                key={virtualItem.key}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                {row.type === 'sep' ? (
                  <div className="flex justify-center py-2">
                    <span className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-lg text-xs text-wa-icon shadow-sm">
                      {row.label}
                    </span>
                  </div>
                ) : (
                  <MessageBubble
                    vm={row.vm}
                    onReply={onReply}
                    onInfo={onInfo}
                    onImageClick={onImageClick}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
