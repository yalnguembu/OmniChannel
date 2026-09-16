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

/**
 * Bandeau de filtres — portage de `StatsStrip` du web : pastilles
 * `px-4 py-2 rounded-full text-[13px]`, active en `#d9f8c4` bordée `#b7efaa`.
 */
export function FilterChips({ stats, filter, onChange }: FilterChipsProps) {
  const chips: { key: Filter; label: string; count: number }[] = [
    // « Toutes » est la somme des statuts uniquement : les non-lues sont
    // orthogonales (une conversation non lue compte déjà dans son statut).
    {
      key: "ALL",
      label: "Toutes",
      count: stats.open + stats.pending + stats.resolved + stats.closed,
    },
    { key: "UNREAD", label: "Non lues", count: stats.unread },
    { key: "OPEN", label: "Ouvertes", count: stats.open },
    { key: "PENDING", label: "En attente", count: stats.pending },
    { key: "RESOLVED", label: "Résolues", count: stats.resolved },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      // Hauteur explicite : dans une colonne flex, une ScrollView horizontale
      // sans contrainte prend toute la place restante (les pastilles s'étiraient
      // sur l'écran), et `flexGrow: 0` seul la laissait trop courte — le bas des
      // pastilles était rogné. La borner règle les deux cas.
      style={styles.scroll}
      contentContainerStyle={styles.strip}
    >
      {chips.map((chip) => {
        const active = filter === chip.key;
        return (
          <Pressable
            key={chip.key}
            testID={`filter-${chip.key.toLowerCase()}`}
            accessibilityLabel={`Filtre ${chip.label}`}
            onPress={() => onChange(chip.key)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{chip.label}</Text>
            {chip.count > 0 ? (
              <Text style={[styles.label, active && styles.labelActive]}>{chip.count}</Text>
            ) : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const CHIP_HEIGHT = 36;

const styles = StyleSheet.create({
  scroll: {
    height: CHIP_HEIGHT + 20, // py-2.5 du web, de part et d'autre
    flexGrow: 0,
    flexShrink: 0,
    backgroundColor: colors.sidebar,
  },
  strip: { alignItems: "center", paddingHorizontal: 12, gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: CHIP_HEIGHT,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  chipActive: { backgroundColor: "#d9f8c4", borderColor: "#b7efaa" },
  label: { fontSize: 13, fontWeight: "500", color: colors.text },
  labelActive: { fontWeight: "600" },
});
