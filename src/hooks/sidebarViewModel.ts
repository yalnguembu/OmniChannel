import { useCallback, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useConversations, useStats, useUsers } from './useWhatsapp';
import { type Filter, convPreview, fmtTime, avatarColor, getInitials } from '@/models/whatsapp.models';
import { useWhatsAppStore } from '@/store/useWhatsappStore';
import { useDebounce } from '@/shared/hooks/useDebounce';
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
  /** True when the conversation's last message was sent by us (outbound). */
  lastOutbound: boolean;
  /** Uppercased type of the last message (IMAGE / VIDEO / DOCUMENT…) — drives
   *  the leading media icon in the list item. */
  previewType: string;
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

  // Debounce the term sent to the backend so typing doesn't fire a request per
  // keystroke (the client-side filter below still narrows the loaded list
  // instantly for responsive feedback).
  const debouncedSearch = useDebounce(search, 400);

  // Build query params from filter, debounced search, and selectedSenderId
  const queryParams = useMemo(() => {
    const p: Record<string, unknown> = {};
    if (filter && filter !== 'ALL' && filter !== 'UNREAD') p.status = filter;
    if (filter === 'UNREAD') p.unreadOnly = true;
    if (debouncedSearch) p.searchTerm = debouncedSearch;
    if (selectedSenderId) p.senderId = selectedSenderId;
    return p;
  }, [filter, debouncedSearch, selectedSenderId]);

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

  // Conversations arrive from two sources: the (server-filtered) search query
  // AND live SignalR upserts, which land in the store unfiltered. Re-apply the
  // active filter/search client-side so a SignalR push that doesn't match the
  // current view (e.g. a new inbound message while the UNREAD or a status
  // filter is active) doesn't leak into the list.
  const visibleConversations = useMemo(() => {
    const q = search.trim().toLowerCase();
    return conversations.filter((c) => {
      if (filter === 'UNREAD') {
        // Keep the currently-open conversation even after its badge clears.
        if ((c.unreadCount ?? 0) <= 0 && c.id !== activeConversationId) return false;
      } else if (filter && filter !== 'ALL') {
        if ((c.status ?? 'OPEN') !== filter) return false;
      }
      if (q) {
        const hay = `${c.contactName ?? ''} ${c.contactAddress ?? ''} ${c.lastMessageContent ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [conversations, filter, search, activeConversationId]);

  const conversationVMs = useMemo((): ConversationViewModel[] =>
    visibleConversations.map((c): ConversationViewModel => ({
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
      lastOutbound: (c.lastMessageDirection ?? '').toUpperCase() === 'OUTBOUND',
      previewType: (c.lastMessageMessageType ?? '').toUpperCase(),
    })),
  [visibleConversations, activeConversationId]);

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
