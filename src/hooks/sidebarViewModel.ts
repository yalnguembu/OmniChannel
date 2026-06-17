import { useCallback, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useConversations, useStats, useUsers } from './useWhatsapp';
import { type Filter, convPreview, fmtTime, avatarColor, getInitials } from '@/models/whatsapp.models';
import { useWhatsAppStore } from '@/store/useWhatsappStore';
import { getApiSenderDropdownOptions } from '@/shared/api/generated/@tanstack/react-query.gen';

export interface ConversationViewModel {
  id: string;
  initials: string;
  avatarBg: string;
  name: string;
  preview: string;
  time: string;
  unread: number;
  status: string;
  assigneeName: string | null;
  isActive: boolean;
  senderAddress: string | null;
}

export function useSidebarViewModel() {
  const {
    filter,
    search,
    setFilter,
    setSearch,
    setConversations,
    setStats,
    setUsers,
    setSenders,
    selectedSenderId,
    activeConversationId,
    conversations,
    stats,
    users,
  } = useWhatsAppStore();

  // Build query params from filter, search, and selectedSenderId
  const queryParams = useMemo(() => {
    const p: Record<string, unknown> = {};
    if (filter && filter !== 'ALL' && filter !== 'UNREAD') p.status = filter;
    if (filter === 'UNREAD') p.unreadOnly = true;
    if (search) p.searchTerm = search;
    if (selectedSenderId) p.senderId = selectedSenderId;
    return p;
  }, [filter, search, selectedSenderId]);

  const { 
    data: convData, 
    isLoading: convsLoading, 
    refetch: refetchConvs,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useConversations(queryParams);
  const { data: statsData } = useStats();
  const { data: usersData } = useUsers();

  const { data: sendersData } = useQuery({
    ...getApiSenderDropdownOptions(),
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    const items = (sendersData as any)?.data ?? [];
    // Only hydrate the sender list for display; the active sender is owned by
    // the URL (`/wa/$senderId`) and set by WhatsAppPage.
    setSenders(
      items.map((s: any) => ({
        id: s.id as string,
        senderName: s.displayName || s.address || s.id,
      })),
    );
  }, [sendersData, setSenders]);

  useEffect(() => { 
    if (convData) {
      const allConvs = convData.pages.flatMap(page => page.items);
      setConversations(allConvs);
    }
  }, [convData, setConversations]);
  useEffect(() => { if (statsData) setStats(statsData); }, [statsData, setStats]);
  useEffect(() => { if (usersData) setUsers(usersData); }, [usersData, setUsers]);

  const conversationVMs = useMemo((): ConversationViewModel[] =>
    conversations.map((c): ConversationViewModel => ({
      id: c.id,
      initials: getInitials(c.contactAddress || '?'),
      avatarBg: avatarColor(c.id),
      name: c.contactAddress || '—',
      preview: convPreview(c),
      time: fmtTime(c.lastMessageAt),
      unread: c.unreadCount ?? 0,
      status: c.status ?? 'OPEN',
      assigneeName: c.assignedToUserFirstName
        ? `${c.assignedToUserFirstName} ${c.assignedToUserLastName || ''}`.trim()
        : null,
      isActive: c.id === activeConversationId,
      senderAddress: c.senderAddress ?? null,
    })),
  [conversations, activeConversationId]);

  const statsVM = useMemo(() => ({
    all: conversations.length,
    open: statsData?.open ?? 0,
    pending: statsData?.pending ?? 0,
    resolved: statsData?.resolved ?? 0,
    unread: statsData?.totalUnread ?? 0,
    closed: statsData?.closed ?? 0,
  }), [statsData, conversations.length]);

  const handleFilterChange = useCallback((f: Filter) => {
    setFilter(f);
  }, [setFilter]);

  const handleSearchChange = useCallback((s: string) => {
    setSearch(s);
  }, [setSearch]);

  return {
    conversationVMs,
    statsVM,
    filter,
    search,
    isLoading: convsLoading,
    handleFilterChange,
    handleSearchChange,
    refetchConvs,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    users,
  };
}
