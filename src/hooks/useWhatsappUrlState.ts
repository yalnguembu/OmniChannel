import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useWhatsAppStore } from '@/store/useWhatsappStore';
import type { Filter } from '@/models/whatsapp.models';
import type { WhatsappSearch } from '@/pages/whatsapp/whatsappSearchParams';

/** Settle time before the URL is rewritten from the store. */
const URL_WRITE_DEBOUNCE_MS = 350;

/**
 * Two-way binding between the URL and the WhatsApp store.
 *
 * The URL is the durable copy: reloading the page (or opening a shared link)
 * restores the open conversation and every sidebar filter. The store stays the
 * one components read and write, so nothing else in the feature has to know
 * about routing.
 *
 * Both directions are guarded on value equality, so they settle after one
 * pass instead of ping-ponging.
 */
export function useWhatsappUrlState() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as WhatsappSearch;

  const activeConversationId = useWhatsAppStore((s) => s.activeConversationId);
  const filter = useWhatsAppStore((s) => s.filter);
  const searchTerm = useWhatsAppStore((s) => s.search);
  const filters = useWhatsAppStore((s) => s.filters);
  const setActiveConversationId = useWhatsAppStore((s) => s.setActiveConversationId);
  const setFilter = useWhatsAppStore((s) => s.setFilter);
  const setSearch = useWhatsAppStore((s) => s.setSearch);
  const setFilters = useWhatsAppStore((s) => s.setFilters);
  const setMobileChatOpen = useWhatsAppStore((s) => s.setMobileChatOpen);

  // ── URL → store ────────────────────────────────────────────────────────────
  // Covers the first paint after a reload as well as back/forward navigation.
  const urlConv = search.c ?? null;
  const urlFilter = (search.f ?? 'ALL') as Filter;
  const urlQuery = search.q ?? '';
  const urlAgent = search.agent ?? '';
  const urlDir = search.dir ?? '';
  const urlFrom = search.from ?? '';
  const urlTo = search.to ?? '';

  // The store starts empty on a reload, so the URL must be read into it before
  // the opposite direction is allowed to write — otherwise the first commit
  // would serialise the empty store and wipe the params being restored.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const store = useWhatsAppStore.getState();
    if (store.activeConversationId !== urlConv) {
      setActiveConversationId(urlConv);
      // A deep link straight to a conversation must show the chat pane, not
      // the list, on mobile.
      if (urlConv) setMobileChatOpen(true);
    }
    if (store.filter !== urlFilter) setFilter(urlFilter);
    if (store.search !== urlQuery) setSearch(urlQuery);
    const f = store.filters;
    if (
      f.assignedToUser !== urlAgent ||
      f.lastMessageDirection !== urlDir ||
      f.dateFrom !== urlFrom ||
      f.dateTo !== urlTo
    ) {
      setFilters({
        assignedToUser: urlAgent,
        lastMessageDirection: urlDir,
        dateFrom: urlFrom,
        dateTo: urlTo,
      });
    }
    if (!hydrated) setHydrated(true);
  }, [
    hydrated,
    urlConv,
    urlFilter,
    urlQuery,
    urlAgent,
    urlDir,
    urlFrom,
    urlTo,
    setActiveConversationId,
    setFilter,
    setSearch,
    setFilters,
    setMobileChatOpen,
  ]);

  // ── Store → URL ────────────────────────────────────────────────────────────
  // `replace` throughout: filtering and picking conversations shouldn't pile
  // up history entries the back button has to walk through.
  //
  // Debounced, because a router navigation re-renders every route subscriber:
  // writing on each keystroke of the sidebar search made typing crawl. The URL
  // only has to be right once the user stops, not mid-word.
  const lastWritten = useRef<string>('');
  useEffect(() => {
    if (!hydrated) return;
    const next: WhatsappSearch = {};
    if (activeConversationId) next.c = activeConversationId;
    if (filter && filter !== 'ALL') next.f = filter as WhatsappSearch['f'];
    if (searchTerm) next.q = searchTerm;
    if (filters.assignedToUser) next.agent = filters.assignedToUser;
    if (filters.lastMessageDirection)
      next.dir = filters.lastMessageDirection as WhatsappSearch['dir'];
    if (filters.dateFrom) next.from = filters.dateFrom;
    if (filters.dateTo) next.to = filters.dateTo;

    const serialized = JSON.stringify(next);
    if (serialized === lastWritten.current) return;

    const timer = setTimeout(() => {
      lastWritten.current = serialized;
      navigate({ to: '.', search: next, replace: true });
    }, URL_WRITE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [
    hydrated,
    activeConversationId,
    filter,
    searchTerm,
    filters.assignedToUser,
    filters.lastMessageDirection,
    filters.dateFrom,
    filters.dateTo,
    navigate,
  ]);
}
