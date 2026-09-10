import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import type { Filter } from "@/models/whatsapp.models";
import { colors, radius } from "@/theme";

interface StatsVM {
  open: number;
  pending: number;
  resolved: number;
  unread: number;
  closed: number;
}

interface FilterChipsProps {
  stats: StatsVM;
  filter: Filter;
  onChange: (f: Filter) => void;
}

/** Bandeau de filtres — portage de `StatsStrip` du web. */
export function FilterChips({ stats, filter, onChange }: FilterChipsProps) {
  const chips: { key: Filter; label: string; count: number }[] = [
    // « Toutes » est la somme des statuts uniquement : les non-lues sont
    // orthogonales (une conversation non lue compte déjà dans son statut).
    { key: "ALL", label: "Toutes", count: stats.open + stats.pending + stats.resolved + stats.closed },
    { key: "UNREAD", label: "Non lues", count: stats.unread },
    { key: "OPEN", label: "Ouvertes", count: stats.open },
    { key: "PENDING", label: "En attente", count: stats.pending },
    { key: "RESOLVED", label: "Résolues", count: stats.resolved },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.strip}
    >
      {chips.map((chip) => {
        const active = filter === chip.key;
        return (
          <Pressable
            key={chip.key}
            onPress={() => onChange(chip.key)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>
              {chip.label}
              {chip.count > 0 ? `  ${chip.count}` : ""}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  strip: { paddingHorizontal: 12, paddingBottom: 10, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  chipActive: { backgroundColor: "#d9f8c4", borderColor: "#b7efaa" },
  label: { fontSize: 13, color: colors.text },
  labelActive: { fontWeight: "600" },
});
