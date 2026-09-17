import { AlertCircle, Check, CheckCheck, ChevronDown } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, STATUS_LABELS } from "@/theme";

/** Compteur de messages non lus. */
export function UnreadBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <View style={styles.unread}>
      <Text style={styles.unreadText}>{count > 99 ? "99+" : count}</Text>
    </View>
  );
}

/** Point coloré rappelant le statut de la conversation. */
export function StatusDot({ status }: { status: string }) {
  return (
    <View
      style={[styles.dot, { backgroundColor: colors.status[status] ?? colors.status.CLOSED }]}
    />
  );
}

/**
 * Pilule de statut — équivalent du `StatusPill` du web, qui est un menu
 * déroulant : ici l'appui ouvre la feuille de statut.
 */
export function StatusPill({
  status,
  onPress,
}: {
  status: string;
  onPress?: () => void;
}) {
  const tint = colors.status[status] ?? colors.status.CLOSED;
  return (
    <Pressable
      // Décorative quand elle n'est pas cliquable : elle ne doit pas
      // s'annoncer comme la commande de statut (ni la concurrencer au test).
      accessibilityLabel={onPress ? "Statut de la conversation" : undefined}
      onPress={onPress}
      disabled={!onPress}
      style={[
        styles.pill,
        { backgroundColor: colors.statusBg[status] ?? colors.statusBg.CLOSED },
      ]}
    >
      <Text style={[styles.pillText, { color: tint }]}>
        {STATUS_LABELS[status] ?? status}
      </Text>
      {onPress ? <ChevronDown size={12} color={tint} /> : null}
    </Pressable>
  );
}

/**
 * Coches d'état d'un message sortant — mêmes règles que `MessageTicks` du web :
 * échec, lu (bleu), distribué (double), sinon simple coche.
 */
export function MessageTicks({ status, light }: { status: string; light?: boolean }) {
  const s = status.toUpperCase();
  const base = light ? colors.white : colors.muted;

  if (s === "FAILED" || s === "BOUNCED") {
    return <AlertCircle size={14} strokeWidth={2.5} color={colors.danger} />;
  }
  if (s === "READ") {
    return <CheckCheck size={16} strokeWidth={2.5} color={colors.tickRead} />;
  }
  if (s === "DELIVERED") {
    return <CheckCheck size={16} strokeWidth={2.5} color={base} />;
  }
  // SENT, QUEUED, PENDING, SENDING
  return <Check size={16} strokeWidth={2.5} color={base} />;
}

const styles = StyleSheet.create({
  unread: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.green,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadText: { color: colors.white, fontSize: 11, fontWeight: "700" },
  dot: { width: 8, height: 8, borderRadius: 4 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  pillText: { fontSize: 12, fontWeight: "600" },
});
