import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme";

/**
 * Grille mensuelle nue — la brique commune au saut à une date (un jour) et au
 * choix d'une plage dans les filtres (deux bornes). Semaine commençant lundi,
 * comme le calendrier du web.
 */

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];

export function isoDay(y: number, m: number, d: number): string {
  return `${y}-${`${m + 1}`.padStart(2, "0")}-${`${d}`.padStart(2, "0")}`;
}

export function monthTitle(y: number, m: number): string {
  const s = new Date(y, m, 1).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function humanDay(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

/** Index de la colonne du 1er du mois, semaine commençant lundi. */
function firstColumn(y: number, m: number): number {
  const jsDay = new Date(y, m, 1).getDay(); // 0 = dimanche
  return (jsDay + 6) % 7;
}

interface MonthGridProps {
  onSelect: (day: string) => void;
  disabled?: boolean;
  /** Jours mis en avant (un point sous le chiffre). */
  markedDays?: string[];
  /** Bornes sélectionnées, incluses. */
  selectedDays?: string[];
  /** Jours entre les deux bornes d'une plage. */
  rangeStart?: string;
  rangeEnd?: string;
  /** Libellé d'accessibilité d'une cellule. */
  labelFor?: (key: string) => string;
}

export function MonthGrid({
  onSelect,
  disabled,
  markedDays,
  selectedDays,
  rangeStart,
  rangeEnd,
  labelFor,
}: MonthGridProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const marked = useMemo(() => new Set(markedDays ?? []), [markedDays]);
  const selected = useMemo(() => new Set(selectedDays ?? []), [selectedDays]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const lead = firstColumn(year, month);
  const cells: (number | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Complète la dernière semaine pour que la grille reste alignée.
  while (cells.length % 7 !== 0) cells.push(null);

  const step = (delta: number) => {
    const next = new Date(year, month + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  };

  const todayKey = isoDay(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <View>
      <View style={styles.monthBar}>
        <Pressable
          onPress={() => step(-1)}
          hitSlop={8}
          accessibilityLabel="Mois précédent"
          style={styles.monthButton}
        >
          <ChevronLeft size={18} color={colors.icon} />
        </Pressable>
        <Text style={styles.monthTitle}>{monthTitle(year, month)}</Text>
        <Pressable
          onPress={() => step(1)}
          hitSlop={8}
          accessibilityLabel="Mois suivant"
          style={styles.monthButton}
        >
          <ChevronRight size={18} color={colors.icon} />
        </Pressable>
      </View>

      <View style={styles.weekRow}>
        {WEEKDAYS.map((w, i) => (
          <Text key={`${w}-${i}`} style={styles.weekday}>
            {w}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((day, i) => {
          if (day === null) return <View key={`empty-${i}`} style={styles.cell} />;
          const key = isoDay(year, month, day);
          const isMarked = marked.has(key);
          const isSelected = selected.has(key);
          const inRange =
            !!rangeStart && !!rangeEnd && key > rangeStart && key < rangeEnd;
          return (
            <Pressable
              key={key}
              style={styles.cell}
              disabled={disabled}
              onPress={() => onSelect(key)}
              accessibilityLabel={labelFor?.(key) ?? humanDay(key)}
            >
              <View
                style={[
                  styles.dayBox,
                  key === todayKey && styles.dayBoxToday,
                  inRange && styles.dayBoxInRange,
                  isSelected && styles.dayBoxSelected,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    isMarked && styles.dayTextMarked,
                    isSelected && styles.dayTextSelected,
                  ]}
                >
                  {day}
                </Text>
                {isMarked && !isSelected ? <View style={styles.dot} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  monthBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  monthButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  monthTitle: { fontSize: 14, fontWeight: "600", color: colors.text },
  weekRow: { flexDirection: "row" },
  weekday: {
    width: `${100 / 7}%`,
    textAlign: "center",
    fontSize: 11,
    color: colors.muted,
    paddingVertical: 4,
  },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: `${100 / 7}%`, alignItems: "center", paddingVertical: 2 },
  dayBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  dayBoxToday: { borderWidth: 1, borderColor: colors.teal },
  dayBoxInRange: { backgroundColor: colors.active, borderRadius: 0 },
  dayBoxSelected: { backgroundColor: colors.teal, borderColor: colors.teal },
  dayText: { fontSize: 13.5, color: colors.text },
  dayTextMarked: { fontWeight: "600" },
  dayTextSelected: { color: colors.white, fontWeight: "600" },
  dot: {
    position: "absolute",
    bottom: 3,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.greenSend,
  },
});
