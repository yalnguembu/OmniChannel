import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { MessageViewModel } from "@/hooks/useChatViewModel";
import { localDayDiff, toUtcDate } from "@/models/whatsapp.models";
import { colors, radius } from "@/theme";
import { MessageBubble } from "./MessageBubble";

/** Une série de messages est coupée après une pause de ce délai, comme WhatsApp. */
const GROUP_GAP_MS = 15 * 60 * 1000;
/** Distance au bas de la liste au-delà de laquelle le bouton « descendre » apparaît. */
const JUMP_THRESHOLD_PX = 260;

type Row =
  | { type: "day"; key: string; label: string }
  | { type: "msg"; key: string; vm: MessageViewModel; isFirstOfGroup: boolean };

function tsOf(vm: MessageViewModel) {
  return vm.rawMessage.sentAt || vm.rawMessage.receivedAt || vm.rawMessage.createdAt;
}

function formatDateSep(ts: string | null | undefined): string {
  if (!ts) return "";
  const d = toUtcDate(ts);
  // Différence en jours calendaires locaux — même base que l'heure des bulles,
  // le séparateur ne peut donc pas contredire les heures affichées.
  const diff = localDayDiff(ts);
  if (diff <= 0) return "Aujourd'hui";
  if (diff === 1) return "Hier";
  if (diff < 7) return d.toLocaleDateString("fr-FR", { weekday: "long" });
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

interface MessagesListProps {
  conversationId: string | null;
  vms: MessageViewModel[];
  isLoading: boolean;
  onLongPressMessage: (vm: MessageViewModel) => void;
  onOpenImage: (url: string, caption?: string) => void;
  onOpenVideo: (url: string) => void;
}

export function MessagesList({
  conversationId,
  vms,
  isLoading,
  onLongPressMessage,
  onOpenImage,
  onOpenVideo,
}: MessagesListProps) {
  const listRef = useRef<FlatList<Row>>(null);
  /** Vrai tant que la vue est collée au bas — pilote le suivi automatique. */
  const pinnedRef = useRef(true);
  const [showJump, setShowJump] = useState(false);
  const [newCount, setNewCount] = useState(0);

  // Lignes de la liste : séparateurs de jour + bulles, avec le regroupement par
  // auteur. Calculé ici (et pas dans la bulle) pour que la bulle reste une
  // fonction pure de ses props.
  const rows = useMemo<Row[]>(() => {
    const out: Row[] = [];
    let currentLabel: string | null = null;
    let prev: MessageViewModel | null = null;

    for (const vm of vms) {
      const ts = tsOf(vm);
      const label = formatDateSep(ts);
      if (label !== currentLabel) {
        currentLabel = label;
        out.push({ type: "day", key: `day-${label}-${vm.id}`, label });
        prev = null; // un nouveau jour démarre toujours une nouvelle série
      }

      const sameAuthor =
        prev !== null &&
        prev.isOutbound === vm.isOutbound &&
        (prev.senderName ?? "") === (vm.senderName ?? "");
      const prevTs = prev ? tsOf(prev) : null;
      const closeInTime =
        !!prevTs &&
        !!ts &&
        new Date(ts).getTime() - new Date(prevTs).getTime() < GROUP_GAP_MS;

      out.push({
        type: "msg",
        key: vm.id,
        vm,
        isFirstOfGroup: !(sameAuthor && closeInTime),
      });
      prev = vm;
    }

    // La liste est inversée (le bas est l'offset 0) : on démarre donc au dernier
    // message sans calcul de scroll, et le clavier ne décale pas la vue.
    return out.reverse();
  }, [vms]);

  const lastId = vms.length ? vms[vms.length - 1].id : null;
  const prevLastIdRef = useRef<string | null>(null);

  // Changement de discussion : on repart collé au bas, sans compteur hérité.
  useEffect(() => {
    pinnedRef.current = true;
    prevLastIdRef.current = null;
    setNewCount(0);
    setShowJump(false);
  }, [conversationId]);

  // Un nouveau dernier message (envoyé, reçu, ou arrivé par SignalR). On se cale
  // sur l'id — pas sur la longueur — pour qu'un filtre ou un séparateur de jour
  // ne déclenche jamais de saut.
  useEffect(() => {
    if (lastId === null || lastId === prevLastIdRef.current) return;
    const isFirstLoad = prevLastIdRef.current === null;
    prevLastIdRef.current = lastId;
    if (isFirstLoad) return;
    if (pinnedRef.current) {
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    } else {
      setNewCount((c) => c + 1);
    }
  }, [lastId]);

  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    // Liste inversée : l'offset 0 est le bas (message le plus récent).
    const y = e.nativeEvent.contentOffset.y;
    pinnedRef.current = y < 80;
    setShowJump(y > JUMP_THRESHOLD_PX);
    if (pinnedRef.current) setNewCount(0);
  }, []);

  const handleJump = useCallback(() => {
    pinnedRef.current = true;
    setNewCount(0);
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Row }) => {
      if (item.type === "day") {
        return (
          <View style={styles.daySepWrap}>
            <Text style={styles.daySep}>{item.label}</Text>
          </View>
        );
      }
      return (
        <MessageBubble
          vm={item.vm}
          isFirstOfGroup={item.isFirstOfGroup}
          onLongPress={onLongPressMessage}
          onOpenImage={onOpenImage}
          onOpenVideo={onOpenVideo}
        />
      );
    },
    [onLongPressMessage, onOpenImage, onOpenVideo],
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.green} />
      </View>
    );
  }

  if (vms.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>Aucun message</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={rows}
        inverted
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        onScroll={handleScroll}
        scrollEventThrottle={64}
        keyboardDismissMode="interactive"
        contentContainerStyle={styles.content}
        initialNumToRender={20}
        maxToRenderPerBatch={12}
        windowSize={9}
        removeClippedSubviews
      />

      {showJump ? (
        <Pressable style={styles.jump} onPress={handleJump} accessibilityLabel="Aller au dernier message">
          <Ionicons name="chevron-down" size={22} color={colors.icon} />
          {newCount > 0 ? (
            <View style={styles.jumpBadge}>
              <Text style={styles.jumpBadgeText}>{newCount > 99 ? "99+" : newCount}</Text>
            </View>
          ) : null}
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingVertical: 10 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  empty: { color: colors.muted, fontSize: 13 },
  daySepWrap: { alignItems: "center", marginVertical: 10 },
  daySep: {
    backgroundColor: colors.white,
    color: colors.icon,
    fontSize: 12.5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.md,
    overflow: "hidden",
    textTransform: "capitalize",
  },
  jump: {
    position: "absolute",
    right: 14,
    bottom: 14,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  jumpBadge: {
    position: "absolute",
    top: -3,
    right: -3,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: 10,
    backgroundColor: colors.green,
    alignItems: "center",
    justifyContent: "center",
  },
  jumpBadgeText: { color: colors.white, fontSize: 11, fontWeight: "600" },
});
