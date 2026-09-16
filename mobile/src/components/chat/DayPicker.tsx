import { Pressable, StyleSheet, Text, View } from "react-native";
import { humanDay, MonthGrid } from "@/components/shared/MonthGrid";
import { colors, radius } from "@/theme";

/**
 * Sélecteur de jour pour le saut à une date — équivalent du `DatePicker` du web :
 * les jours qui portent un message chargé sont **pointés** et proposés en
 * raccourcis, mais toute autre date reste choisissable (le saut pagine alors en
 * arrière pour aller la chercher).
 */

/** Nombre de jours récents proposés en raccourci, comme le web. */
const SHORTCUT_COUNT = 5;

interface DayPickerProps {
  /** Jours `aaaa-mm-jj` qui portent un message chargé. */
  availableDays: string[];
  onSelect: (day: string) => void;
  busy?: boolean;
}

export function DayPicker({ availableDays, onSelect, busy }: DayPickerProps) {
  const shortcuts = [...availableDays].reverse().slice(0, SHORTCUT_COUNT);

  return (
    <View style={styles.container}>
      {shortcuts.length > 0 ? (
        <View style={styles.shortcuts}>
          {shortcuts.map((key) => (
            <Pressable
              key={key}
              style={styles.shortcut}
              disabled={busy}
              onPress={() => onSelect(key)}
            >
              <Text style={styles.shortcutText}>{humanDay(key)}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      <MonthGrid
        onSelect={onSelect}
        disabled={busy}
        markedDays={availableDays}
        labelFor={(key) => `Aller au ${humanDay(key)}`}
      />

      <Text style={styles.legend}>
        Les jours pointés portent un message déjà chargé ; une autre date fait
        remonter l'historique.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 14, paddingBottom: 14 },
  shortcuts: { flexDirection: "row", flexWrap: "wrap", gap: 6, paddingVertical: 8 },
  shortcut: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.inputBg,
  },
  shortcutText: { fontSize: 12, color: colors.text },
  legend: { marginTop: 10, fontSize: 11, color: colors.muted, lineHeight: 15 },
});
