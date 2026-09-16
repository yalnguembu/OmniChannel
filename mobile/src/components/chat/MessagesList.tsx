import { ChevronDown } from "lucide-react-native";
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

/**
 * Fil de messages — portage de `MessagesList` du web : mêmes séparateurs de
 * jour, même pilule « charger les messages plus anciens », même bouton de
 * retour au dernier message.
 */

/** Une série de messages est coupée après une pause de ce délai, comme WhatsApp. */
const GROUP_GAP_MS = 15 * 60 * 1000;
/** Distance au bas de la liste au-delà de laquelle le bouton « descendre » apparaît. */
const JUMP_THRESHOLD_PX = 260;

type Row =
  | { type: "day"; key: string; label: string }
  | { type: "older"; key: string }
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

/** Majuscule sur la première lettre — le `first-letter:uppercase` du web. */
function capitalize(s: string): string {
  return s.length > 0 ? s[0].toUpperCase() + s.slice(1) : s;
}

interface MessagesListProps {
  conversationId: string | null;
  vms: MessageViewModel[];
  isLoading: boolean;
  /** De l'historique reste à charger. */
  hasOlder: boolean;
  isLoadingOlder: boolean;
  onLoadOlder: () => void;
  /** Message à mettre en évidence et vers lequel défiler (résultat de recherche). */
  /** Résultat actuellement visé par la navigation de recherche. */
  activeMatchId?: string | null;
  /** Terme cherché, surligné dans le texte des bulles. */
  highlightTerm?: string;
  scrollTargetId?: string | null;
  onScrollTargetReached?: () => void;
  onLongPressMessage: (vm: MessageViewModel) => void;
  onOpenImage: (url: string, caption?: string) => void;
  onOpenVideo: (url: string) => void;
}

export function MessagesList({
  conversationId,
  vms,
  isLoading,
  hasOlder,
  isLoadingOlder,
  onLoadOlder,
  activeMatchId,
  highlightTerm,
  scrollTargetId,
  onScrollTargetReached,
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
        !!prevTs && !!ts && new Date(ts).getTime() - new Date(prevTs).getTime() < GROUP_GAP_MS;

      out.push({ type: "msg", key: vm.id, vm, isFirstOfGroup: !(sameAuthor && closeInTime) });
      prev = vm;
    }

    // Indicateur d'historique, épinglé au-dessus de la première bulle.
    if (hasOlder || isLoadingOlder) out.unshift({ type: "older", key: "older" });

    // La liste est inversée (le bas est l'offset 0) : on démarre donc au dernier
    // message sans calcul de scroll, et le clavier ne décale pas la vue.
    return out.reverse();
  }, [vms, hasOlder, isLoadingOlder]);

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

  // Défilement vers un résultat de recherche.
  useEffect(() => {
    if (!scrollTargetId) return;
    const index = rows.findIndex((r) => r.type === "msg" && r.vm.id === scrollTargetId);
    if (index < 0) return;
    listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
    onScrollTargetReached?.();
  }, [scrollTargetId, rows, onScrollTargetReached]);

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
            <Text style={styles.daySep}>{capitalize(item.label)}</Text>
          </View>
        );
      }
      if (item.type === "older") {
        return (
          <View style={styles.olderWrap}>
            {isLoadingOlder ? (
              <View style={styles.olderPill}>
                <ActivityIndicator size="small" color={colors.green} />
                <Text style={styles.olderText}>Chargement des messages…</Text>
              </View>
            ) : (
              <Pressable style={styles.olderPill} onPress={onLoadOlder}>
                <Text style={styles.olderText}>Charger les messages plus anciens</Text>
              </Pressable>
            )}
          </View>
        );
      }
      return (
        <MessageBubble
          vm={item.vm}
          isFirstOfGroup={item.isFirstOfGroup}
          highlightTerm={highlightTerm}
          isActiveMatch={!!activeMatchId && activeMatchId === item.vm.id}
          onLongPress={onLongPressMessage}
          onOpenImage={onOpenImage}
          onOpenVideo={onOpenVideo}
        />
      );
    },
    [
      isLoadingOlder,
      onLoadOlder,
      activeMatchId,
      highlightTerm,
      onLongPressMessage,
      onOpenImage,
      onOpenVideo,
    ],
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
        // Même raison que dans la liste des discussions : après une saisie dans
        // la recherche du chat, un appui long sur une bulle ne doit pas être
        // consommé par la fermeture du clavier.
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
        // La liste étant inversée, « la fin » est le haut du fil : c'est là que
        // l'historique se charge, comme le `requestOlder` du web au scroll.
        onEndReached={hasOlder && !isLoadingOlder ? onLoadOlder : undefined}
        onEndReachedThreshold={0.5}
        initialNumToRender={20}
        maxToRenderPerBatch={12}
        windowSize={9}
        removeClippedSubviews
        onScrollToIndexFailed={() => {
          /* la cible n'est pas encore montée : le prochain rendu réessaiera */
        }}
      />

      {showJump ? (
        <Pressable
          style={styles.jump}
          onPress={handleJump}
          accessibilityLabel="Aller au dernier message"
        >
          <ChevronDown size={22} color={colors.icon} />
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

/** Ombre des pilules blanches du fil — `shadow-[0_1px_0.5px_rgba(11,20,26,0.13)]`. */
const pillShadow = {
  shadowColor: "#0b141a",
  shadowOpacity: 0.13,
  shadowRadius: 0.5,
  shadowOffset: { width: 0, height: 1 },
  elevation: 1,
} as const;

const styles = StyleSheet.create({
  container: { flex: 1 },
  // `px-[5%]` du web.
  content: { paddingHorizontal: "5%", paddingTop: 12, paddingBottom: 8 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  empty: { color: colors.muted, fontSize: 14 },
  daySepWrap: { alignItems: "center", paddingVertical: 6 },
  daySep: {
    backgroundColor: colors.white,
    color: colors.icon,
    fontSize: 12.5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.md,
    overflow: "hidden",
    ...pillShadow,
  },
  olderWrap: { alignItems: "center", paddingVertical: 12 },
  olderPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    ...pillShadow,
  },
  olderText: { fontSize: 12, color: colors.icon },
  jump: {
    position: "absolute",
    right: 20,
    bottom: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0b141a",
    shadowOpacity: 0.25,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 4,
  },
  jumpBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 4,
    borderRadius: 10,
    backgroundColor: colors.green,
    alignItems: "center",
    justifyContent: "center",
  },
  jumpBadgeText: { color: colors.white, fontSize: 11, fontWeight: "500" },
});
