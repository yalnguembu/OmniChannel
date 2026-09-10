import { useCallback, useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { LocalFile } from "@/api/endpoints";
import {
  avatarColor,
  fmtTimeShort,
  getInitials,
  SESSION_WINDOW_MS,
  type ConversationStatus,
  type Media,
  type Message,
} from "@/models/whatsapp.models";
import { useWhatsAppStore } from "@/store/whatsappStore";
import {
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

/** ViewModel d'une discussion — portage de `src/hooks/chatViewModel.ts` du web. */
export function useChatViewModel(conversationId: string | null) {
  const setActiveConversationId = useWhatsAppStore((s) => s.setActiveConversationId);
  const setMessages = useWhatsAppStore((s) => s.setMessages);
  const chatSearch = useWhatsAppStore((s) => s.chatSearch);
  const setChatSearch = useWhatsAppStore((s) => s.setChatSearch);
  const replyTo = useWhatsAppStore((s) => s.replyTo);
  const setReplyTo = useWhatsAppStore((s) => s.setReplyTo);
  const clearUnreadBadge = useWhatsAppStore((s) => s.clearUnreadBadge);
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

  const { data: msgsData, isLoading: msgsLoading, refetch: refetchMessages } =
    useMessages(conversationId);
  const sendText = useSendText();
  const sendReply = useSendReply();
  const sendMedia = useSendMedia();
  const updateStatus = useUpdateConversationStatus();
  const assignConv = useAssignConversation();

  useEffect(() => {
    if (msgsData) setMessages(msgsData);
  }, [msgsData, setMessages]);

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
    const lower = chatSearch.toLowerCase();
    const searched = chatSearch
      ? byConv.filter((m) => (m.content || "").toLowerCase().includes(lower))
      : byConv;
    const tsOf = (m: Message) => {
      const t = m.sentAt || m.receivedAt || m.createdAt;
      return t ? new Date(t).getTime() : 0;
    };
    return [...searched].sort((a, b) => tsOf(a) - tsOf(b));
  }, [messages, chatSearch, conversationId]);

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
      sub: assignedName ? `${sub ? sub + " · " : ""}${assignedName}` : sub || "WhatsApp",
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
    async (file: LocalFile, caption?: string) => {
      if (!activeConv) return;
      await sendMedia.mutateAsync({ to: activeConv.contactAddress ?? "", file, caption });
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
