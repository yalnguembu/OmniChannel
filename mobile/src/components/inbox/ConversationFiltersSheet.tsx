import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  type LucideIcon,
  UserCheck,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MonthGrid } from "@/components/shared/MonthGrid";
import { RadioList } from "@/components/shared/RadioList";
import { Sheet } from "@/components/shared/Sheet";
import { DATE_PRESET_GROUPS, matchPreset } from "@/lib/datePresets";
import type { User } from "@/models/whatsapp.models";
import type { ConversationFilters } from "@/store/whatsappStore";
import { colors, radius } from "@/theme";

/**
 * Filtres de la liste — portage de `ConversationFilters` du web. L'agent
 * assigné et la direction partent au backend (`assignedToUser` /
 * `lastMessageDirection`) ; la plage de dates est appliquée côté client sur
 * `lastMessageAt`, que l'endpoint de recherche ne prend pas.
 */

/** Libellés courts, comme les trois boutons du web. */
const DIRECTIONS: { value: string; label: string; icon: LucideIcon | null }[] = [
  { value: "", label: "Tous", icon: null },
  { value: "INBOUND", label: "Reçu", icon: ArrowDownLeft },
  { value: "OUTBOUND", label: "Envoyé", icon: ArrowUpRight },
];

interface ConversationFiltersSheetProps {
  open: boolean;
  onClose: () => void;
  filters: ConversationFilters;
  users: User[];
  activeCount: number;
  onChange: (patch: Partial<ConversationFilters>) => void;
  onReset: () => void;
}

