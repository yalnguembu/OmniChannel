import React, { useEffect, useRef, useState } from "react";
import { Filter, Plus, ChevronDown } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import {
  DateRangePicker,
  type DateRange,
} from "@/components/ui/DateRangePicker";

/** A single advanced-filter field rendered inside the "Filtres" modal. */
export interface FilterFieldConfig {
  key: string;
  label: string;
  type: "text" | "number" | "select";
  options?: { value: string; label: string }[];
  placeholder?: string;
  help?: string;
  fullWidth?: boolean;
}

/** A toolbar action (create / import / …). */
export interface ListAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
}

interface ListFilterBarProps {
  // Search
  search: string;
  onSearchChange: (v: string) => void;
  searchPlaceholder?: string;
  // Date range (createdFrom / createdTo)
  dateRange?: DateRange;
  onDateRangeChange?: (r: DateRange) => void;
  // Status pills (optional)
  statusOptions?: { value: string; label: string; count?: number }[];
  currentStatus?: string;
  onStatusChange?: (v: string) => void;
  // Advanced modal (config-driven, draft applied on "Appliquer")
  advancedFields?: FilterFieldConfig[];
  advancedValues?: Record<string, string>;
  advancedDefaults?: Record<string, string>;
  onApplyAdvanced?: (values: Record<string, string>) => void;
  isFilterModalOpen?: boolean;
  setIsFilterModalOpen?: (v: boolean) => void;
  // Actions: 0 → none, 1 → single orange button, >1 → "Ajouter ▾" dropdown
  actions?: ListAction[];
  addLabel?: string;
  // Optional extra controls injected into the toolbar (e.g. channel tabs)
  children?: React.ReactNode;
}

const fieldClass =
  "w-full text-[13px] px-3 py-2 border border-[#E5E7EB] rounded-lg bg-white text-[#0D2137] outline-none focus:border-[#2E8FAD] transition-colors";

