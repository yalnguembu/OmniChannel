import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Avatar } from "@/components/shared/Avatar";
import { StatusDot, UnreadBadge } from "@/components/shared/Badges";
import type { ConversationViewModel } from "@/hooks/useInboxViewModel";
import { colors } from "@/theme";

/** Icône affichée devant l'aperçu selon le type du dernier message. */
const PREVIEW_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  IMAGE: "image",
  VIDEO: "videocam",
  AUDIO: "musical-notes",
  DOCUMENT: "document-text",
  CONTACT: "person",
  // L'API Cloud de Meta (et ce backend, qui la relaie tel quel) nomme ce type
  // « contacts » au pluriel.
  CONTACTS: "person",
};

interface ConversationRowProps {
  vm: ConversationViewModel;
  onPress: (id: string) => void;
}

export const ConversationRow = memo(function ConversationRow({
  vm,
  onPress,
}: ConversationRowProps) {
  const previewIcon = PREVIEW_ICONS[vm.previewType];

  return (
    <Pressable
      onPress={() => onPress(vm.id)}
      android_ripple={{ color: colors.hover }}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <Avatar initials={vm.initials} background={vm.avatarBg} size={50} />

      <View style={styles.body}>
        <View style={styles.line}>
          <Text
            numberOfLines={1}
            style={[styles.name, vm.unread > 0 && styles.nameUnread]}
          >
            {vm.name}
          </Text>
          <Text style={[styles.time, vm.unread > 0 && styles.timeUnread]}>{vm.time}</Text>
        </View>

        <View style={styles.line}>
          <View style={styles.previewWrap}>
            <StatusDot status={vm.status} />
            {/* Marqueur de direction : une flèche quand le dernier message est
                sortant, rien quand il est entrant — comme WhatsApp. */}
            {vm.lastOutbound ? (
              <Ionicons name="arrow-redo-outline" size={13} color={colors.muted} />
            ) : null}
            {previewIcon ? <Ionicons name={previewIcon} size={13} color={colors.muted} /> : null}
            <Text
              numberOfLines={1}
              style={[styles.preview, vm.unread > 0 && styles.previewUnread]}
            >
              {vm.preview}
            </Text>
          </View>
          <UnreadBadge count={vm.unread} />
        </View>

        {vm.assigneeName ? (
          <View style={styles.assignee}>
            <Ionicons name="person-circle-outline" size={12} color={colors.muted} />
            <Text style={styles.assigneeText} numberOfLines={1}>
              {vm.assigneeName}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.white,
  },
  rowPressed: { backgroundColor: colors.hover },
  body: { flex: 1, minWidth: 0 },
  line: { flexDirection: "row", alignItems: "center", gap: 8 },
  name: { flex: 1, fontSize: 16, color: colors.text },
  nameUnread: { fontWeight: "600" },
  time: { fontSize: 12, color: colors.muted },
  timeUnread: { color: colors.green, fontWeight: "600" },
  previewWrap: { flex: 1, flexDirection: "row", alignItems: "center", gap: 5, marginTop: 3 },
  preview: { flex: 1, fontSize: 13, color: colors.muted },
  previewUnread: { color: colors.text, fontWeight: "500" },
  assignee: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  assigneeText: { fontSize: 11, color: colors.muted },
});
