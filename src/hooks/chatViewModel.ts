import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useMessages,
  useSendText,
  useSendReply,
  useSendMedia,
  useUpdateConversationStatus,
  useAssignConversation,
  whatsappKeys,
} from './useWhatsapp';
import {
  fmtTimeShort,
  fmtTimeFull,
  getInitials,
  avatarColor,
  type ConversationStatus,
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

export function useChatViewModel() {
  const {
    activeConversationId,
    setActiveConversationId,
    setMessages,
    messages,
    chatSearch,
    setChatSearch,
    replyTo,
    setReplyTo,
    getActiveConversation,
    getFilteredMessages,
    clearUnreadBadge,
    setMobileChatOpen,
  } = useWhatsAppStore();

  const qc = useQueryClient();
  const activeConv = getActiveConversation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { data: msgsData, isLoading: msgsLoading } = useMessages(activeConversationId);
  const sendText = useSendText();
  const sendReply = useSendReply();
  const sendMedia = useSendMedia();
  const updateStatus = useUpdateConversationStatus();
  const assignConv = useAssignConversation();

  // Sync messages to store
  useEffect(() => {
    if (msgsData) setMessages(msgsData);
  }, [msgsData, setMessages]);

  // Clear unread when opening a conversation
  useEffect(() => {
    if (activeConversationId) clearUnreadBadge(activeConversationId);
  }, [activeConversationId, clearUnreadBadge]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const filteredMessages = getFilteredMessages();

  const messageVMs = useMemo((): MessageViewModel[] =>
    filteredMessages.map((m): MessageViewModel => {
      const ts = m.sentAt || m.receivedAt || m.createdAt;
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
  [filteredMessages, activeConv]);

  const chatHeaderVM = useMemo(() => {
    if (!activeConv) return null;
    const sub = [activeConv.senderName, activeConv.channelName]
      .filter(Boolean)
      .join(' · ');
    const assignedName = activeConv.assignedToUserFirstName
      ? `${activeConv.assignedToUserFirstName} ${activeConv.assignedToUserLastName || ''}`.trim()
      : null;
    return {
      initials: getInitials(activeConv.contactAddress || '?'),
      avatarBg: avatarColor(activeConv.id),
      name: `${activeConv.contactAddress}` || '—',
      sub: assignedName ? `${sub ? sub + ' · ' : ''}${assignedName}` : sub || 'WhatsApp',
      status: activeConv.status || 'OPEN',
      assignedToUserId: activeConv.assignedToUserId ?? '',
      contactAddress: activeConv.contactAddress ?? '',
    };
  }, [activeConv]);

  // ── Actions ─────────────────────────────────────────────────────────────────

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || !activeConv) return;

      const to = activeConv.contactAddress ?? '';
      if (replyTo?.messageId) {
        // Need the external message id
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

      // Refetch messages as fallback (SignalR should handle it)
      setTimeout(() => {
        qc.invalidateQueries({ queryKey: whatsappKeys.messages(activeConversationId ?? '') });
      }, 500);
    },
    [activeConv, replyTo, messages, sendReply, sendText, setReplyTo, qc, activeConversationId]
  );

  const handleSendMedia = useCallback(
    async (file: File, type: 'image' | 'audio' | 'document') => {
      if (!activeConv) return;
      await sendMedia.mutateAsync({ to: activeConv.contactAddress ?? '', file, type });
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
    messageVMs,
    msgsLoading,
    chatSearch,
    setChatSearch,
    replyTo,
    setReplyTo,
    messagesEndRef,
    inputRef,
    isSending: sendText.isPending || sendReply.isPending,
    handleSendMessage,
    handleSendMedia,
    handleStatusChange,
    handleAssign,
    handleSetReply,
    handleBack,
    getMessageDetails,
  };
}
