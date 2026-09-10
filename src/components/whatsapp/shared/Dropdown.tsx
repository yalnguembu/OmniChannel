import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  /** Extra classes for the row — used to tint status entries. */
  className?: string;
}

interface DropdownProps {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  /** Trigger content. It is wrapped in a <button>, so don't pass one. */
  trigger: React.ReactNode;
  /** Accessible name of the control. */
  label: string;
  /** Which edge the menu lines up with. */
  align?: 'left' | 'right';
  className?: string;
  menuClassName?: string;
  title?: string;
  disabled?: boolean;
}

/** Below this much room under the trigger, the menu opens upwards instead. */
const FLIP_THRESHOLD_PX = 260;

/**
 * Listbox replacing the native `<select>`.
 *
 * The project's `ui/Select` is a styled `<select>`, which can't carry icons or
 * status colours in its options and renders as an OS widget — so the WhatsApp
 * surfaces use this instead. Keyboard behaviour mirrors the native control:
 * ↑/↓ move, Enter picks, Escape closes and returns focus, Home/End jump.
 */
export const Dropdown: React.FC<DropdownProps> = ({
  value,
  options,
  onChange,
  trigger,
  label,
  align = 'left',
  className,
  menuClassName,
  title,
  disabled,
}) => {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const [placement, setPlacement] = useState<'bottom' | 'top'>('bottom');
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  const selectedIndex = options.findIndex((o) => o.value === value);

  const close = useCallback((refocus = true) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  }, []);

  const openMenu = useCallback(() => {
    if (disabled) return;
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      const below = window.innerHeight - rect.bottom;
      setPlacement(below < FLIP_THRESHOLD_PX && rect.top > below ? 'top' : 'bottom');
    }
    setHighlight(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  }, [disabled, selectedIndex]);

  // Close on an outside press, and when the page scrolls the menu away.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
    };
  }, [open]);

  // Move focus into the list so arrow keys work straight away.
  useEffect(() => {
    if (open) listRef.current?.focus();
  }, [open]);

  const step = (from: number, delta: number) => {
    const n = options.length;
    for (let i = 1; i <= n; i += 1) {
      const next = (from + delta * i + n * i) % n;
      if (!options[next]?.disabled) return next;
    }
    return from;
  };

  const commit = (index: number) => {
    const option = options[index];
    if (!option || option.disabled) return;
    close();
    if (option.value !== value) onChange(option.value);
  };

  const onListKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlight((i) => step(i, 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlight((i) => step(i, -1));
        break;
      case 'Home':
        e.preventDefault();
        setHighlight(step(-1, 1));
        break;
      case 'End':
        e.preventDefault();
        setHighlight(step(options.length, -1));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        commit(highlight);
        break;
      case 'Escape':
        e.preventDefault();
        e.stopPropagation(); // don't also close the panel behind us
        close();
        break;
      case 'Tab':
        setOpen(false);
        break;
      default:
        break;
    }
  };

  const onTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openMenu();
    }
  };

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        title={title}
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => (open ? close(false) : openMenu())}
        onKeyDown={onTriggerKeyDown}
        className="flex w-full cursor-pointer items-center text-left disabled:cursor-not-allowed disabled:opacity-50"
      >
        {trigger}
      </button>

      {open && (
        <ul
          id={listId}
          ref={listRef}
          role="listbox"
          aria-label={label}
          tabIndex={-1}
          onKeyDown={onListKeyDown}
          onBlur={(e) => {
            if (!rootRef.current?.contains(e.relatedTarget as Node)) setOpen(false);
          }}
          className={cn(
            'absolute z-50 max-h-64 min-w-48 overflow-y-auto rounded-xl border border-wa-border bg-white py-1',
            'shadow-xl outline-none [scrollbar-width:thin]',
            placement === 'bottom' ? 'top-[calc(100%+6px)]' : 'bottom-[calc(100%+6px)]',
            align === 'right' ? 'right-0' : 'left-0',
            menuClassName,
          )}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                aria-disabled={option.disabled || undefined}
                onMouseEnter={() => !option.disabled && setHighlight(index)}
                onClick={() => commit(index)}
                className={cn(
                  'flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm',
                  option.disabled && 'cursor-not-allowed text-wa-muted opacity-60',
                  !option.disabled && index === highlight && 'bg-wa-hover',
                  isSelected && 'font-medium',
                  option.className,
                )}
              >
                {option.icon && <span className="shrink-0">{option.icon}</span>}
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                {isSelected && <Check size={15} className="shrink-0 text-wa-teal" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
