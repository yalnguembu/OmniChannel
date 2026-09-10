import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
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

/** Pilule de statut (lecture seule ; le changement passe par la feuille d'actions). */
export function StatusPill({ status }: { status: string }) {
  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: colors.statusBg[status] ?? colors.statusBg.CLOSED },
      ]}
    >
      <Text
        style={[styles.pillText, { color: colors.status[status] ?? colors.status.CLOSED }]}
      >
        {STATUS_LABELS[status] ?? status}
      </Text>
    </View>
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
    return <Ionicons name="alert-circle" size={14} color={colors.danger} />;
  }
  if (s === "READ") {
    return <Ionicons name="checkmark-done" size={15} color={colors.tickRead} />;
  }
  if (s === "DELIVERED") {
    return <Ionicons name="checkmark-done" size={15} color={base} />;
  }
  // SENT, QUEUED, PENDING, SENDING
  return <Ionicons name="checkmark" size={15} color={base} />;
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
  pill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.pill },
  pillText: { fontSize: 11, fontWeight: "700" },
});
