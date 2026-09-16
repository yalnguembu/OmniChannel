import { Circle, CircleDot } from "lucide-react-native";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, radius } from "@/theme";

export interface RadioItem {
  id: string;
  label: string;
  hint?: string | null;
}

interface RadioListProps {
  items: RadioItem[];
  selected: string;
  onSelect: (id: string) => void;
  isLoading?: boolean;
  emptyLabel?: string;
  maxHeight?: number;
}

/** Liste à choix unique défilable — templates, segments, produits… */
export function RadioList({
  items,
  selected,
  onSelect,
  isLoading,
  emptyLabel = "Aucun élément disponible.",
  maxHeight = 240,
}: RadioListProps) {
  if (isLoading) {
    return <ActivityIndicator color={colors.teal} style={styles.loader} />;
  }
  if (items.length === 0) {
    return <Text style={styles.empty}>{emptyLabel}</Text>;
  }
  return (
    <ScrollView style={{ maxHeight }} keyboardShouldPersistTaps="handled">
      {items.map((item) => {
        const active = selected === item.id;
        return (
          <Pressable
            key={item.id}
            onPress={() => onSelect(item.id)}
            style={[styles.row, active && styles.rowActive]}
          >
            {active ? (
              <CircleDot size={19} color={colors.greenSend} />
            ) : (
              <Circle size={19} color={colors.muted} />
            )}
            <View style={styles.labels}>
              <Text style={styles.label}>{item.label}</Text>
              {item.hint ? <Text style={styles.hint}>{item.hint}</Text> : null}
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loader: { marginVertical: 14 },
  empty: { paddingVertical: 12, fontSize: 13, color: colors.muted },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 11,
    paddingHorizontal: 4,
    borderRadius: radius.md,
  },
  rowActive: { backgroundColor: colors.hover },
  labels: { flex: 1, minWidth: 0 },
  label: { fontSize: 14.5, color: colors.text },
  hint: { fontSize: 11.5, color: colors.muted, marginTop: 1 },
});
