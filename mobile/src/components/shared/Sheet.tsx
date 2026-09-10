import { Ionicons } from "@expo/vector-icons";
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
}

/**
 * Feuille modale ancrée en bas — remplace les `Dialog`/`DropdownMenu` du web,
 * qui n'ont pas d'équivalent tactile confortable.
 */
export function Sheet({ open, onClose, title, children, scroll, contentStyle }: SheetProps) {
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
        style={[styles.sheet, { paddingBottom: insets.bottom + 12 }, contentStyle]}
      >
        <View style={styles.grabber} />
        {title ? (
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={22} color={colors.icon} />
            </Pressable>
          </View>
        ) : null}
        {scroll ? (
          <ScrollView keyboardShouldPersistTaps="handled" style={styles.scroll}>
            {children}
          </ScrollView>
        ) : (
          children
        )}
      </View>
    </Modal>
  );
}

interface SheetOptionProps {
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  hint?: string;
  selected?: boolean;
  danger?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

export function SheetOption({
  icon,
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
      {icon ? (
        <Ionicons name={icon} size={20} color={danger ? colors.danger : colors.icon} />
      ) : null}
      <View style={styles.optionLabels}>
        <Text style={[styles.optionLabel, danger && { color: colors.danger }]}>{label}</Text>
        {hint ? <Text style={styles.optionHint}>{hint}</Text> : null}
      </View>
      {selected ? <Ionicons name="checkmark" size={20} color={colors.greenSend} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingTop: 8,
    maxHeight: "82%",
  },
  grabber: {
    alignSelf: "center",
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingBottom: 10,
  },
  title: { fontSize: 16, fontWeight: "600", color: colors.text },
  scroll: { flexGrow: 0 },
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
