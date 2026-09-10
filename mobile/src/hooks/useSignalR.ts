import * as signalR from "@microsoft/signalr";
import { useCallback, useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { SIGNALR_URL } from "@/api/client";
import type { Conversation, Message } from "@/models/whatsapp.models";
import { useAuthStore } from "@/store/authStore";
import { useWhatsAppStore } from "@/store/whatsappStore";

/**
 * Temps réel de l'inbox — portage de `src/hooks/useSignalR.ts` du web, avec deux
 * adaptations mobiles :
 *  - le hub est authentifié par `accessTokenFactory` (pas de cookie de session) ;
 *  - la connexion est relancée au retour au premier plan, l'OS coupant les
 *    sockets d'une app en arrière-plan.
 */
export function useSignalR() {
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  // Le hub est authentifié : tant qu'aucun token n'est en place, on ne tente rien
  // (et on (re)connecte dès qu'il arrive, après le login ou la réhydratation).
  const token = useAuthStore((s) => s.token);
  const activeConversationId = useWhatsAppStore((s) => s.activeConversationId);
  const appendMessage = useWhatsAppStore((s) => s.appendMessage);
  const updateMessage = useWhatsAppStore((s) => s.updateMessage);
  const batchUpsertConversations = useWhatsAppStore((s) => s.batchUpsertConversations);

  const activeIdRef = useRef(activeConversationId);
  activeIdRef.current = activeConversationId;

  // Regroupe les événements conversation reçus dans la même frame en une seule
  // mise à jour du store : évite la cascade de rendus lors d'un envoi de masse.
  const pendingConvsRef = useRef<Conversation[]>([]);
  const batchFrameRef = useRef<number | null>(null);

  const flushBatch = useCallback(() => {
    batchFrameRef.current = null;
    const batch = pendingConvsRef.current.splice(0);
    if (batch.length > 0) batchUpsertConversations(batch);
  }, [batchUpsertConversations]);

  const scheduleBatch = useCallback(
    (conv: Conversation) => {
      pendingConvsRef.current.push(conv);
      if (batchFrameRef.current === null) {
        batchFrameRef.current = requestAnimationFrame(flushBatch);
      }
    },
    [flushBatch],
  );

  useEffect(() => {
    if (!SIGNALR_URL || !token) return;

    const hub = new signalR.HubConnectionBuilder()
      .withUrl(`${SIGNALR_URL}/hubs/conversations`, {
        accessTokenFactory: () => useAuthStore.getState().token ?? "",
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connectionRef.current = hub;

    const joinRooms = async () => {
      await hub.invoke("JoinInbox");
      if (activeIdRef.current) await hub.invoke("JoinConversation", activeIdRef.current);
    };

    hub.onreconnected(async () => {
      try {
        await joinRooms();
      } catch (err) {
        console.warn("SignalR rejoin error", err);
      }
    });

    hub.on("message.new", (payload: unknown) => {
      const msg = payload as Message;
      if (activeIdRef.current && msg.conversationId === activeIdRef.current) {
        appendMessage(msg);
      }
    });

    hub.on("message.updated", (payload: unknown) => {
      updateMessage(payload as Message);
    });

    hub.on("conversation.updated", (payload: unknown) => {
      scheduleBatch(payload as Conversation);
    });

    hub.on("conversation.created", (payload: unknown) => {
      scheduleBatch(payload as Conversation);
    });

    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let disposed = false;

    const start = async () => {
      if (disposed) return;
      try {
        if (hub.state === signalR.HubConnectionState.Disconnected) {
          await hub.start();
          await joinRooms();
        }
      } catch (err) {
        console.warn("SignalR start error", err);
        retryTimer = setTimeout(start, 5000);
      }
    };

    start();

    // L'OS suspend les sockets en arrière-plan : au retour au premier plan on
    // relance si besoin (`withAutomaticReconnect` ne couvre pas un socket tué).
    const onAppState = (status: AppStateStatus) => {
      if (status === "active" && hub.state === signalR.HubConnectionState.Disconnected) {
        start();
      }
    };
    const appStateSub = AppState.addEventListener("change", onAppState);

    return () => {
      disposed = true;
      appStateSub.remove();
      if (retryTimer) clearTimeout(retryTimer);
      if (batchFrameRef.current !== null) {
        cancelAnimationFrame(batchFrameRef.current);
        batchFrameRef.current = null;
      }
      pendingConvsRef.current = [];
      hub.stop().catch(() => {
        /* connexion déjà fermée */
      });
    };
  }, [appendMessage, updateMessage, scheduleBatch, token]);

  // Rejoint la room de la conversation active. `JoinConversation` marque aussi la
  // conversation comme lue côté serveur : c'est ce qui persiste l'état de lecture
  // (il n'existe pas d'endpoint REST « marquer comme lu »).
  // On n'invoque que si la connexion est établie — sinon `start()` /
  // `onreconnected` rejoignent `activeIdRef.current` dès qu'elle l'est.
  useEffect(() => {
    const hub = connectionRef.current;
    if (!hub || !activeConversationId) return;
    if (hub.state === signalR.HubConnectionState.Connected) {
      hub.invoke("JoinConversation", activeConversationId).catch((err) => {
        console.warn("JoinConversation error", err);
      });
    }
  }, [activeConversationId]);

  return connectionRef;
}
