import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import dayjs from 'dayjs';
import { CalendarDays, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MonthCalendar } from '@/components/ui/DateRangePicker';

interface DatePickerProps {
  /** Selected day as `yyyy-mm-dd`, or '' for none. */
  value: string;
  onChange: (day: string) => void;
  /** Text shown on the trigger when nothing is selected. */
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  /** Swaps the calendar icon for a spinner while the caller is working. */
  busy?: boolean;
  clearable?: boolean;
  /**
   * Days that hold something, oldest first (`yyyy-mm-dd`). Marked with a dot
   * in the grid and offered as shortcuts. Any other date stays selectable.
   */
  availableDays?: string[];
}

/** How many recent available days to offer as one-click shortcuts. */
const SHORTCUT_COUNT = 6;

/**
 * Single-day picker built on the project's own {@link MonthCalendar}, so the
 * grid, the French labels and the today/selection styling match the range
 * picker used elsewhere.
 *
 * The panel is rendered in a **portal**: this picker sits in the chat search
 * bar, whose container is `overflow-hidden` for its height animation, so an
 * absolutely-positioned popover was clipped away entirely — the calendar
 * opened, invisibly. Fixed coordinates from the trigger's rect escape every
 * ancestor's clipping.
 */
export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Choisir une date',
  className,
  disabled,
  busy,
  clearable = true,
  availableDays = [],
}) => {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<{ top: number; left: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const selected = value ? dayjs(value) : null;
  const marked = useMemo(() => new Set(availableDays), [availableDays]);
  /** Most recent first — that is the direction people look for a message. */
  const shortcuts = useMemo(
    () => [...availableDays].reverse().slice(0, SHORTCUT_COUNT),
    [availableDays],
  );

  const [month, setMonth] = useState(() => dayjs().startOf('month'));

  /** Places the panel under the trigger, flipping up when space is short. */
  const place = useCallback(() => {
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect) return;
    const height = panelRef.current?.offsetHeight ?? 360;
    const width = panelRef.current?.offsetWidth ?? 272;
    const below = window.innerHeight - rect.bottom;
    const top = below < height + 16 && rect.top > below ? rect.top - height - 8 : rect.bottom + 8;
    // Keep it inside the viewport horizontally, right-aligned on the trigger.
    const left = Math.max(8, Math.min(rect.right - width, window.innerWidth - width - 8));
    setAnchor({ top, left });
  }, []);

  useEffect(() => {
    if (!open) return;
    // Re-centre on the selection, or on the most recent day with content.
    const focus = selected ?? (shortcuts[0] ? dayjs(shortcuts[0]) : dayjs());
    setMonth(focus.startOf('month'));
    place();
    // A second pass once the panel has a real height, for the flip decision.
    const raf = requestAnimationFrame(place);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation(); // don't also close the surface behind us
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKey, true);
    window.addEventListener('resize', place);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKey, true);
      window.removeEventListener('resize', place);
    };
  }, [open, place]);

  const pick = (day: string) => {
    onChange(day);
    setOpen(false);
  };

  const label = selected ? selected.format('DD/MM/YYYY') : placeholder;

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <div
        className={cn(
          'flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1',
          disabled && 'opacity-60',
        )}
      >
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="dialog"
          aria-expanded={open}
          className="flex min-w-0 cursor-pointer items-center gap-1.5 disabled:cursor-not-allowed"
        >
          {busy ? (
            <Loader2 size={14} className="animate-spin text-wa-icon" />
          ) : (
            <CalendarDays size={14} className="text-wa-icon" />
          )}
          <span
            className={cn('truncate text-xs', selected ? 'text-wa-text' : 'text-wa-muted')}
          >
            {label}
          </span>
        </button>
        {clearable && selected && !disabled && (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="Effacer la date"
            className="shrink-0 rounded-full p-0.5 text-wa-icon transition-colors hover:bg-wa-hover"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {open &&
        anchor &&
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-label="Choisir une date"
            style={{ position: 'fixed', top: anchor.top, left: anchor.left }}
            className="z-[1100] w-68 rounded-xl border border-wa-border bg-white p-3 shadow-2xl"
          >
            {shortcuts.length > 0 && (
              <div className="mb-2 border-b border-wa-border pb-2">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-wa-muted">
                  Dates avec messages
                </p>
                <div className="flex flex-wrap gap-1">
                  {shortcuts.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => pick(day)}
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[11px] transition-colors',
                        day === value
                          ? 'bg-wa-teal text-white'
                          : 'bg-wa-input-bg text-wa-text hover:bg-wa-hover',
                      )}
                    >
                      {dayjs(day).format('DD MMM')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <MonthCalendar
              month={month}
              selectStart={selected}
              selectEnd={selected}
              hoverDate={null}
              markedDays={marked}
              onDayClick={(day) => pick(day.format('YYYY-MM-DD'))}
              onDayHover={() => undefined}
              allowPrev
              allowNext
              onPrev={() => setMonth((m) => m.subtract(1, 'month'))}
              onNext={() => setMonth((m) => m.add(1, 'month'))}
            />

            <div className="mt-1 flex items-center justify-between border-t border-wa-border pt-2">
              <span className="text-[10px] text-wa-muted">
                • jours déjà chargés
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-1 text-xs text-wa-muted transition-colors hover:bg-wa-hover"
              >
                Fermer
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};
