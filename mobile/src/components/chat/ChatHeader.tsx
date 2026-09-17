import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  ChevronsDown,
  ChevronUp,
  Images,
  MoreVertical,
  Search,
  UserCheck,
  X,
} from "lucide-react-native";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Avatar } from "@/components/shared/Avatar";
import { StatusPill } from "@/components/shared/Badges";
import { IconButton } from "@/components/shared/IconButton";
import { colors } from "@/theme";

export interface ChatHeaderVM {
  initials: string;
  avatarBg: string;
  name: string;
  sub: string;
  status: string;
  contactAddress: string;
  assignedName: string | null;
}

interface ChatHeaderProps {
  vm: ChatHeaderVM;
  searchActive: boolean;
  onBack: () => void;
  onToggleSearch: () => void;
  onOpenMenu: () => void;
  onShowDetails: () => void;
  onOpenGallery: () => void;
  onStatusPress: () => void;
}

/**
 * En-tête de discussion — portage de `ChatHeader` du web : `px-3 py-2.5`,
 * hauteur minimale 80, avatar `lg`, nom en 16 semibold puis une ligne de
 * contexte en 12, et le groupe d'actions à droite en `gap-0.5`.
 */
export function ChatHeader({
  vm,
  searchActive,
  onBack,
  onToggleSearch,
  onOpenMenu,
  onShowDetails,
  onOpenGallery,
  onStatusPress,
}: ChatHeaderProps) {
  return (
    <View style={styles.header}>
      <IconButton testID="chat-back" icon={ArrowLeft} label="Retour" onPress={onBack} />

      <Pressable onPress={onShowDetails} accessibilityLabel="Détails de la conversation">
        <Avatar initials={vm.initials} background={vm.avatarBg} size="lg" />
      </Pressable>

      <Pressable style={styles.titles} onPress={onShowDetails}>
        <Text style={styles.name} numberOfLines={1}>
          {vm.name}
        </Text>
        <View style={styles.subLine}>
          <StatusPill status={vm.status} onPress={onStatusPress} />
          <Text style={styles.sub} numberOfLines={1}>
            {vm.sub}
          </Text>
          {vm.assignedName ? (
            <>
              <Text style={styles.sub}>·</Text>
              <UserCheck size={12} color={colors.teal} />
              <Text style={styles.assignee} numberOfLines={1}>
                {vm.assignedName}
              </Text>
            </>
          ) : null}
        </View>
      </Pressable>

      <View style={styles.actions}>
        {/* Le panneau porte une ligne « Médias et documents » : ce raccourci
            prend un libellé distinct, sinon un `tapOn` ne sait plus lequel des
            deux viser (voir .maestro/README.md). */}
        <IconButton icon={Images} label="Ouvrir les médias" onPress={onOpenGallery} />
        <IconButton
          icon={Search}
          label="Rechercher"
          active={searchActive}
          onPress={onToggleSearch}
        />
        <IconButton
          testID="chat-menu"
          icon={MoreVertical}
          label="Plus d'options"
          onPress={onOpenMenu}
        />
      </View>
    </View>
  );
}

interface ChatSearchBarProps {
  visible: boolean;
  value: string;
  onChange: (v: string) => void;
  onClose: () => void;
  /** Navigation entre résultats — le web suit le résultat actif par id. */
  matchCount: number;
  activePosition: number;
  canGoOlder: boolean;
  canGoNewer: boolean;
  onPrevMatch: () => void;
  onNextMatch: () => void;
  /** Ce que la recherche a réellement couvert, affiché sous le champ. */
  searchBaseCount: number;
  searchTotalCount: number;
  /** Élargit la base fouillée quand il reste de l'historique. */
  canWiden: boolean;
  searchExtendSize: number;
  isExtending: boolean;
  onWiden: () => void;
  /** Ouvre le sélecteur de jour. */
  onOpenDayPicker: () => void;
}

