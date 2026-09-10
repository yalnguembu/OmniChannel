import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useMessages,
  useConversationDetail,
  useSendText,
  useSendReply,
  useSendMedia,
  useUpdateConversationStatus,
  useAssignConversation,
  whatsappKeys,
  type PendingMedia,
} from './useWhatsapp';
import {
  fmtTimeShort,
  getInitials,
  avatarColor,
  toUtcDate,
  type ConversationStatus,
  type Media,
  type Message,
} from '@/models/whatsapp.models';
import { useWhatsAppStore, type ReplyTo } from '@/store/useWhatsappStore';

export interface MessageViewModel {
  id: string;
  isOutbound: boolean;
  content: string | null;
  messageType: string;
  timeStr: string;
  status: string;
  medias: Message['medias'];
  replyToContent: string | null;
  replyToAuthor: string | null;
  senderName: string | null;
  externalMessageId: string | null;
  rawMessage: Message;
}

/** One picture / video / document / audio surfaced in the media gallery. */
export interface GalleryItem {
  key: string;
  messageId: string;
  kind: 'image' | 'video' | 'audio' | 'document';
  url: string;
  fileName: string | null;
  caption: string | null;
  /** Raw timestamp — the gallery groups by month with it. */
  timestamp: string | null;
}

/**
 * Safety rail for the two features that page backwards on their own (deep
 * search and jump-to-date): stop after this many extra pages rather than
 * walking a multi-year conversation to its first message.
 */
const MAX_AUTO_PAGES = 20;

function tsOf(m: Message) {
  return m.sentAt || m.receivedAt || m.createdAt || null;
}

