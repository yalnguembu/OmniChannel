import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  avatarColor,
  fmtTimeShort,
  getInitials,
  toUtcDate,
  SESSION_WINDOW_MS,
  type ConversationStatus,
  type Media,
  type Message,
} from "@/models/whatsapp.models";
import { useWhatsAppStore } from "@/store/whatsappStore";
import { fetchMessageWindow } from "@/api/endpoints";
import { useDebounce } from "./useDebounce";
import type { PendingMedia } from "./useWhatsapp";
import {
  MESSAGE_PAGE_SIZE,
  SEARCH_EXTEND_SIZE,
  useAssignConversation,
  useConversation,
  useMessages,
  useSendMedia,
  useSendReply,
  useSendText,
  useUpdateConversationStatus,
  whatsappKeys,
} from "./useWhatsapp";

export interface MessageViewModel {
  id: string;
  isOutbound: boolean;
  content: string | null;
  messageType: string;
  timeStr: string;
  status: string;
  medias: Media[];
  replyToContent: string | null;
  replyToAuthor: string | null;
  senderName: string | null;
  externalMessageId: string | null;
  rawMessage: Message;
}

function tsOfMessage(m: Message): string | null {
  return m.sentAt || m.receivedAt || m.createdAt || null;
}

function localDayKey(ts: string | null | undefined): string {
  if (!ts) return "";
  const d = toUtcDate(ts);
  const mm = `${d.getMonth() + 1}`.padStart(2, "0");
  const dd = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** Message le plus ancien du jour `day` (`aaaa-mm-jj`) dans `items`, sinon null. */
function findFirstOfDay(items: Message[], day: string): Message | null {
  let best: Message | null = null;
  for (const m of items) {
    const t = tsOfMessage(m);
    if (localDayKey(t) !== day) continue;
    if (!best || (t ?? "") < (tsOfMessage(best) ?? "")) best = m;
  }
  return best;
}

/** Horodatage le plus ancien présent dans `items`. */
function oldestTs(items: Message[]): string | null {
  let oldest: string | null = null;
  for (const m of items) {
    const t = tsOfMessage(m);
    if (t && (!oldest || t < oldest)) oldest = t;
  }
  return oldest;
}

/**
 * Garde-fou du saut à une date, la seule fonction qui remonte seule le fil :
 * on s'arrête après ce nombre d'élargissements plutôt que de tirer une
 * conversation pluriannuelle jusqu'à son premier message.
 */
const MAX_WIDEN_STEPS = 8;

export interface GalleryItem {
  key: string;
  messageId: string;
  kind: "image" | "video" | "audio" | "document";
  url: string;
  fileName: string | null;
  caption: string | null;
  /** Horodatage brut — la galerie regroupe par mois avec lui. */
  timestamp: string | null;
}

/** messageType → type de galerie, pour les payloads qui mettent l'URL dans `content`. */
const CONTENT_MEDIA_KIND: Record<string, GalleryItem["kind"] | undefined> = {
  IMAGE: "image",
  PHOTO: "image",
  VIDEO: "video",
  AUDIO: "audio",
  VOICE: "audio",
  DOCUMENT: "document",
  PDF: "document",
  FILE: "document",
};

function mediaKind(media: Media): GalleryItem["kind"] {
  const mt = (media.mediaType || "").toUpperCase();
  const mime = media.mimeType || "";
  if (mt === "IMAGE" || mt === "PHOTO" || mime.startsWith("image/")) return "image";
  if (mt === "VIDEO" || mime.startsWith("video/")) return "video";
  if (mt === "AUDIO" || mt === "VOICE" || mime.startsWith("audio/")) return "audio";
  return "document";
}

/** ViewModel d'une discussion — portage de `src/hooks/chatViewModel.ts` du web. */
export function useChatViewModel(conversationId: string | null) {
  const setActiveConversationId = useWhatsAppStore((s) => s.setActiveConversationId);
  const chatSearch = useWhatsAppStore((s) => s.chatSearch);
  const setChatSearch = useWhatsAppStore((s) => s.setChatSearch);
  const replyTo = useWhatsAppStore((s) => s.replyTo);
  const setReplyTo = useWhatsAppStore((s) => s.setReplyTo);
  const clearUnreadBadge = useWhatsAppStore((s) => s.clearUnreadBadge);
  const mergeMessages = useWhatsAppStore((s) => s.mergeMessages);
  const upsertConversation = useWhatsAppStore((s) => s.upsertConversation);
  const messages = useWhatsAppStore((s) => s.messages);
  const conversationById = useWhatsAppStore((s) => s.conversationById);

  const qc = useQueryClient();

  // La conversation vient normalement de la liste ; si l'app est ouverte
  // directement sur un chat (lien profond, reprise après redémarrage) elle n'est
  // pas dans le store et on la récupère par son détail.
  const storeConv = conversationId ? (conversationById[conversationId] ?? null) : null;
  const convQuery = useConversation(storeConv ? null : conversationId);
  const fetchedConv = convQuery.data;
  const activeConv = storeConv ?? fetchedConv ?? null;
  /** Vrai quand la conversation est introuvable (et non simplement en cours de chargement). */
  const convUnavailable = !activeConv && !convQuery.isPending;

  useEffect(() => {
    if (fetchedConv) upsertConversation(fetchedConv);
  }, [fetchedConv, upsertConversation]);

  // Le store porte la conversation active : SignalR s'en sert pour router
  // `message.new` et pour rejoindre la room (ce qui marque aussi comme lu).
  useEffect(() => {
    setActiveConversationId(conversationId);
    return () => setActiveConversationId(null);
  }, [conversationId, setActiveConversationId]);

  /**
   * Combien de messages récents sont demandés. Grandit quand on remonte le fil,
   * et d'un coup quand la recherche a besoin d'une base plus large.
   */
  const [limit, setLimit] = useState(MESSAGE_PAGE_SIZE);
  useEffect(() => {
    setLimit(MESSAGE_PAGE_SIZE);
  }, [conversationId]);

  const {
    data: msgsData,
    isLoading: msgsLoading,
    isFetching: msgsFetching,
    refetch: refetchMessages,
  } = useMessages(conversationId, limit);

  const loadedCount = msgsData?.items.length ?? 0;
  const totalCount = msgsData?.totalCount ?? loadedCount;
  const hasOlder = !!msgsData?.hasNextPage || totalCount > loadedCount;
  /** Une fenêtre plus large est en vol — le fil affiché est encore l'ancien. */
  const isLoadingOlder = msgsFetching && loadedCount < limit;

  const loadOlder = useCallback(() => {
    if (hasOlder && !msgsFetching) setLimit((l) => l + MESSAGE_PAGE_SIZE);
  }, [hasOlder, msgsFetching]);
  const sendText = useSendText();
  const sendReply = useSendReply();
  const sendMedia = useSendMedia();
  const updateStatus = useUpdateConversationStatus();
  const assignConv = useAssignConversation();

  // La fenêtre récupérée est fusionnée dans le store (les arrivées SignalR
  // survivent), jamais substituée.
  useEffect(() => {
    if (msgsData?.items?.length) mergeMessages(msgsData.items);
  }, [msgsData, mergeMessages]);

  // Badge effacé localement pour un retour immédiat à l'ouverture. L'état de
  // lecture est persisté côté serveur par `JoinConversation` (SignalR), donc le
  // compteur reste à 0 aux rafraîchissements suivants.
  useEffect(() => {
    if (conversationId) clearUnreadBadge(conversationId);
  }, [conversationId, clearUnreadBadge]);

  // Filtrage mémoïsé : on restreint à la conversation active (le store peut
  // brièvement contenir les messages de la précédente pendant un changement),
  // puis on resserre éventuellement avec la recherche interne, et on trie par
  // ordre chronologique croissant quoi que renvoie l'API.
  const filteredMessages = useMemo(() => {
    const byConv = conversationId
      ? messages.filter((m) => !m.conversationId || m.conversationId === conversationId)
      : messages;
    const tsOf = (m: Message) => {
      const t = m.sentAt || m.receivedAt || m.createdAt;
      return t ? new Date(t).getTime() : 0;
    };
    return [...byConv].sort((a, b) => tsOf(a) - tsOf(b));
  }, [messages, conversationId]);

  /**
   * Élargit la fenêtre chargée et rend la main quand l'ensemble plus large est
   * dans le store. Impératif à dessein : la recherche et le saut à une date
   * doivent agir sur le résultat, ce qu'une requête déclarative ne donne pas.
   */
  const extendTo = useCallback(
    async (target: number) => {
      if (!conversationId) return null;
      const result = await qc.fetchQuery({
        queryKey: whatsappKeys.messages(conversationId, target),
        queryFn: () => fetchMessageWindow(conversationId, target),
        staleTime: 60_000,
      });
      mergeMessages(result.items);
      setLimit((l) => Math.max(l, target));
      return result;
    },
    [conversationId, qc, mergeMessages],
  );

  // ── Recherche interne : surlignage + navigation, façon WhatsApp ─────────────

  /**
   * La recherche **surligne** les résultats au lieu de filtrer le fil, comme le
   * web : filtrer masquait le contexte de la conversation. Ordre chronologique.
   */
  const searchMatchIds = useMemo(() => {
    const term = chatSearch.trim().toLowerCase();
    if (!term) return [] as string[];
    return filteredMessages
      .filter(
        (m) =>
          (m.content ?? "").toLowerCase().includes(term) ||
          (m.medias ?? []).some((md) => (md.caption ?? "").toLowerCase().includes(term)),
      )
      .map((m) => m.id);
  }, [chatSearch, filteredMessages]);

  const matchCount = searchMatchIds.length;

  // Le résultat courant est suivi par **id**, jamais par index : la liste est
  // chronologique et remonter le fil insère les résultats plus anciens en tête,
  // donc un index mémorisé se met silencieusement à désigner un autre message.
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);

  useEffect(() => {
    if (matchCount === 0) {
      setActiveMatchId(null);
      return;
    }
    // On garde le résultat courant s'il survit à un recompte ; sinon on part du
    // plus récent, comme WhatsApp.
    setActiveMatchId((current) =>
      current && searchMatchIds.includes(current) ? current : searchMatchIds[matchCount - 1],
    );
  }, [searchMatchIds, matchCount]);

  const activeMatchIndex = activeMatchId ? searchMatchIds.indexOf(activeMatchId) : -1;
  /** 1 = résultat le plus récent, en remontant dans le temps. */
  const activeMatchPosition = activeMatchIndex >= 0 ? matchCount - activeMatchIndex : 0;
  const canGoOlder = activeMatchIndex > 0;
  const canGoNewer = activeMatchIndex >= 0 && activeMatchIndex < matchCount - 1;

  /** Plus ancien dans le temps — le chevron haut. */
  const goToPrevMatch = useCallback(() => {
    const index = activeMatchId ? searchMatchIds.indexOf(activeMatchId) : -1;
    if (index > 0) setActiveMatchId(searchMatchIds[index - 1]);
  }, [activeMatchId, searchMatchIds]);

  /** Plus récent dans le temps — le chevron bas. */
  const goToNextMatch = useCallback(() => {
    const index = activeMatchId ? searchMatchIds.indexOf(activeMatchId) : -1;
    if (index >= 0 && index < searchMatchIds.length - 1) {
      setActiveMatchId(searchMatchIds[index + 1]);
    }
  }, [activeMatchId, searchMatchIds]);

  // La recherche reste locale : elle parcourt les messages déjà dans le fil.
  // Quand la base chargée ne contient rien, on l'élargit une fois en arrière-
  // plan plutôt que d'annoncer « aucun résultat » sur une fenêtre que
  // l'utilisateur n'a pas choisie.
  const debouncedChatSearch = useDebounce(chatSearch, 350);
  const [isExtendingForSearch, setIsExtendingForSearch] = useState(false);
  /** Termes déjà élargis, pour ne pas réessayer indéfiniment. */
  const widenedFor = useRef<string | null>(null);

  useEffect(() => {
    const term = debouncedChatSearch.trim();
    if (term.length < 2) {
      widenedFor.current = null;
      return;
    }
    if (matchCount > 0 || !hasOlder || msgsFetching) return;
    if (widenedFor.current === term) return;
    widenedFor.current = term;

    let cancelled = false;
    setIsExtendingForSearch(true);
    extendTo(limit + SEARCH_EXTEND_SIZE).finally(() => {
      if (!cancelled) setIsExtendingForSearch(false);
    });
    return () => {
      cancelled = true;
    };
  }, [debouncedChatSearch, matchCount, hasOlder, msgsFetching, limit, extendTo]);

  /** « Chercher plus loin », déclenché depuis la barre de recherche. */
  const widenSearchBase = useCallback(() => {
    if (!hasOlder || msgsFetching) return;
    setIsExtendingForSearch(true);
    extendTo(limit + SEARCH_EXTEND_SIZE).finally(() => setIsExtendingForSearch(false));
  }, [hasOlder, msgsFetching, limit, extendTo]);


  // ── Saut à une date ─────────────────────────────────────────────────────────

  /** Id vers lequel la liste doit défiler — posé par la recherche ou le saut. */
  const [scrollTargetId, setScrollTargetId] = useState<string | null>(null);
  const [isJumpingToDate, setIsJumpingToDate] = useState(false);

  useEffect(() => {
    if (activeMatchId) setScrollTargetId(activeMatchId);
  }, [activeMatchId]);

  /** Remet la cible à zéro une fois consommée, pour pouvoir y revenir. */
  const clearScrollTarget = useCallback(() => setScrollTargetId(null), []);

  /**
   * Jours (`aaaa-mm-jj`) qui portent un message chargé — pointés dans le
   * sélecteur. Les autres dates restent choisissables : le saut pagine alors
   * en arrière pour aller les chercher.
   */
  const availableDays = useMemo(() => {
    const days = new Set<string>();
    for (const m of filteredMessages) {
      const key = localDayKey(tsOfMessage(m));
      if (key) days.add(key);
    }
    return [...days].sort();
  }, [filteredMessages]);

  /**
   * Défile jusqu'au premier message du jour `day`, en paginant en arrière si ce
   * jour n'est pas encore chargé. Renvoie faux quand la conversation n'a aucun
   * message ce jour-là (ou que le garde-fou a été atteint).
   */
  const jumpToDate = useCallback(
    async (day: string): Promise<boolean> => {
      if (!day || !conversationId) return false;
      const scoped = (items: Message[]) =>
        items.filter((m) => !m.conversationId || m.conversationId === conversationId);

      let hit = findFirstOfDay(filteredMessages, day);

      if (!hit) {
        setIsJumpingToDate(true);
        try {
          let target = limit;
          for (let step = 0; step < MAX_WIDEN_STEPS; step += 1) {
            target += SEARCH_EXTEND_SIZE;
            const result = await extendTo(target);
            if (!result) break;
            const mine = scoped(result.items);
            hit = findFirstOfDay(mine, day);
            if (hit) break;
            const oldest = oldestTs(mine);
            if (!result.hasNextPage) break;
            // On a paginé au-delà du jour visé : il ne porte aucun message.
            if (oldest && localDayKey(oldest) < day) break;
          }
        } finally {
          setIsJumpingToDate(false);
        }
      }

      if (!hit) return false;
      setScrollTargetId(hit.id);
      return true;
    },
    [conversationId, filteredMessages, limit, extendTo],
  );

  const messageVMs = useMemo<MessageViewModel[]>(
    () =>
      filteredMessages.map((m) => {
        const ts = m.sentAt || m.receivedAt || m.createdAt;
        const isOut = (m.direction || "").toUpperCase() === "OUTBOUND";
        return {
          id: m.id,
          isOutbound: isOut,
          content: m.content ?? null,
          messageType: (m.messageType || "TEXT").toUpperCase(),
          timeStr: fmtTimeShort(ts),
          status: (m.status || "").toUpperCase(),
          medias: m.medias ?? [],
          replyToContent: m.replyToMessageContent ?? null,
          replyToAuthor: m.replyToMessageId
            ? isOut
              ? "Vous"
              : m.sentByUserFirstName || activeConv?.contactAddress || "Contact"
            : null,
          senderName: !isOut && m.sentByUserFirstName ? m.sentByUserFirstName : null,
          externalMessageId: m.externalMessageId ?? null,
          rawMessage: m,
        };
      }),
    [filteredMessages, activeConv],
  );

  // ── Galerie média ───────────────────────────────────────────────────────────

  const galleryItems = useMemo<GalleryItem[]>(() => {
    const out: GalleryItem[] = [];
    for (const vm of messageVMs) {
      const m = vm.rawMessage;
      const ts = m.sentAt || m.receivedAt || m.createdAt || null;

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

      // Les messages plus anciens portent le fichier comme URL nue dans
      // `content` avec un messageType typé — les bulles les rendent aussi, la
      // galerie doit donc les voir sinon elle paraît vide sur ces discussions.
      const kind = CONTENT_MEDIA_KIND[vm.messageType];
      if (kind && vm.content) {
        out.push({
          key: `${vm.id}-c`,
          messageId: vm.id,
          kind,
          url: vm.content,
          fileName: vm.content.split("/").pop() || null,
          caption: null,
          timestamp: ts,
        });
      }
    }
    // Du plus récent au plus ancien, comme le panneau « Médias, liens et docs ».
    return out.reverse();
  }, [messageVMs]);

  // Fenêtre de service client WhatsApp (24h) : les messages libres ne sont
  // autorisés que dans les 24h suivant le dernier message ENTRANT du contact.
  // Au-delà (ou sans entrant du tout), seuls les templates peuvent partir.
  // Calculé sur tous les messages, indépendamment de la recherche interne.
  const lastInboundTs = useMemo(() => {
    let max = 0;
    for (const m of messages) {
      if (conversationId && m.conversationId && m.conversationId !== conversationId) continue;
      if ((m.direction || "").toUpperCase() !== "INBOUND") continue;
      const t = m.receivedAt || m.sentAt || m.createdAt;
      const ms = t ? new Date(t).getTime() : 0;
      if (ms > max) max = ms;
    }
    return max;
  }, [messages, conversationId]);

  const sessionWindowClosed =
    !msgsLoading && (lastInboundTs === 0 || Date.now() - lastInboundTs >= SESSION_WINDOW_MS);

  const chatHeaderVM = useMemo(() => {
    if (!activeConv) return null;
    const sub = [activeConv.senderName, activeConv.channelName].filter(Boolean).join(" · ");
    const assignedName = activeConv.assignedToUserFirstName
      ? `${activeConv.assignedToUserFirstName} ${activeConv.assignedToUserLastName || ""}`.trim()
      : null;
    return {
      initials: getInitials(activeConv.contactAddress || "?"),
      avatarBg: avatarColor(activeConv.id),
      name: activeConv.contactAddress || "—",
      // Le web affiche l'expéditeur/canal puis l'agent assigné en teal, séparés.
      sub: sub || "WhatsApp",
      assignedName,
      status: (activeConv.status || "OPEN").toUpperCase(),
      assignedToUserId: activeConv.assignedToUserId ?? "",
      contactAddress: activeConv.contactAddress ?? "",
    };
  }, [activeConv]);

  // ── Actions ─────────────────────────────────────────────────────────────────

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || !activeConv) return;

      const to = activeConv.contactAddress ?? "";
      if (replyTo?.messageId) {
        const msg = messages.find((m) => m.id === replyTo.messageId);
        if (msg?.externalMessageId) {
          await sendReply.mutateAsync({
            to,
            body: text,
            replyToExternalMessageId: msg.externalMessageId,
          });
        } else {
          await sendText.mutateAsync({ to, body: text });
        }
        setReplyTo(null);
      } else {
        await sendText.mutateAsync({ to, body: text });
      }

      // Filet de sécurité limité à la conversation courante (SignalR reste la
      // source primaire du message renvoyé par le serveur).
      setTimeout(() => {
        qc.invalidateQueries({ queryKey: whatsappKeys.messages(conversationId ?? "") });
      }, 500);
    },
    [activeConv, replyTo, messages, sendReply, sendText, setReplyTo, qc, conversationId],
  );

  const handleSendMedia = useCallback(
    async (items: PendingMedia[]) => {
      if (!activeConv || items.length === 0) return;
      await sendMedia.mutateAsync({ to: activeConv.contactAddress ?? "", items });
    },
    [activeConv, sendMedia],
  );

  const handleStatusChange = useCallback(
    (status: ConversationStatus) => {
      if (!conversationId) return;
      updateStatus.mutate({ id: conversationId, status });
    },
    [conversationId, updateStatus],
  );

  const handleAssign = useCallback(
    (userId: string) => {
      if (!conversationId) return;
      assignConv.mutate({ id: conversationId, userId });
    },
    [conversationId, assignConv],
  );

  const handleSetReply = useCallback(
    (msg: Message) => {
      const isOut = (msg.direction || "").toUpperCase() === "OUTBOUND";
      setReplyTo({
        messageId: msg.id,
        content: msg.content || "[Média]",
        author: isOut
          ? "Vous"
          : msg.sentByUserFirstName || activeConv?.contactAddress || "Contact",
      });
    },
    [setReplyTo, activeConv],
  );

  const getMessageDetails = useCallback(
    (id: string): Message | undefined => messages.find((m) => m.id === id),
    [messages],
  );

  return {
    activeConv,
    convUnavailable,
    chatHeaderVM,
    messageVMs,
    msgsLoading,
    // Pagination
    hasOlder,
    isLoadingOlder,
    loadOlder,
    // Galerie
    galleryItems,
    // Recherche
    matchCount,
    activeMatchId,
    activeMatchPosition,
    canGoOlder,
    canGoNewer,
    goToPrevMatch,
    goToNextMatch,
    widenSearchBase,
    isExtendingForSearch,
    // Ce que la recherche a réellement couvert. Sans ça, « aucun » se lirait
    // « ce mot n'a jamais été dit », alors qu'il n'est qu'absent de la tranche
    // chargée jusqu'ici.
    searchBaseCount: loadedCount,
    searchTotalCount: totalCount,
    canWidenSearchBase: hasOlder,
    searchExtendSize: SEARCH_EXTEND_SIZE,
    // Saut à une date
    scrollTargetId,
    clearScrollTarget,
    availableDays,
    jumpToDate,
    isJumpingToDate,
    chatSearch,
    setChatSearch,
    replyTo,
    setReplyTo,
    sessionWindowClosed,
    isSending: sendText.isPending || sendReply.isPending,
    isSendingMedia: sendMedia.isPending,
    handleSendMessage,
    handleSendMedia,
    handleStatusChange,
    handleAssign,
    handleSetReply,
    getMessageDetails,
    refetchMessages,
  };
}
