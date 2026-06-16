"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import dayjs, { Dayjs } from "dayjs";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface Preset {
  key: string;
  label: string;
  group: string;
  getRange: () => DateRange;
}

// ─────────────────────────────────────────────
// i18n constants
// ─────────────────────────────────────────────

const MONTHS_FR = [
  "Janvier","Février","Mars","Avril","Mai","Juin",
  "Juillet","Août","Septembre","Octobre","Novembre","Décembre",
];
const DAYS_SHORT = ["Lu","Ma","Me","Je","Ve","Sa","Di"];

// ─────────────────────────────────────────────
// Date helpers
// ─────────────────────────────────────────────

/** Returns the Monday of the week containing `d`. */
const weekStart = (d: Dayjs) =>
  d.subtract((d.day() + 6) % 7, "day").startOf("day");

// ─────────────────────────────────────────────
// Presets
// ─────────────────────────────────────────────

const mkPreset = (
  key: string,
  label: string,
  group: string,
  fn: () => DateRange,
): Preset => ({ key, label, group, getRange: fn });

export const DATE_PRESETS: Preset[] = [
  // ── Jours ──────────────────────────────────
  mkPreset("today", "Aujourd'hui", "Jours", () => ({
    start: dayjs().startOf("day").toDate(),
    end: dayjs().endOf("day").toDate(),
  })),
  mkPreset("yesterday", "Hier", "Jours", () => ({
    start: dayjs().subtract(1, "day").startOf("day").toDate(),
    end: dayjs().subtract(1, "day").endOf("day").toDate(),
  })),
  mkPreset("last3days", "3 derniers jours", "Jours", () => ({
    start: dayjs().subtract(2, "day").startOf("day").toDate(),
    end: dayjs().endOf("day").toDate(),
  })),

  // ── Semaines ───────────────────────────────
  mkPreset("thisweek", "Cette semaine", "Semaines", () => ({
    start: weekStart(dayjs()).toDate(),
    end: weekStart(dayjs()).add(6, "day").endOf("day").toDate(),
  })),
  mkPreset("lastweek", "Semaine passée", "Semaines", () => {
    const s = weekStart(dayjs()).subtract(7, "day");
    return { start: s.toDate(), end: s.add(6, "day").endOf("day").toDate() };
  }),

  // ── Mois ───────────────────────────────────
  mkPreset("thismonth", "Ce mois", "Mois", () => ({
    start: dayjs().startOf("month").toDate(),
    end: dayjs().endOf("month").toDate(),
  })),
  mkPreset("lastmonth", "Mois passé", "Mois", () => {
    const lm = dayjs().subtract(1, "month");
    return { start: lm.startOf("month").toDate(), end: lm.endOf("month").toDate() };
  }),
  mkPreset("last3m", "3 derniers mois", "Mois", () => ({
    start: dayjs().subtract(3, "month").startOf("day").toDate(),
    end: dayjs().endOf("day").toDate(),
  })),
  mkPreset("last6m", "6 derniers mois", "Mois", () => ({
    start: dayjs().subtract(6, "month").startOf("day").toDate(),
    end: dayjs().endOf("day").toDate(),
  })),

  // ── Trimestres ─────────────────────────────
  mkPreset("thisq", "Ce trimestre", "Trimestres", () => {
    const q = Math.floor(dayjs().month() / 3);
    return {
      start: dayjs().month(q * 3).startOf("month").toDate(),
      end: dayjs().month(q * 3 + 2).endOf("month").toDate(),
    };
  }),
  mkPreset("lastq", "Trimestre passé", "Trimestres", () => {
    const today = dayjs();
    const q = Math.floor(today.month() / 3);
    const pq = q === 0 ? 3 : q - 1;
    const yr = q === 0 ? today.year() - 1 : today.year();
    return {
      start: dayjs().year(yr).month(pq * 3).startOf("month").toDate(),
      end: dayjs().year(yr).month(pq * 3 + 2).endOf("month").toDate(),
    };
  }),

  // ── Semestres ──────────────────────────────
  mkPreset("thissem", "Ce semestre", "Semestres", () => {
    const today = dayjs();
    return today.month() < 6
      ? { start: today.month(0).startOf("month").toDate(), end: today.month(5).endOf("month").toDate() }
      : { start: today.month(6).startOf("month").toDate(), end: today.month(11).endOf("month").toDate() };
  }),
  mkPreset("lastsem", "Semestre passé", "Semestres", () => {
    const today = dayjs();
    return today.month() < 6
      ? {
          start: today.subtract(1, "year").month(6).startOf("month").toDate(),
          end: today.subtract(1, "year").month(11).endOf("month").toDate(),
        }
      : { start: today.month(0).startOf("month").toDate(), end: today.month(5).endOf("month").toDate() };
  }),

  // ── Années ─────────────────────────────────
  mkPreset("thisyear", "Cette année", "Années", () => ({
    start: dayjs().startOf("year").toDate(),
    end: dayjs().endOf("year").toDate(),
  })),
  mkPreset("lastyear", "Année passée", "Années", () => {
    const ly = dayjs().subtract(1, "year");
    return { start: ly.startOf("year").toDate(), end: ly.endOf("year").toDate() };
  }),
  mkPreset("last3y", "3 dernières années", "Années", () => ({
    start: dayjs().subtract(3, "year").startOf("year").toDate(),
    end: dayjs().endOf("year").toDate(),
  })),
];