export function ConversationFiltersSheet({
  open,
  onClose,
  filters,
  users,
  activeCount,
  onChange,
  onReset,
}: ConversationFiltersSheetProps) {
  const [agentOpen, setAgentOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const agentOptions = useMemo(
    () => [
      { id: "", label: "Tous les agents" },
      ...users.map((u) => ({
        id: u.id,
        label: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email || u.id,
      })),
    ],
    [users],
  );

  const agentLabel =
    agentOptions.find((o) => o.id === filters.assignedToUser)?.label ?? "Tous les agents";

  const activePreset = matchPreset(filters.dateFrom, filters.dateTo);
  const hasRange = !!filters.dateFrom || !!filters.dateTo;

  /**
   * Un appui pose la première borne, le suivant la seconde — et les remet dans
   * l'ordre si la seconde est antérieure.
   */
  const pickDay = (day: string) => {
    const { dateFrom, dateTo } = filters;
    if (!dateFrom || (dateFrom && dateTo)) {
      onChange({ dateFrom: day, dateTo: "" });
      return;
    }
    onChange(day < dateFrom ? { dateFrom: day, dateTo: dateFrom } : { dateTo: day });
  };

  return (
    <Sheet open={open} onClose={onClose} title="Filtres" scroll>
      <View style={styles.body}>
        <Text style={styles.sectionTitle}>Agent assigné</Text>
        <Pressable style={styles.selectTrigger} onPress={() => setAgentOpen((v) => !v)}>
          <UserCheck size={15} color={colors.icon} />
          <Text style={styles.selectValue} numberOfLines={1}>
            {agentLabel}
          </Text>
          {agentOpen ? (
            <ChevronUp size={15} color={colors.icon} />
          ) : (
            <ChevronDown size={15} color={colors.icon} />
          )}
        </Pressable>
        {agentOpen ? (
          <RadioList
            items={agentOptions}
            selected={filters.assignedToUser}
            onSelect={(id) => {
              setAgentOpen(false);
              onChange({ assignedToUser: id });
            }}
            emptyLabel="Aucun agent disponible."
            maxHeight={220}
          />
        ) : null}

        <Text style={styles.sectionTitle}>Dernier message</Text>
        <View style={styles.segmented}>
          {DIRECTIONS.map((d) => {
            const active = filters.lastMessageDirection === d.value;
            const Icon = d.icon;
            return (
              <Pressable
                key={d.value || "any"}
                onPress={() => onChange({ lastMessageDirection: d.value })}
                style={[styles.segment, active && styles.segmentActive]}
              >
                {Icon ? (
                  <Icon size={14} color={active ? colors.white : colors.text} />
                ) : null}
                <Text style={[styles.segmentLabel, active && styles.segmentLabelActive]}>
                  {d.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Dernière activité</Text>
        {/* Mêmes préréglages que le sélecteur de plage du web, mêmes groupes. */}
        {DATE_PRESET_GROUPS.map(([group, presets]) => (
          <View key={group} style={styles.presetGroup}>
            <Text style={styles.presetGroupTitle}>{group}</Text>
            <View style={styles.presets}>
              {presets.map((p) => {
                const active = activePreset === p.key;
                return (
                  <Pressable
                    key={p.key}
                    onPress={() =>
                      onChange(active ? { dateFrom: "", dateTo: "" } : p.getRange())
                    }
                    style={[styles.presetChip, active && styles.presetChipActive]}
                  >
                    <Text style={[styles.presetLabel, active && styles.presetLabelActive]}>
                      {p.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}

        <Pressable style={styles.customRow} onPress={() => setCalendarOpen((v) => !v)}>
          <CalendarDays size={15} color={colors.icon} />
          <Text style={styles.customLabel} numberOfLines={1}>
            {hasRange
              ? `Du ${filters.dateFrom || "…"} au ${filters.dateTo || "…"}`
              : "Période personnalisée"}
          </Text>
          {calendarOpen ? (
            <ChevronUp size={15} color={colors.icon} />
          ) : (
            <ChevronDown size={15} color={colors.icon} />
          )}
        </Pressable>
        {calendarOpen ? (
          <View style={styles.calendar}>
            <MonthGrid
              onSelect={pickDay}
              selectedDays={[filters.dateFrom, filters.dateTo].filter(Boolean)}
              rangeStart={filters.dateFrom}
              rangeEnd={filters.dateTo}
              labelFor={(key) => `Choisir le ${key}`}
            />
            <Text style={styles.calendarHint}>
              Un premier appui pose le début de la période, le second sa fin.
            </Text>
          </View>
        ) : null}

        <Pressable
          onPress={onReset}
          disabled={activeCount === 0}
          style={[styles.resetButton, activeCount === 0 && styles.resetButtonDisabled]}
        >
          <Text style={styles.resetLabel}>Réinitialiser les filtres</Text>
        </Pressable>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: 14, paddingTop: 4, paddingBottom: 12 },
  sectionTitle: {
    marginTop: 12,
    marginBottom: 4,
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: colors.muted,
  },
  selectTrigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.inputBg,
  },
  selectValue: { flex: 1, minWidth: 0, fontSize: 14, color: colors.text },
  segmented: { flexDirection: "row", gap: 4 },
  // `bg-wa-input-bg` au repos, `bg-wa-teal text-white` à l'état actif.
  segment: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    borderRadius: radius.md,
    backgroundColor: colors.inputBg,
  },
  segmentActive: { backgroundColor: colors.teal },
  segmentLabel: { fontSize: 12, color: colors.text },
  segmentLabelActive: { color: colors.white },
  presetGroup: { marginTop: 8 },
  presetGroupTitle: { marginBottom: 4, fontSize: 11, color: colors.muted },
  presets: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  presetChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetChipActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  presetLabel: { fontSize: 12.5, color: colors.text },
  presetLabelActive: { color: colors.white, fontWeight: "600" },
  customRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.inputBg,
  },
  customLabel: { flex: 1, minWidth: 0, fontSize: 13.5, color: colors.text },
  calendar: { marginTop: 8 },
  calendarHint: { marginTop: 6, fontSize: 11, color: colors.muted, lineHeight: 15 },
  resetButton: {
    marginTop: 18,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  resetButtonDisabled: { opacity: 0.4 },
  resetLabel: { fontSize: 12.5, color: colors.text },
});
