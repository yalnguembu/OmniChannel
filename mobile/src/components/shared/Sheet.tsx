import { ArrowLeft, Check, X, type LucideIcon } from "lucide-react-native";
import type { ReactNode } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius } from "@/theme";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Rend le contenu défilable (listes d'utilisateurs, de templates…). */
  scroll?: boolean;
  contentStyle?: ViewStyle;
  /** Sur une sous-vue : le bouton de tête devient une flèche retour. */
  onBack?: () => void;
  /** Commande en fin de barre de titre (le crayon d'édition de WhatsApp). */
  headerAction?: ReactNode;
  /** Épinglé sous le corps défilant — l'action principale de la feuille. */
  footer?: ReactNode;
  /** Occupe toute la hauteur permise (panneau de détails). */
  tall?: boolean;
}

/**
 * Feuille modale ancrée en bas — remplace les `Dialog`/`DropdownMenu` du web,
 * qui n'ont pas d'équivalent tactile confortable.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
  scroll,
  contentStyle,
  onBack,
  headerAction,
  footer,
  tall,
}: SheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={open}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View
        style={[
          styles.sheet,
          tall && styles.sheetTall,
          !footer && { paddingBottom: insets.bottom + 12 },
          contentStyle,
        ]}
      >
        <View style={styles.grabber} />
        {title ? (
          <View style={styles.header}>
            <Pressable
              testID={onBack ? "sheet-back" : "sheet-close"}
              accessibilityLabel={onBack ? "Retour" : "Fermer"}
              onPress={onBack ?? onClose}
              hitSlop={8}
              style={styles.headerButton}
            >
              {onBack ? (
                <ArrowLeft size={20} color={colors.icon} />
              ) : (
                <X size={20} color={colors.icon} />
              )}
            </Pressable>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            {!onBack ? headerAction : null}
            {/* Sur une sous-vue, la commande de tête revient en arrière : fermer
                le panneau entier a donc besoin de sa propre sortie. */}
            {onBack ? (
              <Pressable
                testID="sheet-close"
                accessibilityLabel="Fermer"
                onPress={onClose}
                hitSlop={8}
                style={styles.headerButton}
              >
                <X size={20} color={colors.icon} />
              </Pressable>
            ) : null}
          </View>
        ) : null}
        {scroll ? (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            style={tall ? styles.scrollTall : styles.scroll}
          >
            {children}
          </ScrollView>
        ) : (
          children
        )}
        {footer ? (
          <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>{footer}</View>
        ) : null}
      </View>
    </Modal>
  );
}

interface SheetOptionProps {
  icon?: LucideIcon;
  label: string;
  hint?: string;
  selected?: boolean;
  danger?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

export function SheetOption({
  icon: Icon,
  label,
  hint,
  selected,
  danger,
  disabled,
  onPress,
}: SheetOptionProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      android_ripple={{ color: colors.hover }}
      style={({ pressed }) => [
        styles.option,
        pressed && styles.optionPressed,
        disabled && styles.optionDisabled,
      ]}
    >
      {Icon ? <Icon size={20} color={danger ? colors.danger : colors.icon} /> : null}
      <View style={styles.optionLabels}>
        <Text style={[styles.optionLabel, danger && { color: colors.danger }]}>{label}</Text>
        {hint ? <Text style={styles.optionHint}>{hint}</Text> : null}
      </View>
      {selected ? <Check size={20} color={colors.greenSend} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 10,
    maxHeight: "85%",
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -4 },
    elevation: 16,
  },
  sheetTall: { height: "85%" },
  grabber: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(0,0,0,0.2)",
    marginBottom: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.header,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { flex: 1, minWidth: 0, fontSize: 16, fontWeight: "500", color: colors.text },
  scroll: { flexGrow: 0 },
  scrollTall: { flex: 1 },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  optionPressed: { backgroundColor: colors.hover },
  optionDisabled: { opacity: 0.45 },
  optionLabels: { flex: 1 },
  optionLabel: { fontSize: 15, color: colors.text },
  optionHint: { fontSize: 12, color: colors.muted, marginTop: 2 },
  separator: { height: 1, backgroundColor: colors.border, marginVertical: 6 },
});

export function SheetSeparator() {
  return <View style={styles.separator} />;
}

export const sheetRadius = radius;