// ─────────────────────────────────────────────
// Public utilities
// ─────────────────────────────────────────────

/** Returns the "this week" range (Monday → Sunday). */
export function getThisWeekRange(): DateRange {
  return DATE_PRESETS.find((p) => p.key === "thisweek")!.getRange();
}

/** Converts a DateRange to the ISO strings expected by the API. */
export function rangeToApiStrings(range: DateRange): {
  start: string | undefined;
  end: string | undefined;
} {
  return {
    start: range.start
      ? dayjs(range.start).startOf("day").format("YYYY-MM-DDTHH:mm:ss")
      : undefined,
    end: range.end
      ? dayjs(range.end).endOf("day").format("YYYY-MM-DDTHH:mm:ss")
      : undefined,
  };
}

/** Human-readable label for a DateRange (uses preset name if it matches). */
export function formatDateRangeLabel(range: DateRange): string {
  if (!range.start && !range.end) return "Sélectionner une période";
  if (range.start || range.end) {
    const match = DATE_PRESETS.find((p) => {
      const pr = p.getRange();
      return (
        pr.start &&
        pr.end &&
        range.start &&
        range.end &&
        dayjs(pr.start).isSame(dayjs(range.start), "day") &&
        dayjs(pr.end).isSame(dayjs(range.end), "day")
      );
    });
    if (match) return match.label;
  }
  const fmt = (d: Date) => dayjs(d).format("DD/MM/YYYY");
  if (range.start && range.end) return `${fmt(range.start)} – ${fmt(range.end)}`;
  if (range.start) return `Depuis le ${fmt(range.start)}`;
  return "Sélectionner une période";
}

// ─────────────────────────────────────────────
// MonthCalendar sub-component
// ─────────────────────────────────────────────

interface MonthCalendarProps {
  month: Dayjs;
  selectStart: Dayjs | null;
  selectEnd: Dayjs | null;
  hoverDate: Dayjs | null;
  onDayClick: (day: Dayjs) => void;
  onDayHover: (day: Dayjs | null) => void;
  allowPrev?: boolean;
  allowNext?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
}