/** Barre de recherche dans la discussion. */
export function ChatSearchBar({
  visible,
  value,
  onChange,
  onClose,
  matchCount,
  activePosition,
  canGoOlder,
  canGoNewer,
  onPrevMatch,
  onNextMatch,
  searchBaseCount,
  searchTotalCount,
  canWiden,
  searchExtendSize,
  isExtending,
  onWiden,
  onOpenDayPicker,
}: ChatSearchBarProps) {
  if (!visible) return null;
  const hasTerm = value.trim().length > 0;
  return (
    <View style={styles.searchWrap}>
      <View style={styles.searchBar}>
        <View style={styles.searchTerm}>
          <Search size={16} color={colors.icon} />
          <TextInput
            testID="chat-search-input"
            accessibilityLabel="Rechercher dans la discussion"
            value={value}
            onChangeText={onChange}
            placeholder="Rechercher dans la conversation..."
            placeholderTextColor={colors.muted}
            style={styles.searchInput}
            autoFocus
          />
        </View>
        {hasTerm ? (
          <>
            <Text style={styles.counter}>
              {isExtending ? "…" : matchCount > 0 ? `${activePosition} / ${matchCount}` : "aucun"}
            </Text>
            <Pressable
              onPress={onPrevMatch}
              disabled={!canGoOlder}
              hitSlop={8}
              accessibilityLabel="Résultat plus ancien"
              style={!canGoOlder && styles.navDisabled}
            >
              <ChevronUp size={17} color={colors.icon} />
            </Pressable>
            <Pressable
              onPress={onNextMatch}
              disabled={!canGoNewer}
              hitSlop={8}
              accessibilityLabel="Résultat plus récent"
              style={!canGoNewer && styles.navDisabled}
            >
              <ChevronDown size={17} color={colors.icon} />
            </Pressable>
          </>
        ) : null}
        <Pressable
          onPress={onOpenDayPicker}
          hitSlop={8}
          accessibilityLabel="Aller à une date"
        >
          <CalendarDays size={18} color={colors.icon} />
        </Pressable>
        <Pressable onPress={onClose} hitSlop={10} accessibilityLabel="Fermer la recherche">
          <X size={18} color={colors.icon} />
        </Pressable>
      </View>

      {hasTerm ? (
        <View style={styles.coverageRow}>
          <Text style={styles.coverage}>
            {isExtending
              ? `Chargement de ${searchExtendSize} messages supplémentaires…`
              : `Recherche sur les ${searchBaseCount} message${
                  searchBaseCount > 1 ? "s" : ""
                } chargé${searchBaseCount > 1 ? "s" : ""}${
                  searchTotalCount > searchBaseCount ? ` sur ${searchTotalCount}` : ""
                }.`}
          </Text>
          {canWiden && !isExtending ? (
            <Pressable
              onPress={onWiden}
              hitSlop={6}
              accessibilityLabel="Élargir la recherche"
              style={styles.widenButton}
            >
              <ChevronsDown size={11} color={colors.teal} />
              <Text style={styles.widen}>Élargir de {searchExtendSize}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 80,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.header,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  titles: { flex: 1, minWidth: 0 },
  name: { fontSize: 16, fontWeight: "600", color: colors.text, lineHeight: 22 },
  subLine: { flexDirection: "row", alignItems: "center", gap: 6, minWidth: 0 },
  sub: { fontSize: 12, color: colors.muted, lineHeight: 17, flexShrink: 1 },
  assignee: { fontSize: 12, color: colors.teal, lineHeight: 17, flexShrink: 1 },
  actions: { flexDirection: "row", alignItems: "center", gap: 2 },
  // `bg-wa-input-bg border-b border-wa-border` côté web.
  searchWrap: {
    backgroundColor: colors.inputBg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchTerm: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, minWidth: 0 },
  searchInput: { flex: 1, minWidth: 0, fontSize: 14, color: colors.text, padding: 0 },
  // `min-w-14 text-right tabular-nums` : la largeur ne doit pas sauter d'un
  // résultat à l'autre, sinon les chevrons se déplacent sous le doigt.
  counter: { minWidth: 56, textAlign: "right", fontSize: 12, color: colors.muted },
  navDisabled: { opacity: 0.35 },
  coverageRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  coverage: { fontSize: 11, color: colors.muted },
  widenButton: { flexDirection: "row", alignItems: "center", gap: 4 },
  widen: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.teal,
    textDecorationLine: "underline",
  },
});
