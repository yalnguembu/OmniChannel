import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Avatar } from "@/components/shared/Avatar";
import { StatusPill } from "@/components/shared/Badges";
import { colors, radius } from "@/theme";

export interface ChatHeaderVM {
  initials: string;
  avatarBg: string;
  name: string;
  sub: string;
  status: string;
  contactAddress: string;
}

interface ChatHeaderProps {
  vm: ChatHeaderVM;
  onBack: () => void;
  onToggleSearch: () => void;
  onOpenMenu: () => void;
}

export function ChatHeader({ vm, onBack, onToggleSearch, onOpenMenu }: ChatHeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} hitSlop={10} style={styles.iconButton} accessibilityLabel="Retour">
        <Ionicons name="arrow-back" size={24} color={colors.icon} />
      </Pressable>

      <Avatar initials={vm.initials} background={vm.avatarBg} size={38} />

      <View style={styles.titles}>
        <Text style={styles.name} numberOfLines={1}>
          {vm.name}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {vm.sub}
        </Text>
      </View>

      <StatusPill status={vm.status} />

      <Pressable onPress={onToggleSearch} hitSlop={8} style={styles.iconButton} accessibilityLabel="Rechercher">
        <Ionicons name="search" size={21} color={colors.icon} />
      </Pressable>
      <Pressable onPress={onOpenMenu} hitSlop={8} style={styles.iconButton} accessibilityLabel="Actions">
        <Ionicons name="ellipsis-vertical" size={20} color={colors.icon} />
      </Pressable>
    </View>
  );
}

interface ChatSearchBarProps {
  visible: boolean;
  value: string;
  onChange: (v: string) => void;
  onClose: () => void;
}

/** Recherche dans la discussion — filtre les messages déjà chargés. */
export function ChatSearchBar({ visible, value, onChange, onClose }: ChatSearchBarProps) {
  if (!visible) return null;
  return (
    <View style={styles.searchBar}>
      <Ionicons name="search" size={17} color={colors.muted} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Rechercher dans la discussion"
        placeholderTextColor={colors.muted}
        style={styles.searchInput}
        autoFocus
      />
      <Pressable onPress={onClose} hitSlop={10}>
        <Ionicons name="close" size={19} color={colors.icon} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 6,
    paddingVertical: 8,
    backgroundColor: colors.header,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  iconButton: { padding: 6 },
  titles: { flex: 1, minWidth: 0, marginLeft: 2 },
  name: { fontSize: 16, fontWeight: "600", color: colors.text },
  sub: { fontSize: 11.5, color: colors.muted, marginTop: 1 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 10,
    marginTop: 8,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
  },
  searchInput: { flex: 1, fontSize: 14.5, color: colors.text, padding: 0 },
});