export function ListFilterBar({
  search,
  onSearchChange,
  searchPlaceholder = "Rechercher…",
  dateRange,
  onDateRangeChange,
  statusOptions,
  currentStatus,
  onStatusChange,
  advancedFields,
  advancedValues,
  advancedDefaults,
  onApplyAdvanced,
  isFilterModalOpen,
  setIsFilterModalOpen,
  actions = [],
  addLabel = "Ajouter",
  children,
}: ListFilterBarProps) {
  // ── Actions dropdown ─────────────────────────────────────────────────────
  const [addOpen, setAddOpen] = useState(false);
  const addRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!addOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (addRef.current && !addRef.current.contains(e.target as Node))
        setAddOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [addOpen]);

  // ── Advanced filters draft ───────────────────────────────────────────────
  const [draft, setDraft] = useState<Record<string, string>>(advancedValues ?? {});
  const isModalOpen = isFilterModalOpen ?? false;
  const setModalOpen = setIsFilterModalOpen ?? (() => undefined);
  useEffect(() => {
    if (isModalOpen) setDraft(advancedValues ?? {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen]);

  const setDraftField = (k: string, v: string) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const apply = () => {
    onApplyAdvanced?.(draft);
    setModalOpen(false);
  };
  const reset = () => {
    const defaults = advancedDefaults ?? {};
    setDraft(defaults);
    onApplyAdvanced?.(defaults);
  };

  const advancedActive = advancedFields?.some((f) => {
    const values = advancedValues ?? {};
    const defaults = advancedDefaults ?? {};
    const v = (values[f.key] ?? "").trim();
    const def = (defaults[f.key] ?? "").trim();
    return v !== "" && v !== def;
  });

  return (
    <>
      <div className="flex items-center gap-2 p-3 px-5 border-b border-[#E5E7EB] bg-white shrink-0 flex-wrap">
        {/* Date range */}
        <DateRangePicker
          value={dateRange ?? { start: null, end: null }}
          onChange={onDateRangeChange ?? (() => undefined)}
        />

        {/* Search */}
        <div className="flex items-center gap-2 px-3 bg-white border border-[#E5E7EB] rounded-full h-[34px] w-[240px] focus-within:border-[#2E8FAD] focus-within:ring-2 focus-within:ring-[#2E8FAD]/10 transition-colors">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="5" cy="5" r="3.5" stroke="#8BAFC0" strokeWidth="1.1" />
            <path
              d="M8 8l2.5 2.5"
              stroke="#8BAFC0"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
          <input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full border-none outline-none bg-transparent text-[12.5px] text-[#0D2137] placeholder:text-[#8BAFC0]"
          />
        </div>

        {/* Status pills (optional) */}
        {statusOptions && statusOptions.length > 0 && (
          <>
            <div className="w-px h-[18px] bg-[#E5E7EB] shrink-0 mx-1" />
            {statusOptions?.map((opt) => (
              <button
                key={opt.value}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
                  currentStatus === opt.value
                    ? "bg-[#0D2137] text-white border-[#0D2137] font-medium"
                    : "border-[#E5E7EB] bg-transparent text-[#4A7A94] hover:bg-[#F0F2F4]"
                }`}
                onClick={() => onStatusChange?.(opt.value)}
              >
                {opt.label}
                {opt.count !== undefined && (
                  <span className="ml-1 text-[11px] opacity-55">
                    {opt.count.toLocaleString("fr")}
                  </span>
                )}
              </button>
            ))}
          </>
        )}

        {/* Extra toolbar controls */}
        {children}

        {/* Right cluster */}
        <div className="ml-auto flex gap-2 items-center">
          <button
            onClick={() => setModalOpen(true)}
            className="relative text-[12px] font-normal px-3 py-[5px] rounded-full bg-white text-[#0D2137] border border-[#E5E7EB] cursor-pointer transition-colors hover:bg-[#F0F2F4] whitespace-nowrap inline-flex items-center gap-1.5"
          >
            <Filter size={12} strokeWidth={1.5} />
            Filtres
            {advancedActive && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#E8541A] border border-white" />
            )}
          </button>

          {actions.length === 1 && (
            <button
              onClick={actions[0].onClick}
              className="text-[12px] font-medium px-3.5 py-[5px] rounded-full bg-[#E8541A] text-white border-none cursor-pointer transition-colors hover:bg-[#D44814] whitespace-nowrap inline-flex items-center gap-1.5"
            >
              {actions[0].icon ?? <Plus size={13} strokeWidth={2.5} />}
              {actions[0].label}
            </button>
          )}

          {actions.length > 1 && (
            <div ref={addRef} className="relative">
              <button
                onClick={() => setAddOpen((v) => !v)}
                className="text-[12px] font-medium px-3.5 py-[5px] rounded-full bg-[#E8541A] text-white border-none cursor-pointer transition-colors hover:bg-[#D44814] whitespace-nowrap inline-flex items-center gap-1.5"
              >
                <Plus size={13} strokeWidth={2.5} />
                {addLabel}
                <ChevronDown size={13} strokeWidth={2} />
              </button>
              {addOpen && (
                <div className="absolute right-0 top-[calc(100%+6px)] z-[200] w-[210px] rounded-[10px] border border-[#E5E7EB] bg-white shadow-[0_8px_30px_rgba(13,33,55,0.12)] overflow-hidden py-1">
                  {actions?.map((a) => (
                    <button
                      key={a.label}
                      onClick={() => {
                        setAddOpen(false);
                        a.onClick();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-[12.5px] text-[#0D2137] hover:bg-[#F7F8F9] transition-colors"
                    >
                      <span className="text-[#2E8FAD]">{a.icon}</span>
                      {a.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Advanced filters modal */}
      <Modal
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
        title="Filtres avancés"
        subtitle="Affiner la liste"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button variant="ghost" onClick={reset} className="text-[#8BAFC0]">
              Réinitialiser
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => setModalOpen(false)}
              >
                Annuler
              </Button>
              <Button variant="primary" onClick={apply} className="px-6">
                Appliquer
              </Button>
            </div>
          </div>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          {advancedFields?.map((f) => (
            <div key={f.key} className={f.fullWidth ? "col-span-2" : undefined}>
              <label className="block text-[12.5px] font-medium text-[#0D2137] mb-1.5">
                {f.label}
              </label>
              {f.type === "select" ? (
                <select
                  value={draft[f.key] ?? ""}
                  onChange={(e) => setDraftField(f.key, e.target.value)}
                  className={fieldClass}
                >
                  {(f.options ?? [])?.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={f.type === "number" ? "number" : "text"}
                  value={draft[f.key] ?? ""}
                  onChange={(e) => setDraftField(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className={fieldClass}
                />
              )}
              {f.help && (
                <p className="text-[11px] text-[#8BAFC0] mt-1">{f.help}</p>
              )}
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
}
