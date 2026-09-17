import { Settings2, Zap } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { QuickReply } from "@/lib/quickReplies";
import { colors, radius } from "@/theme";

/**
 * Palette des réponses rapides, ouverte par `/raccourci` dans le composeur —
 * portage de `QuickReplyMenu` du web : elle flotte au-dessus du composeur, liste
 * les raccourcis correspondants et propose d'en créer un quand rien ne matche.
 */

interface QuickReplyMenuProps {
  /** Ce qui est tapé après la barre oblique. */
  query: string;
  replies: QuickReply[];
  onSelect: (reply: QuickReply) => void;
  onManage: () => void;
}

export function QuickReplyMenu({ query, replies, onSelect, onManage }: QuickReplyMenuProps) {
  return (
    <View style={styles.menu}>
      <View style={styles.header}>
        <Zap size={13} color={colors.teal} />
        <Text style={styles.headerLabel}>Réponses rapides</Text>
        <Pressable onPress={onManage} hitSlop={6} style={styles.manageButton}>
          <Settings2 size={12} color={colors.teal} />
          <Text style={styles.manage}>Gérer</Text>
        </Pressable>
      </View>

      {replies.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            Aucune réponse rapide pour « /{query} ».{" "}
            <Text style={styles.emptyLink} onPress={onManage}>
              En créer une
            </Text>
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.list} keyboardShouldPersistTaps="always">
          {replies.map((reply) => (
            <Pressable
              key={reply.id}
              style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
              onPress={() => onSelect(reply)}
              accessibilityLabel={`Insérer /${reply.shortcut}`}
            >
              <View style={styles.itemTop}>
                <Text style={styles.shortcut}>/{reply.shortcut}</Text>
                {reply.label ? (
                  <Text style={styles.label} numberOfLines={1}>
                    {reply.label}
                  </Text>
                ) : null}
              </View>
              <Text style={styles.preview} numberOfLines={2}>
                {reply.content}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  menu: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    overflow: "hidden",
    shadowColor: "#0b141a",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerLabel: {
    flex: 1,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: colors.muted,
  },
  manageButton: { flexDirection: "row", alignItems: "center", gap: 4 },
  manage: { fontSize: 11, color: colors.teal, fontWeight: "600" },
  empty: { paddingHorizontal: 12, paddingVertical: 16 },
  emptyText: { fontSize: 12, color: colors.muted, textAlign: "center" },
  emptyLink: { color: colors.teal, fontWeight: "600" },
  list: { maxHeight: 256 },
  item: { paddingHorizontal: 12, paddingVertical: 8 },
  itemPressed: { backgroundColor: colors.hover },
  itemTop: { flexDirection: "row", alignItems: "baseline", gap: 8 },
  shortcut: { fontSize: 13, fontWeight: "500", color: colors.teal },
  label: { flex: 1, minWidth: 0, fontSize: 12, color: colors.text },
  preview: { marginTop: 2, fontSize: 12, color: colors.muted },
});
