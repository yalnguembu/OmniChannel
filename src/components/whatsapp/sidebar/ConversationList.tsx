import React, { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
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

  const handleSelect = (id: string) => {
    setActiveConversationId(id);
    setMobileChatOpen(true);
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput = activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'TEXTAREA';
      
      if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !isInput)) {
        e.preventDefault();
        document.getElementById('chat-search-input')?.focus();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleListKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      const items = Array.from(e.currentTarget.querySelectorAll('[role="listitem"]')) as HTMLElement[];
      const activeElement = document.activeElement as HTMLElement;
      const index = items.indexOf(activeElement);
      if (index !== -1) {
        e.preventDefault();
        const nextIndex = e.key === 'ArrowDown' ? index + 1 : index - 1;
        if (nextIndex >= 0 && nextIndex < items.length) {
          items[nextIndex].focus();
        }
      } else if (items.length > 0 && e.key === 'ArrowDown') {
        e.preventDefault();
        items[0].focus();
      }
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 100) {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }
  };

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

      {/* Scrollable conversation list */}
      <div 
        role="list"
        aria-label="Liste des conversations"
        className="flex-1 overflow-y-auto overflow-x-hidden [scrollbar-width:thin] [scrollbar-color:rgba(0,0,0,0.12)_transparent]"
        onScroll={handleScroll}
        onKeyDown={handleListKeyDown}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-wa-green" />
          </div>
        ) : conversationVMs.length === 0 ? (
          <div className="text-center text-wa-muted text-sm py-12 px-4">
            Aucune conversation
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {conversationVMs.map((vm) => (
              <ConversationItem
                key={vm.id}
                vm={vm}
                onClick={() => handleSelect(vm.id)}
              />
            ))}
            {isFetchingNextPage && (
              <div className="flex justify-center py-4">
                <Loader2 size={20} className="animate-spin text-[#25D366]" />
              </div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