function localDayKey(ts: string | null | undefined): string {
  if (!ts) return '';
  const d = toUtcDate(ts);
  const mm = `${d.getMonth() + 1}`.padStart(2, '0');
  const dd = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** Oldest message of `day` (`yyyy-mm-dd`) within `items`, or null. */
function findFirstOfDay(items: Message[], day: string): Message | null {
  let best: Message | null = null;
  for (const m of items) {
    const t = tsOf(m);
    if (localDayKey(t) !== day) continue;
    if (!best || (t ?? '') < (tsOf(best) ?? '')) best = m;
  }
  return best;
}

/** Earliest timestamp present in `items`. */
function oldestTs(items: Message[]): string | null {
  let oldest: string | null = null;
  for (const m of items) {
    const t = tsOf(m);
    if (t && (!oldest || t < oldest)) oldest = t;
  }
  return oldest;
}

function matchesTerm(m: Message, lowerTerm: string): boolean {
  return (
    (m.content ?? '').toLowerCase().includes(lowerTerm) ||
    (m.medias ?? []).some((md) => (md.caption ?? '').toLowerCase().includes(lowerTerm))
  );
}

/** messageType → gallery kind, for payloads that put the URL in `content`. */
const CONTENT_MEDIA_KIND: Record<string, GalleryItem['kind'] | undefined> = {
  IMAGE: 'image',
  PHOTO: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  VOICE: 'audio',
  DOCUMENT: 'document',
  PDF: 'document',
  FILE: 'document',
};

function mediaKind(media: Media): GalleryItem['kind'] {
  const mt = (media.mediaType || '').toUpperCase();
  const mime = media.mimeType || '';
  if (mt === 'IMAGE' || mt === 'PHOTO' || mime.startsWith('image/')) return 'image';
  if (mt === 'VIDEO' || mime.startsWith('video/')) return 'video';
  if (mt === 'AUDIO' || mt === 'VOICE' || mime.startsWith('audio/')) return 'audio';
  return 'document';
}

export function useChatViewModel() {
  // One selector per slice, never `useWhatsAppStore()` as a whole: the store
  // also carries the conversation list, which SignalR rewrites continuously on
  // a busy inbox. Subscribing to everything re-rendered the entire chat (and
  // re-derived every message view-model) on each of those pushes.
  const activeConversationId = useWhatsAppStore((s) => s.activeConversationId);
  const setActiveConversationId = useWhatsAppStore((s) => s.setActiveConversationId);
  const mergeMessages = useWhatsAppStore((s) => s.mergeMessages);
  const chatSearch = useWhatsAppStore((s) => s.chatSearch);
  const setChatSearch = useWhatsAppStore((s) => s.setChatSearch);
  const replyTo = useWhatsAppStore((s) => s.replyTo);
  const setReplyTo = useWhatsAppStore((s) => s.setReplyTo);
  const clearUnreadBadge = useWhatsAppStore((s) => s.clearUnreadBadge);
  const cacheConversation = useWhatsAppStore((s) => s.cacheConversation);
  const setMobileChatOpen = useWhatsAppStore((s) => s.setMobileChatOpen);
  const messages = useWhatsAppStore((s) => s.messages);
  // Only this conversation's row, so an upsert on any other one is ignored.
  const activeConv = useWhatsAppStore((s) =>
    s.activeConversationId ? (s.conversationById[s.activeConversationId] ?? null) : null,
  );

  const qc = useQueryClient();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Deep link or reload: the sidebar slice rarely contains the open
  // conversation, so pull it by id and index it for the header to read.
  const { data: convDetail, isLoading: convDetailLoading } = useConversationDetail(
    activeConversationId,
    !activeConv,
  );
  useEffect(() => {
    if (convDetail) cacheConversation(convDetail);
  }, [convDetail, cacheConversation]);

  const {
    data: msgsData,
    isLoading: msgsLoading,
    isFetching: msgsFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchMessages,
  } = useMessages(activeConversationId);

  const sendText = useSendText();
  const sendReply = useSendReply();
  const sendMedia = useSendMedia();
  const updateStatus = useUpdateConversationStatus();
  const assignConv = useAssignConversation();

  // Sync fetched pages to the store (merge, so live arrivals survive)
  useEffect(() => {
    if (!msgsData) return;
    mergeMessages(msgsData.pages.flatMap((p) => p.items));
  }, [msgsData, mergeMessages]);

  // Clear the badge locally for instant feedback when opening a conversation.
  // Read state is persisted server-side via SignalR's JoinConversation (invoked
  // on active-conversation change), so the count stays 0 on later refetches.
  useEffect(() => {
    if (activeConversationId) clearUnreadBadge(activeConversationId);
  }, [activeConversationId, clearUnreadBadge]);

  // Scope to the active conversation (the store can briefly hold the previous
  // conversation's messages during a switch) and sort chronologically
  // ascending, so the order is correct regardless of the page order the API
  // returns them in.
  //
  // Note the in-chat search no longer filters here: WhatsApp keeps the whole
  // thread on screen and highlights the hits, so search is a *selection* over
  // this list (see `searchMatchIds`), not a filter of it.
  const conversationMessages = useMemo(() => {
    const byConv = activeConversationId
      ? messages.filter(
          (m) => !m.conversationId || m.conversationId === activeConversationId,
        )
      : messages;
    const at = (m: Message) => {
      const t = tsOf(m);
      return t ? toUtcDate(t).getTime() : 0;
    };
    return [...byConv].sort((a, b) => at(a) - at(b));
  }, [messages, activeConversationId]);

  const messageVMs = useMemo((): MessageViewModel[] =>
    conversationMessages.map((m): MessageViewModel => {
      const ts = tsOf(m);
      const isOut = (m.direction || '').toUpperCase() === 'OUTBOUND';
      return {
        id: m.id,
        isOutbound: isOut,
        content: m.content ?? null,
        messageType: (m.messageType || 'TEXT').toUpperCase(),
        timeStr: fmtTimeShort(ts),
        status: (m.status || '').toUpperCase(),
        medias: m.medias ?? [],
        replyToContent: m.replyToMessageContent ?? null,
        replyToAuthor: m.replyToMessageId
          ? isOut
            ? 'Vous'
            : (m.sentByUserFirstName || activeConv?.contactAddress || 'Contact')
          : null,
        senderName: !isOut && m.sentByUserFirstName ? m.sentByUserFirstName : null,
        externalMessageId: m.externalMessageId ?? null,
        rawMessage: m,
      };
    }),
  [conversationMessages, activeConv]);

  // ── Paging backwards ────────────────────────────────────────────────────────

  const loadOlder = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  /**
   * Pull older pages until `matches` reports a hit (or there is nothing left).
   * Used by the in-chat search and the jump-to-date picker, both of which look
   * for something that may not have been paged in yet.
   *
   * The predicate is handed the freshly fetched pages rather than reading the
   * store: the store is only refreshed by the sync effect on the next commit,
   * so testing it here would always look one page behind and keep paging past
   * a match it already had.
   */
  const loadOlderUntil = useCallback(
    async (matches: (items: Message[]) => boolean): Promise<boolean> => {
      for (let page = 0; page < MAX_AUTO_PAGES; page += 1) {
        const res = await fetchNextPage();
        const pages = res.data?.pages ?? [];
        if (matches(pages.flatMap((p) => p.items))) return true;
        if (!pages[pages.length - 1]?.hasNextPage) return false;
      }
      return false;
    },
    [fetchNextPage],
  );

  // ── In-chat search: highlight + navigate, WhatsApp-style ────────────────────

  const searchMatchIds = useMemo(() => {
    const term = chatSearch.trim().toLowerCase();
    if (!term) return [] as string[];
    return messageVMs
      .filter(
        (vm) =>
          (vm.content ?? '').toLowerCase().includes(term) ||
          (vm.medias ?? []).some((m) =>
            (m.caption ?? '').toLowerCase().includes(term),
          ),
      )
      .map((vm) => vm.id);
  }, [messageVMs, chatSearch]);

  const matchCount = searchMatchIds.length;

  // The focused hit is tracked by **id**, never by index.
  //
  // `searchMatchIds` is chronological, and paging backwards inserts older
  // hits at the *front* of it — so a stored index silently starts pointing at
  // a different message as soon as a page loads. Walking up through the
  // results scrolls towards the top, which loads a page, which used to both
  // shift every index and re-run the "focus the newest hit" reset: the view
  // jumped back to the bottom mid-navigation.
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);

  useEffect(() => {
    if (matchCount === 0) {
      setActiveMatchId(null);
      return;
    }
    // Keep the current hit when it survives a recount; otherwise start from
    // the most recent one, like WhatsApp.
    setActiveMatchId((current) =>
      current && searchMatchIds.includes(current)
        ? current
        : searchMatchIds[matchCount - 1],
    );
  }, [searchMatchIds, matchCount]);

  const activeMatchIndex = activeMatchId ? searchMatchIds.indexOf(activeMatchId) : -1;

  /** 1 = most recent hit, counting backwards in time as the user walks up. */
  const activeMatchPosition = activeMatchIndex >= 0 ? matchCount - activeMatchIndex : 0;
  const canGoOlder = activeMatchIndex > 0 || (matchCount > 0 && !!hasNextPage);
  const canGoNewer = activeMatchIndex >= 0 && activeMatchIndex < matchCount - 1;

  /** Older in time — the up chevron. */
  const goToPrevMatch = useCallback(() => {
    const index = activeMatchId ? searchMatchIds.indexOf(activeMatchId) : -1;
    if (index > 0) {
      setActiveMatchId(searchMatchIds[index - 1]);
      return;
    }
    // Standing on the oldest loaded hit: reach further back instead of
    // dead-ending. The next page brings more matches and the focused one is
    // preserved, so pressing again simply continues.
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [activeMatchId, searchMatchIds, hasNextPage, isFetchingNextPage, fetchNextPage]);

  /** Newer in time — the down chevron. */
  const goToNextMatch = useCallback(() => {
    const index = activeMatchId ? searchMatchIds.indexOf(activeMatchId) : -1;
    if (index >= 0 && index < searchMatchIds.length - 1) {
      setActiveMatchId(searchMatchIds[index + 1]);
    }
  }, [activeMatchId, searchMatchIds]);

  // Nothing matched in what's loaded — reach further back before giving up.
  const [isSearchingOlder, setIsSearchingOlder] = useState(false);
  const deepSearchedTerm = useRef<string | null>(null);
  useEffect(() => {
    const term = chatSearch.trim();
    if (!term) {
      deepSearchedTerm.current = null;
      return;
    }
    if (matchCount > 0 || !hasNextPage || isFetchingNextPage) return;
    if (deepSearchedTerm.current === term) return;
    deepSearchedTerm.current = term;

    let cancelled = false;
    setIsSearchingOlder(true);
    const lower = term.toLowerCase();
    loadOlderUntil((items) => items.some((m) => matchesTerm(m, lower))).finally(() => {
      if (!cancelled) setIsSearchingOlder(false);
    });
    return () => {
      cancelled = true;
    };
  }, [chatSearch, matchCount, hasNextPage, isFetchingNextPage, loadOlderUntil]);

  // ── Jump to a date ──────────────────────────────────────────────────────────

  /** Id the list should scroll to and flash — set by search or by date jump. */
  const [scrollTargetId, setScrollTargetId] = useState<string | null>(null);
  const [isJumpingToDate, setIsJumpingToDate] = useState(false);

  useEffect(() => {
    if (activeMatchId) setScrollTargetId(activeMatchId);
  }, [activeMatchId]);

  /** Reset the target once consumed, so the same hit can be re-targeted later. */
  const clearScrollTarget = useCallback(() => setScrollTargetId(null), []);

  /**
   * Scroll to the first message of `day` (`yyyy-mm-dd`), paging backwards if
   * that day hasn't been loaded yet. Returns false when the conversation has
   * no message that day (or the search rail was hit first).
   */
  const jumpToDate = useCallback(
    async (day: string): Promise<boolean> => {
      if (!day) return false;
      const convId = activeConversationId;
      const scoped = (items: Message[]) =>
        items.filter((m) => !m.conversationId || m.conversationId === convId);

      let hit = findFirstOfDay(conversationMessages, day);

      if (!hit) {
        // Not in what's loaded — page backwards, stopping either on the day
        // itself or once we've reached past it (meaning it has no message).
        const holder: { found: Message | null } = { found: null };
        setIsJumpingToDate(true);
        try {
          await loadOlderUntil((items) => {
            const mine = scoped(items);
            const match = findFirstOfDay(mine, day);
            if (match) {
              holder.found = match;
              return true;
            }
            const oldest = oldestTs(mine);
            return !!oldest && localDayKey(oldest) < day;
          });
        } finally {
          setIsJumpingToDate(false);
        }
        hit = holder.found;
      }

      if (!hit) return false;
      setScrollTargetId(hit.id);
      return true;
    },
    [activeConversationId, conversationMessages, loadOlderUntil],
  );

  // ── Media gallery ───────────────────────────────────────────────────────────

  const galleryItems = useMemo((): GalleryItem[] => {
    const out: GalleryItem[] = [];
    for (const vm of messageVMs) {
      const ts = tsOf(vm.rawMessage);

      if (vm.medias && vm.medias.length > 0) {
        vm.medias.forEach((media, i) => {
          if (!media.internalStorageUrl) return;
          out.push({
            key: `${vm.id}-${i}`,
            messageId: vm.id,
            kind: mediaKind(media),
            url: media.internalStorageUrl,
            fileName: media.fileName ?? null,
            caption: media.caption ?? null,
            timestamp: ts,
          });
        });
        continue;
      }

      // Older messages carry the file as a bare URL in `content` with a typed
      // messageType — the bubbles render those too, so the gallery must see
      // them or it would look empty on conversations using that shape.
      const kind = CONTENT_MEDIA_KIND[vm.messageType];
      if (kind && vm.content) {
        out.push({
          key: `${vm.id}-c`,
          messageId: vm.id,
          kind,
          url: vm.content,
          fileName: vm.content.split('/').pop() || null,
          caption: null,
          timestamp: ts,
        });
      }
    }
    // Newest first, like WhatsApp's "Médias, liens et docs" panel.
    return out.reverse();
  }, [messageVMs]);

  // ── 24-hour customer-care window ────────────────────────────────────────────
  // Free-form messages are only allowed within 24h of the contact's last
  // INBOUND message. Past that (or with no inbound at all) the window is
  // closed and only templates may be sent.
  const lastInboundTs = useMemo(() => {
    let max = 0;
    for (const m of conversationMessages) {
      if ((m.direction || '').toUpperCase() !== 'INBOUND') continue;
      const t = m.receivedAt || m.sentAt || m.createdAt;
      const ms = t ? toUtcDate(t).getTime() : 0;
      if (ms > max) max = ms;
    }
    return max;
  }, [conversationMessages]);

  const WINDOW_MS = 24 * 60 * 60 * 1000;
  const sessionWindowClosed =
    !msgsLoading &&
    (lastInboundTs === 0 || Date.now() - lastInboundTs >= WINDOW_MS);

  // ── Header ──────────────────────────────────────────────────────────────────

  const chatHeaderVM = useMemo(() => {
    if (!activeConv) return null;
    const phone = activeConv.contactAddress ?? '';
    // A contactName equal to the number carries no information — treat it as
    // absent so the CRM client name (resolved in the view) can take over.
    const contactName =
      activeConv.contactName && activeConv.contactName !== phone
        ? activeConv.contactName
        : null;
    const assignedName = activeConv.assignedToUserFirstName
      ? `${activeConv.assignedToUserFirstName} ${activeConv.assignedToUserLastName || ''}`.trim()
      : null;
    return {
      initials: getInitials(contactName || phone || '?'),
      avatarBg: avatarColor(activeConv.id),
      contactName,
      phone,
      assignedName,
      status: activeConv.status || 'OPEN',
      assignedToUserId: activeConv.assignedToUserId ?? '',
      contactAddress: phone,
    };
  }, [activeConv]);

  // ── Actions ─────────────────────────────────────────────────────────────────

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || !activeConv) return;

      const to = activeConv.contactAddress ?? '';
      if (replyTo?.messageId) {
        const msg = messages.find((m) => m.id === replyTo.messageId);
        if (msg?.externalMessageId) {
          await sendReply.mutateAsync({ to, body: text, replyToExternalMessageId: msg.externalMessageId });
        } else {
          await sendText.mutateAsync({ to, body: text });
        }
        setReplyTo(null);
      } else {
        await sendText.mutateAsync({ to, body: text });
      }

      // Fallback refetch scoped to active conversation only (SignalR is primary)
      setTimeout(() => {
        qc.invalidateQueries({ queryKey: whatsappKeys.messages(activeConversationId ?? '') });
      }, 500);
    },
    [activeConv, replyTo, messages, sendReply, sendText, setReplyTo, qc, activeConversationId]
  );

  /** Send every queued attachment, each with its own caption. */
  const handleSendMedia = useCallback(
    async (items: PendingMedia[]) => {
      if (!activeConv || items.length === 0) return;
      await sendMedia.mutateAsync({
        to: activeConv.contactAddress ?? '',
        items,
      });
    },
    [activeConv, sendMedia]
  );

  const handleStatusChange = useCallback(
    (status: ConversationStatus) => {
      if (!activeConversationId) return;
      updateStatus.mutate({ id: activeConversationId, status });
    },
    [activeConversationId, updateStatus]
  );

  const handleAssign = useCallback(
    (userId: string) => {
      if (!activeConversationId) return;
      assignConv.mutate({ id: activeConversationId, userId });
    },
    [activeConversationId, assignConv]
  );

  const handleSetReply = useCallback(
    (msg: Message) => {
      const isOut = (msg.direction || '').toUpperCase() === 'OUTBOUND';
      setReplyTo({
        messageId: msg.id,
        content: msg.content || '[Média]',
        author: isOut ? 'Vous' : (msg.sentByUserFirstName || activeConv?.contactAddress || 'Contact'),
      });
      inputRef.current?.focus();
    },
    [setReplyTo, activeConv]
  );

  const handleBack = useCallback(() => {
    setMobileChatOpen(false);
    setActiveConversationId(null);
  }, [setMobileChatOpen, setActiveConversationId]);

  const getMessageDetails = useCallback(
    (id: string): Message | undefined => messages.find((m) => m.id === id),
    [messages]
  );

  return {
    activeConv,
    chatHeaderVM,
    /** The conversation itself is still being resolved (header skeleton). */
    convLoading: !activeConv && convDetailLoading,
    messageVMs,
    msgsLoading,
    // Paging
    hasOlder: !!hasNextPage,
    isLoadingOlder: isFetchingNextPage,
    loadOlder,
    refetchMessages,
    isRefetchingMessages: msgsFetching && !isFetchingNextPage && !msgsLoading,
    // Search / navigation
    chatSearch,
    setChatSearch,
    searchMatchIds,
    matchCount,
    /** 1-based, counted from the most recent hit. */
    activeMatchPosition,
    activeMatchId,
    canGoOlder,
    canGoNewer,
    goToPrevMatch,
    goToNextMatch,
    isSearchingOlder,
    scrollTargetId,
    clearScrollTarget,
    jumpToDate,
    isJumpingToDate,
    // Gallery
    galleryItems,
    // Composer
    replyTo,
    setReplyTo,
    inputRef,
    sessionWindowClosed,
    isSending: sendText.isPending || sendReply.isPending,
    isSendingMedia: sendMedia.isPending,
    handleSendMessage,
    handleSendMedia,
    handleStatusChange,
    handleAssign,
    handleSetReply,
    handleBack,
    getMessageDetails,
  };
}

export type { ReplyTo };
