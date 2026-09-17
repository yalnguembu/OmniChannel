import { ArrowUpRight, FileText, Image as ImageIcon, Music, User, Video, type LucideIcon } from "lucide-react-native";
import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Avatar } from "@/components/shared/Avatar";
import { StatusDot, UnreadBadge } from "@/components/shared/Badges";
import type { ConversationViewModel } from "@/hooks/useInboxViewModel";
import { colors, radius } from "@/theme";

/**
 * Ligne de la liste des discussions — portage 1:1 de `ConversationItem` du web
 * (mêmes espacements, tailles de texte et graisses).
 */

/** Icône affichée devant l'aperçu selon le type du dernier message. */
const PREVIEW_ICONS: Record<string, LucideIcon> = {
  IMAGE: ImageIcon,
  VIDEO: Video,
  AUDIO: Music,
  DOCUMENT: FileText,
  CONTACT: User,
  // L'API Cloud de Meta (et ce backend, qui la relaie tel quel) nomme ce type
  // « contacts » au pluriel.
  CONTACTS: User,
};

interface ConversationRowProps {
  vm: ConversationViewModel;
  onPress: (id: string) => void;
}

export const ConversationRow = memo(function ConversationRow({
  vm,
  onPress,
}: ConversationRowProps) {
  const PreviewIcon = PREVIEW_ICONS[vm.previewType];

  return (
    <Pressable
      testID={`conversation-${vm.id}`}
      accessibilityLabel={`Discussion ${vm.name}`}
      onPress={() => onPress(vm.id)}
      android_ripple={{ color: colors.hover }}
      style={({ pressed }) => [
        styles.row,
        vm.isActive && styles.rowActive,
        pressed && styles.rowPressed,
      ]}
    >
      <Avatar initials={vm.initials} background={vm.avatarBg} size="lg" />

      <View style={styles.body}>
        {/* Ligne 1 : nom (+ agent assigné) et heure. */}
        <View style={styles.topLine}>
          <View style={styles.nameWrap}>
            <Text numberOfLines={1} style={[styles.name, vm.unread > 0 && styles.nameUnread]}>
              {vm.name}
            </Text>
            {vm.assigneeName ? (
              <View style={styles.assigneeChip}>
                <Text style={styles.assigneeText} numberOfLines={1}>
                  {vm.assigneeName}
                </Text>
              </View>
            ) : null}
          </View>
          <Text style={[styles.time, vm.unread > 0 && styles.timeUnread]}>{vm.time}</Text>
        </View>

        {/* Ligne 2 : aperçu et badge de non-lus. */}
        <View style={styles.bottomLine}>
          <View style={styles.previewWrap}>
            <StatusDot status={vm.status} />
            {/* Marqueur de direction : une flèche quand le dernier message est
                sortant, rien quand il est entrant — comme WhatsApp. */}
            {vm.lastOutbound ? (
              <ArrowUpRight size={14} strokeWidth={2.5} color={colors.muted} />
            ) : null}
            {PreviewIcon ? <PreviewIcon size={14} color={colors.muted} /> : null}
            {/* Texte dans son propre nœud : il se tronque pendant que les icônes
                gardent leur place. */}
            <Text numberOfLines={1} style={[styles.preview, vm.unread > 0 && styles.previewUnread]}>
              {vm.preview}
            </Text>
          </View>
          <UnreadBadge count={vm.unread} />
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRadius: radius.md,
    backgroundColor: colors.sidebar,
  },
  rowActive: { backgroundColor: colors.activeSoft },
  rowPressed: { backgroundColor: colors.hover },
  body: { flex: 1, minWidth: 0 },
  topLine: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  nameWrap: { flex: 1, flexDirection: "row", alignItems: "center", minWidth: 0 },
  name: { fontSize: 16, lineHeight: 21, color: colors.text, flexShrink: 1 },
  nameUnread: { fontWeight: "600" },
  assigneeChip: {
    marginLeft: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.active,
    maxWidth: 96,
  },
  assigneeText: { fontSize: 10, color: colors.muted },
  time: { fontSize: 12, color: colors.muted },
  timeUnread: { color: colors.green, fontWeight: "600" },
  bottomLine: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  previewWrap: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6, minWidth: 0 },
  preview: { flex: 1, fontSize: 13, lineHeight: 17, color: colors.muted },
  previewUnread: { color: colors.text, fontWeight: "500" },
});
