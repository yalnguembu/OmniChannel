import { useCallback, useEffect, useMemo } from "react";
import type { ConversationSearchParams } from "@/api/endpoints";
import {
  avatarColor,
  convPreview,
  fmtTime,
  getInitials,
  toUtcDate,
  type Filter,
} from "@/models/whatsapp.models";
import { useWhatsAppStore, type ConversationFilters } from "@/store/whatsappStore";
import { useDebounce } from "./useDebounce";
import { useConversations, useSenders, useStats, useUsers } from "./useWhatsapp";

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
  /** Vrai quand le dernier message a été envoyé par nous (sortant). */
  lastOutbound: boolean;
  /** Type du dernier message en majuscules (IMAGE / VIDEO / DOCUMENT…) — pilote
   *  l'icône affichée devant l'aperçu. */
  previewType: string;
}

/** ViewModel de la liste des discussions — portage de `sidebarViewModel.ts`. */
export function useInboxViewModel() {
  const filter = useWhatsAppStore((s) => s.filter);
  const search = useWhatsAppStore((s) => s.search);
  const setFilter = useWhatsAppStore((s) => s.setFilter);
  const setSearch = useWhatsAppStore((s) => s.setSearch);
  const filters = useWhatsAppStore((s) => s.filters);
  const setFilters = useWhatsAppStore((s) => s.setFilters);
  const resetFilters = useWhatsAppStore((s) => s.resetFilters);
  const setConversations = useWhatsAppStore((s) => s.setConversations);
  const setStats = useWhatsAppStore((s) => s.setStats);
  const setUsers = useWhatsAppStore((s) => s.setUsers);
  const setSenders = useWhatsAppStore((s) => s.setSenders);
  const setSelectedSenderId = useWhatsAppStore((s) => s.setSelectedSenderId);
  const selectedSenderId = useWhatsAppStore((s) => s.selectedSenderId);
  const activeConversationId = useWhatsAppStore((s) => s.activeConversationId);
  const conversations = useWhatsAppStore((s) => s.conversations);
  const storeHydrated = useWhatsAppStore((s) => s.hydrated);

  // Recherche débouncée : on n'envoie pas une requête par frappe (le filtre
  // client ci-dessous resserre déjà la liste chargée pour un retour immédiat).
  const debouncedSearch = useDebounce(search, 400);

  const queryParams = useMemo<ConversationSearchParams>(() => {
    const p: ConversationSearchParams = {};
    if (filter && filter !== "ALL" && filter !== "UNREAD") p.status = filter;
    if (filter === "UNREAD") p.unreadOnly = true;
    if (debouncedSearch) p.searchTerm = debouncedSearch;
    if (selectedSenderId) p.senderId = selectedSenderId;
    if (filters.assignedToUser) p.assignedToUser = filters.assignedToUser;
    if (filters.lastMessageDirection) p.lastMessageDirection = filters.lastMessageDirection;
    return p;
  }, [
    filter,
    debouncedSearch,
    selectedSenderId,
    filters.assignedToUser,
    filters.lastMessageDirection,
  ]);

  const {
    data: convData,
    isLoading: convsLoading,
    isRefetching,
    refetch: refetchConvs,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useConversations(queryParams);
  const { data: statsData } = useStats();
  const { data: usersData } = useUsers();
  const { data: sendersData } = useSenders();

  useEffect(() => {
    if (!sendersData) return;
    setSenders(sendersData);
    // Le web tient l'expéditeur actif dans l'URL (`/wa/$senderId`) ; ici on
    // retombe sur le premier disponible tant que rien n'a été choisi, et on
    // corrige une sélection persistée qui n'existe plus. On attend la
    // réhydratation du store, sinon on écraserait le choix mémorisé.
    if (!storeHydrated) return;
    const stillValid = sendersData.some((s) => s.id === selectedSenderId);
    if (!stillValid) setSelectedSenderId(sendersData[0]?.id ?? null);
  }, [sendersData, selectedSenderId, storeHydrated, setSenders, setSelectedSenderId]);

  useEffect(() => {
    if (convData) {
      setConversations(convData.pages.flatMap((page) => page.items));
    }
  }, [convData, setConversations]);

  useEffect(() => {
    if (statsData) setStats(statsData);
  }, [statsData, setStats]);

  useEffect(() => {
    if (usersData) setUsers(usersData);
  }, [usersData, setUsers]);

  // Les conversations viennent de deux sources : la requête (filtrée serveur) ET
  // les upserts SignalR, qui arrivent non filtrés. On réapplique donc le filtre
  // statut / non-lues côté client pour qu'un push hors du filtre courant ne
  // s'invite pas dans la liste.
  //
  // La recherche n'est volontairement PAS réappliquée : `searchTerm` appartient
  // au backend (il peut matcher des champs ou des normalisations invisibles
  // côté client), refiltrer ici casserait la recherche.
  const visibleConversations = useMemo(() => {
    const { dateFrom, dateTo } = filters;
    // Bornes de jours locaux, incluses aux deux extrémités.
    const fromMs = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null;
    const toMs = dateTo ? new Date(`${dateTo}T23:59:59.999`).getTime() : null;

    const matchesStatus = (c: (typeof conversations)[number]) => {
      if (!filter || filter === "ALL") return true;
      if (filter === "UNREAD") {
        // On garde la conversation ouverte même après l'effacement du badge.
        return (c.unreadCount ?? 0) > 0 || c.id === activeConversationId;
      }
      return (c.status ?? "OPEN").toUpperCase() === filter;
    };

    const matchesDate = (c: (typeof conversations)[number]) => {
      if (fromMs === null && toMs === null) return true;
      if (!c.lastMessageAt) return false;
      const at = toUtcDate(c.lastMessageAt).getTime();
      if (fromMs !== null && at < fromMs) return false;
      if (toMs !== null && at > toMs) return false;
      return true;
    };

    return conversations.filter((c) => matchesStatus(c) && matchesDate(c));
  }, [conversations, filter, activeConversationId, filters.dateFrom, filters.dateTo]);

  const conversationVMs = useMemo<ConversationViewModel[]>(
    () =>
      visibleConversations.map((c) => ({
        id: c.id,
        initials: getInitials(c.contactAddress || "?"),
        avatarBg: avatarColor(c.id),
        name: c.contactAddress || "—",
        preview: convPreview(c),
        time: fmtTime(c.lastMessageAt),
        unread: c.unreadCount ?? 0,
        status: (c.status ?? "OPEN").toUpperCase(),
        assigneeName: c.assignedToUserFirstName
          ? `${c.assignedToUserFirstName} ${c.assignedToUserLastName || ""}`.trim()
          : null,
        isActive: c.id === activeConversationId,
        lastOutbound: (c.lastMessageDirection ?? "").toUpperCase() === "OUTBOUND",
        previewType: (c.lastMessageMessageType ?? "").toUpperCase(),
      })),
    [visibleConversations, activeConversationId],
  );

  const statsVM = useMemo(
    () => ({
      all: conversations.length,
      open: statsData?.open ?? 0,
      pending: statsData?.pending ?? 0,
      resolved: statsData?.resolved ?? 0,
      unread: statsData?.totalUnread ?? 0,
      closed: statsData?.closed ?? 0,
    }),
    [statsData, conversations.length],
  );

  const handleFilterChange = useCallback((f: Filter) => setFilter(f), [setFilter]);
  const handleFiltersChange = useCallback(
    (patch: Partial<ConversationFilters>) => setFilters(patch),
    [setFilters],
  );
  const handleSearchChange = useCallback((s: string) => setSearch(s), [setSearch]);
  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return {
    conversationVMs,
    statsVM,
    filter,
    search,
    filters,
    activeFilterCount:
      (filters.assignedToUser ? 1 : 0) +
      (filters.lastMessageDirection ? 1 : 0) +
      (filters.dateFrom || filters.dateTo ? 1 : 0),
    senders: sendersData ?? [],
    users: usersData ?? [],
    selectedSenderId,
    setSelectedSenderId,
    isLoading: convsLoading,
    isRefetching,
    isFetchingNextPage,
    handleFilterChange,
    handleFiltersChange,
    resetFilters,
    handleSearchChange,
    handleEndReached,
    refetchConvs,
  };
}