function MonthCalendar({
  month,
  selectStart,
  selectEnd,
  hoverDate,
  onDayClick,
  onDayHover,
  allowPrev,
  allowNext,
  onPrev,
  onNext,
}: MonthCalendarProps) {
  const today = dayjs().startOf("day");

  // Build 42-cell grid (6 rows × 7 cols) starting from the Monday before month start
  const firstDay = month.date(1);
  const gridStart = firstDay.subtract((firstDay.day() + 6) % 7, "day");
  const cells = Array.from({ length: 42 }, (_, i) => gridStart.add(i, "day"));

  // Normalise range for highlight (swap if end < start during hover)
  let rStart = selectStart;
  let rEnd = selectEnd ?? hoverDate;
  if (rStart && rEnd && rEnd.isBefore(rStart, "day")) {
    [rStart, rEnd] = [rEnd, rStart];
  }

  return (
    <div className="select-none w-[224px]">
      {/* Month header */}
      <div className="flex items-center justify-between h-8 mb-2">
        {allowPrev ? (
          <button
            type="button"
            onClick={onPrev}
            className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        ) : (
          <div className="w-7" />
        )}
        <span className="text-sm font-semibold text-slate-800">
          {MONTHS_FR[month.month()]} {month.year()}
        </span>
        {allowNext ? (
          <button
            type="button"
            onClick={onNext}
            className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <div className="w-7" />
        )}
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS_SHORT.map((d) => (
          <div
            key={d}
            className="h-7 flex items-center justify-center text-[11px] font-semibold text-slate-400 uppercase tracking-wide"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          const inMonth = day.month() === month.month();
          const isToday = day.isSame(today, "day");
          const isStart = rStart ? day.isSame(rStart, "day") : false;
          const isEnd = rEnd ? day.isSame(rEnd, "day") : false;
          const inRange =
            rStart && rEnd
              ? day.isAfter(rStart, "day") && day.isBefore(rEnd, "day")
              : false;
          const singleDay = isStart && isEnd;

          return (
            <div
              key={idx}
              className={cn(
                "relative h-8",
                // Range background strip
                inRange && inMonth && "bg-blue-100",
                inRange && !inMonth && "bg-blue-50",
                // Left-edge rounded cap
                isStart && !singleDay && rEnd && "rounded-l-full",
                isStart && !singleDay && rEnd && inMonth && "bg-blue-100",
                isStart && !singleDay && rEnd && !inMonth && "bg-blue-50",
                // Right-edge rounded cap
                isEnd && !singleDay && rStart && "rounded-r-full",
              )}
            >
              <button
                type="button"
                disabled={!inMonth}
                onClick={() => inMonth && onDayClick(day)}
                onMouseEnter={() => onDayHover(day)}
                onMouseLeave={() => onDayHover(null)}
                className={cn(
                  "absolute inset-0 m-0.5 flex items-center justify-center text-xs rounded-full transition-colors duration-100",
                  // Out-of-month
                  !inMonth && "text-slate-200 cursor-default pointer-events-none",
                  // Default in-month day
                  inMonth && !isStart && !isEnd && "text-slate-700 hover:bg-blue-200 hover:text-blue-800",
                  // Today indicator
                  isToday && !isStart && !isEnd && inMonth && "ring-2 ring-blue-400 ring-offset-0 text-blue-600 font-bold",
                  // Range edges
                  (isStart || isEnd) && inMonth && "bg-blue-600 text-white font-semibold hover:bg-blue-700",
                  // Single-day selection
                  singleDay && "rounded-full",
                )}
              >
                {day.date()}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// DateRangePicker main component
// ─────────────────────────────────────────────

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
  align?: "left" | "right";
}

export function DateRangePicker({
  value,
  onChange,
  className,
  align = "left",
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Temporary selection inside the panel (not yet applied)
  const [tempStart, setTempStart] = useState<Dayjs | null>(null);
  const [tempEnd, setTempEnd] = useState<Dayjs | null>(null);
  const [hoverDate, setHoverDate] = useState<Dayjs | null>(null);
  const [leftMonth, setLeftMonth] = useState<Dayjs>(() =>
    value.start ? dayjs(value.start).startOf("month") : dayjs().startOf("month"),
  );

  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const rightMonth = leftMonth.add(1, "month");

  // Active preset key derived from current value
  const activePreset = useMemo(() => {
    if (!value.start || !value.end) return null;
    return (
      DATE_PRESETS.find((p) => {
        const pr = p.getRange();
        return (
          pr.start &&
          pr.end &&
          dayjs(pr.start).isSame(dayjs(value.start!), "day") &&
          dayjs(pr.end).isSame(dayjs(value.end!), "day")
        );
      })?.key ?? null
    );
  }, [value]);

  // Group presets for sidebar rendering
  const presetGroups = useMemo(() => {
    const groups: [string, Preset[]][] = [];
    const map: Record<string, Preset[]> = {};
    for (const preset of DATE_PRESETS) {
      if (!map[preset.group]) {
        const list: Preset[] = [];
        map[preset.group] = list;
        groups.push([preset.group, list]);
      }
      map[preset.group]!.push(preset);
    }
    return groups;
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  const handleOpen = () => {
    setTempStart(value.start ? dayjs(value.start) : null);
    setTempEnd(value.end ? dayjs(value.end) : null);
    if (value.start) setLeftMonth(dayjs(value.start).startOf("month"));
    setHoverDate(null);
    setIsOpen(true);
  };

  const handleDayClick = (day: Dayjs) => {
    if (!tempStart || (tempStart && tempEnd)) {
      // Start new selection
      setTempStart(day);
      setTempEnd(null);
    } else {
      // Complete selection
      if (day.isBefore(tempStart, "day")) {
        setTempEnd(tempStart);
        setTempStart(day);
      } else {
        setTempEnd(day);
      }
    }
  };

  const handleApply = () => {
    if (!tempStart) return;
    onChange({
      start: tempStart.startOf("day").toDate(),
      end: tempEnd ? tempEnd.endOf("day").toDate() : tempStart.endOf("day").toDate(),
    });
    setIsOpen(false);
  };

  const handlePreset = (preset: Preset) => {
    onChange(preset.getRange());
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({ start: null, end: null });
  };

  const label = formatDateRangeLabel(value);
  const hasValue = !!(value.start || value.end);

  return (
    <div className={cn("relative inline-flex items-center gap-1", className)}>
      {/* ── Trigger button ── */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        className={cn(
          "inline-flex items-center gap-2 h-9 px-3 rounded-lg border text-sm font-medium transition-all",
          "bg-white text-slate-700 cursor-pointer",
          !isOpen && "border-slate-200 hover:border-blue-400 hover:bg-blue-50/60",
          isOpen && "border-blue-500 bg-blue-50 ring-2 ring-blue-200",
          hasValue && !isOpen && "border-blue-300 bg-blue-50/40 text-blue-800",
        )}
      >
        <CalendarDays
          className={cn("h-4 w-4 shrink-0", hasValue ? "text-blue-500" : "text-slate-400")}
        />
        <span className="max-w-65 truncate">{label}</span>
        {activePreset && (
          <span className="ml-0.5 shrink-0 px-1.5 py-0.5 text-[10px] font-semibold bg-blue-600 text-white rounded-full leading-none">
            {DATE_PRESETS.find((p) => p.key === activePreset)?.label}
          </span>
        )}
      </button>

      {/* Clear button */}
      {hasValue && (
        <button
          type="button"
          onClick={handleClear}
          className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          title="Effacer la période"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      {/* ── Dropdown panel ── */}
      {isOpen && (
        <div
          ref={panelRef}
          className={cn(
            "absolute top-full mt-2 z-50 flex overflow-hidden",
            "bg-white rounded-lg border border-slate-200 shadow-2xl shadow-slate-200/80",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {/* Left sidebar — presets */}
          <div className="w-44 bg-lineart-to-b from-slate-50 to-slate-100/60 border-r border-slate-200 shrink-0 overflow-y-auto py-3" style={{ maxHeight: 440 }}>
            {presetGroups.map(([group, presets]) => (
              <div key={group} className="mb-2">
                <div className="px-3 pt-1 pb-0.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {group}
                </div>
                {presets.map((preset) => (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => handlePreset(preset)}
                    className={cn(
                      "w-full text-left px-3 py-1.5 text-xs transition-all duration-100 rounded-none",
                      activePreset === preset.key
                        ? "bg-blue-600 text-white font-semibold"
                        : "text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm",
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Right area — calendars + footer */}
          <div className="flex flex-col">
            {/* Dual calendar */}
            <div className="flex items-start gap-0 p-5 pb-4">
              <MonthCalendar
                month={leftMonth}
                selectStart={tempStart}
                selectEnd={tempEnd}
                hoverDate={hoverDate}
                onDayClick={handleDayClick}
                onDayHover={setHoverDate}
                allowPrev
                onPrev={() => setLeftMonth((m) => m.subtract(1, "month"))}
              />
              <div className="mx-4 self-stretch w-px bg-slate-100" />
              <MonthCalendar
                month={rightMonth}
                selectStart={tempStart}
                selectEnd={tempEnd}
                hoverDate={hoverDate}
                onDayClick={handleDayClick}
                onDayHover={setHoverDate}
                allowNext
                onNext={() => setLeftMonth((m) => m.add(1, "month"))}
              />
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 px-5 py-3 flex items-center justify-between bg-slate-50/80 rounded-b-2xl">
              <p className="text-xs text-slate-400">
                {!tempStart && "Sélectionnez une date de début"}
                {tempStart && !tempEnd && (
                  <>
                    <span className="text-blue-600 font-semibold">
                      {dayjs(tempStart).format("DD/MM/YYYY")}
                    </span>
                    <span> → sélectionnez une date de fin</span>
                  </>
                )}
                {tempStart && tempEnd && (
                  <>
                    <span className="text-blue-600 font-semibold">
                      {dayjs(tempStart).format("DD/MM/YYYY")}
                    </span>
                    <span className="text-slate-400"> – </span>
                    <span className="text-blue-600 font-semibold">
                      {dayjs(tempEnd).format("DD/MM/YYYY")}
                    </span>
                  </>
                )}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-slate-500 hover:text-slate-700"
                >
                  Annuler
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={!tempStart}
                  onClick={handleApply}
                  className="px-4"
                >
                  Appliquer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
