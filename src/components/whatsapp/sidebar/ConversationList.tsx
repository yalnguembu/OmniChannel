import React, { useCallback, useEffect, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Loader2 } from 'lucide-react';
import { ConversationItem } from './ConversationItem';
import { SidebarHeader } from './SidebarHeader';
import { StatsStrip } from './StatsStrip';
import { SearchBar } from './SearchBar';
import { useSidebarViewModel } from '@/hooks/sidebarViewModel';
import { useWhatsAppStore } from '@/store/useWhatsappStore';
import type { Filter } from '@/models/whatsapp.models';

interface ConversationListProps {
  onBulkSend: () => void;
  onTemplateBroadcast: () => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  onBulkSend,
  onTemplateBroadcast,
}) => {
  const { setActiveConversationId, setMobileChatOpen } = useWhatsAppStore();
  const {
    conversationVMs,
    statsVM,
    filter,
    search,
    isLoading,
    handleFilterChange,
    handleSearchChange,
    refetchConvs,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSidebarViewModel();

  const parentRef = useRef<HTMLDivElement>(null);

  // Stable select handler — single reference avoids breaking React.memo on items
  const handleSelect = useCallback(
    (id: string) => {
      setActiveConversationId(id);
      setMobileChatOpen(true);
    },
    [setActiveConversationId, setMobileChatOpen]
  );

  // +1 slot for the loading spinner row at the end when fetching next page
  const rowCount = conversationVMs.length + (isFetchingNextPage ? 1 : 0);

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 76,
    overscan: 8,
    getItemKey: (index) =>
      index < conversationVMs.length ? conversationVMs[index].id : `loading-${index}`,
  });

  // Trigger next page when the last real item becomes visible
  const virtualItems = virtualizer.getVirtualItems();
  useEffect(() => {
    if (!virtualItems.length || !hasNextPage || isFetchingNextPage) return;
    const lastVisible = virtualItems[virtualItems.length - 1];
    if (lastVisible.index >= conversationVMs.length - 5) {
      fetchNextPage();
    }
  }, [virtualItems, conversationVMs.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Keyboard shortcut: Ctrl+K or / → focus search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const active = document.activeElement;
      const isInput = active?.tagName === 'INPUT' || active?.tagName === 'TEXTAREA';
      if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !isInput)) {
        e.preventDefault();
        document.getElementById('chat-search-input')?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Arrow key navigation through visible list items
  const handleListKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const items = Array.from(
      e.currentTarget.querySelectorAll<HTMLElement>('[role="listitem"]')
    );
    const idx = items.indexOf(document.activeElement as HTMLElement);
    if (idx !== -1) {
      e.preventDefault();
      const next = e.key === 'ArrowDown' ? idx + 1 : idx - 1;
      if (next >= 0 && next < items.length) items[next].focus();
    } else if (items.length > 0 && e.key === 'ArrowDown') {
      e.preventDefault();
      items[0].focus();
    }
  }, []);

  return (
    <div className="w-full min-w-100 max-w-120 lg:max-w-140 flex flex-col border-r border-wa-border p-2 lg:p-4 bg-white shrink-0 relative z-10 h-full">
      <SidebarHeader
        onRefresh={refetchConvs}
        onBulkSend={onBulkSend}
        onTemplateBroadcast={onTemplateBroadcast}
      />
      <SearchBar value={search} onChange={handleSearchChange} />
      <StatsStrip
        stats={statsVM}
        filter={filter as Filter}
        onFilterChange={handleFilterChange}
      />

      {/* Scrollable virtual list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-wa-green" />
        </div>
      ) : conversationVMs.length === 0 ? (
        <div className="text-center text-wa-muted text-sm py-12 px-4">
          Aucune conversation
        </div>
      ) : (
        <div
          ref={parentRef}
          role="list"
          aria-label="Liste des conversations"
          className="flex-1 overflow-y-auto overflow-x-hidden [scrollbar-width:thin] [scrollbar-color:rgba(0,0,0,0.12)_transparent]"
          onKeyDown={handleListKeyDown}
        >
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {virtualRow.index < conversationVMs.length ? (
                  <ConversationItem
                    vm={conversationVMs[virtualRow.index]}
                    onSelect={handleSelect}
                  />
                ) : (
                  <div className="flex justify-center py-4">
                    <Loader2 size={20} className="animate-spin text-[#25D366]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
