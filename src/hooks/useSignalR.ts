import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import type { Conversation, Message } from '@/models/whatsapp.models';
import * as signalR from '@microsoft/signalr';
import { useWhatsAppStore } from '@/store/useWhatsappStore';

const apiUrl = (import.meta.env.VITE_API_URL as string) || '';
export const BASE_URL =
  (import.meta.env.VITE_SIGNALR_URL as string) ||
  apiUrl.replace(/\/api\/?$/, '');

interface HubConnection {
  state: string;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  invoke: (method: string, ...args: unknown[]) => Promise<unknown>;
  on: (event: string, handler: (payload: unknown) => void) => void;
  onreconnecting: (handler: () => void) => void;
  onreconnected: (handler: () => void) => void;
  onclose: (handler: () => void) => void;
}

export function useSignalR() {
  const connectionRef = useRef<HubConnection | null>(null);
  const {
    activeConversationId,
    appendMessage,
    updateMessage,
    upsertConversation,
  } = useWhatsAppStore();

  const activeIdRef = useRef(activeConversationId);
  activeIdRef.current = activeConversationId;

  useEffect(() => {
    const hub = new signalR.HubConnectionBuilder()
      .withUrl(BASE_URL + '/hubs/conversations')
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connectionRef.current = hub;

    hub.onreconnecting(() => toast.info('Reconnexion en cours...'));
    hub.onreconnected(async () => {
      toast.success('Reconnecté');
      await hub.invoke('JoinInbox');
      if (activeIdRef.current) {
        await hub.invoke('JoinConversation', activeIdRef.current);
      }
    });
    hub.onclose(() => toast.warning('Déconnecté'));

    hub.on('message.new', (payload) => {
      const msg = payload as Message;
      if (activeIdRef.current && msg.conversationId === activeIdRef.current) {
        appendMessage(msg);
      }
    });

    hub.on('message.updated', (payload) => {
      const msg = payload as Message;
      updateMessage(msg);
    });

    hub.on('conversation.updated', (payload) => {
      upsertConversation(payload as Conversation);
    });

    hub.on('conversation.created', (payload) => {
      upsertConversation(payload as Conversation);
    });

    const start = async () => {
      try {
        if (hub.state === signalR.HubConnectionState.Disconnected) {
          await hub.start();
          await hub.invoke('JoinInbox');
          if (activeIdRef.current) {
            await hub.invoke('JoinConversation', activeIdRef.current);
          }
        }
      } catch (err) {
        console.error('SignalR start error:', err);
        setTimeout(start, 5000);
      }
    };

    start();

    return () => {
      hub.stop();
    };
  }, [appendMessage, updateMessage, upsertConversation]);

  // Join/leave conversation rooms on active change
  useEffect(() => {
    const hub = connectionRef.current;
    if (!hub) return;
    if (activeConversationId) {
      hub.invoke('JoinConversation', activeConversationId).catch(console.error);
    }
  }, [activeConversationId]);

  return connectionRef;
}
