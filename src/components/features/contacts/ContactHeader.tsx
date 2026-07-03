import React, { useEffect, useRef, useState } from "react";
import {
  Filter,
  Download,
  UserPlus,
  Users,
  Plus,
  ChevronDown,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import {
  DateRangePicker,
  type DateRange,
} from "@/components/ui/DateRangePicker";

interface ContactHeaderProps {
  // Search
  search: string;
  onSearchChange: (v: string) => void;
  // Date range (createdFrom / createdTo)
  dateRange: DateRange;
  onDateRangeChange: (r: DateRange) => void;
  // Status pills
  filterOptions: { value: string; label: string; count?: number }[];
  currentFilter: string;
  onFilterChange: (v: string) => void;
  // Segment filter (toolbar)
  segments: { id: string; name: string }[];
  segmentId: string;
  setSegmentId: (v: string) => void;
  // Advanced modal — committed values (seed the draft) + setters
  isFilterModalOpen?: boolean;
  setIsFilterModalOpen?: (v: boolean) => void;
  sort: string;
  setSort: (v: string) => void;
  sortOrder: string;
  setSortOrder: (v: string) => void;
  pageSize: number;
  setPageSize: (v: number) => void;
  email: string;
  setEmail: (v: string) => void;
  firstName: string;
  setFirstName: (v: string) => void;
  lastName: string;
  setLastName: (v: string) => void;
  postalCode: string;
  setPostalCode: (v: string) => void;
  ids: string;
  setIds: (v: string) => void;
  onResetAdvanced: () => void;
  // Product (modal field, hidden when scoped to a product)
  products?: { id: string; name: string }[];
  productId?: string;
  setProductId?: (v: string) => void;
  hideProductFilter?: boolean;
  // Actions
  onNewContact: () => void;
  onImport?: () => void;
  onManageSegments: () => void;
}

const compactSelect =
  "h-[34px] rounded-full border border-[#E5E7EB] bg-white px-3 text-[12px] text-[#0D2137] outline-none transition-colors focus:border-[#2E8FAD] cursor-pointer max-w-[200px]";
const fieldClass =
  "w-full text-[13px] px-3 py-2 border border-[#E5E7EB] rounded-lg bg-white text-[#0D2137] outline-none focus:border-[#2E8FAD] transition-colors";

export function ContactHeader({
  search,
  onSearchChange,
  dateRange,
  onDateRangeChange,
  filterOptions,
  currentFilter,
  onFilterChange,
  segments,
  segmentId,
  setSegmentId,
  isFilterModalOpen,
  setIsFilterModalOpen,
  sort,
  setSort,
  sortOrder,
  setSortOrder,
  pageSize,
  setPageSize,
  email,
  setEmail,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  postalCode,
  setPostalCode,
  ids,
  setIds,
  onResetAdvanced,
  products = [],
  productId = "all",
  setProductId,
  hideProductFilter = false,
  onNewContact,
  onImport,
  onManageSegments,
}: ContactHeaderProps) {
  // ── "Ajouter" dropdown (Nouveau contact / Importer CSV) ──────────────────
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

  // ── Advanced filters draft (committed only on "Appliquer") ───────────────
  const [draft, setDraft] = useState({
    productId,
    email,
    firstName,
    lastName,
    postalCode,
    ids,
    sort,
    sortOrder,
    pageSize: String(pageSize),
  });

  // Seed the draft from the committed values each time the modal opens.
  useEffect(() => {
    if (isFilterModalOpen) {
      setDraft({
        productId,
        email,
        firstName,
        lastName,
        postalCode,
        ids,
        sort,
        sortOrder,
        pageSize: String(pageSize),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFilterModalOpen]);

  const setDraftField = (k: keyof typeof draft, v: string) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const applyAdvanced = () => {
    if (!hideProductFilter) setProductId?.(draft.productId);
    setEmail(draft.email);
    setFirstName(draft.firstName);
    setLastName(draft.lastName);
    setPostalCode(draft.postalCode);
    setIds(draft.ids);
    setSort(draft.sort);
    setSortOrder(draft.sortOrder);
    setPageSize(parseInt(draft.pageSize, 10) || 15);
    setIsFilterModalOpen?.(false);
  };

  const resetAdvanced = () => {
    onResetAdvanced();
    setDraft({
      productId: "all",
      email: "",
      firstName: "",
      lastName: "",
      postalCode: "",
      ids: "",
      sort: "createdAt",
      sortOrder: "desc",
      pageSize: "15",
    });
  };

  // Visual hint when at least one advanced filter is active.
  const advancedActive =
    !!email ||
    !!firstName ||
    !!lastName ||
    !!postalCode ||
    !!ids ||
    (!hideProductFilter && productId !== "all");

  return (
    <>
      {/* Toolbar — date range · search · status · segment · filters · add */}
      <div className="flex items-center gap-2 p-3 px-5 border-b border-[#E5E7EB] bg-white shrink-0 flex-wrap">
        {/* Date range (createdFrom → createdTo) */}
        <DateRangePicker value={dateRange} onChange={onDateRangeChange} />

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
            placeholder="Nom, email, téléphone…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full border-none outline-none bg-transparent text-[12.5px] text-[#0D2137] placeholder:text-[#8BAFC0]"
          />
        </div>

        <div className="w-px h-[18px] bg-[#E5E7EB] shrink-0 mx-1" />

        {/* Status filter pills (unchanged) */}
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
              currentFilter === opt.value
                ? "bg-[#0D2137] text-white border-[#0D2137] font-medium"
                : "border-[#E5E7EB] bg-transparent text-[#4A7A94] hover:bg-[#F0F2F4]"
            }`}
            onClick={() => onFilterChange(opt.value)}
          >
            {opt.label}
            {opt.count !== undefined && (
              <span className="ml-1 text-[11px] opacity-55">
                {opt.count.toLocaleString("fr")}
              </span>
            )}
          </button>
        ))}

        <div className="w-px h-[18px] bg-[#E5E7EB] shrink-0 mx-1" />

        {/* Segment filter */}
        <div className="w-8">
          <select
            value={segmentId}
            onChange={(e) => setSegmentId(e.target.value)}
            title="Filtrer par segment"
            className={compactSelect}
          >
            <option value="all">Tous les segments</option>
            {segments.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        {/* Right cluster: actions */}
        <div className="ml-auto flex gap-2 items-center">
          <button
            onClick={onManageSegments}
            className="text-[12px] font-normal px-3 py-[5px] rounded-full bg-white text-[#0D2137] border border-[#E5E7EB] cursor-pointer transition-colors hover:bg-[#F0F2F4] whitespace-nowrap inline-flex items-center gap-1.5"
          >
            <Users size={12} strokeWidth={1.5} />
            Segments
          </button>

          <button
            onClick={() => setIsFilterModalOpen?.(true)}
            className="relative text-[12px] font-normal px-3 py-[5px] rounded-full bg-white text-[#0D2137] border border-[#E5E7EB] cursor-pointer transition-colors hover:bg-[#F0F2F4] whitespace-nowrap inline-flex items-center gap-1.5"
          >
            <Filter size={12} strokeWidth={1.5} />
            {/* Filtres */}
            {advancedActive && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#E8541A] border border-white" />
            )}
          </button>

          {/* Add dropdown — Nouveau contact / Importer CSV */}
          <div ref={addRef} className="relative">
            <button
              onClick={() => setAddOpen((v) => !v)}
              className="text-[12px] font-medium px-3.5 py-[5px] rounded-full bg-[#E8541A] text-white border-none cursor-pointer transition-colors hover:bg-[#D44814] whitespace-nowrap inline-flex items-center gap-1.5"
            >
              <Plus size={13} strokeWidth={2.5} />
              Ajouter
              <ChevronDown size={13} strokeWidth={2} />
            </button>
            {addOpen && (
              <div className="absolute right-0 top-[calc(100%+6px)] z-[200] w-[200px] rounded-[10px] border border-[#E5E7EB] bg-white shadow-[0_8px_30px_rgba(13,33,55,0.12)] overflow-hidden py-1">
                <button
                  onClick={() => {
                    setAddOpen(false);
                    onNewContact();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-[12.5px] text-[#0D2137] hover:bg-[#F7F8F9] transition-colors"
                >
                  <UserPlus size={13} className="text-[#2E8FAD]" /> Nouveau
                  contact
                </button>
                <button
                  onClick={() => {
                    setAddOpen(false);
                    onImport?.();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-[12.5px] text-[#0D2137] hover:bg-[#F7F8F9] transition-colors"
                >
                  <Download size={13} className="text-[#2E8FAD]" /> Importer CSV
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Advanced filters modal — all remaining SearchClientRequest fields */}
      <Modal
        open={!!isFilterModalOpen}
        onClose={() => setIsFilterModalOpen?.(false)}
        title="Filtres avancés"
        subtitle="Affiner la liste des contacts"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button
              variant="ghost"
              onClick={resetAdvanced}
              className="text-[#8BAFC0]"
            >
              Réinitialiser
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => setIsFilterModalOpen?.(false)}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                onClick={applyAdvanced}
                className="px-6"
              >
                Appliquer
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          {!hideProductFilter && (
            <div>
              <label className="block text-[12.5px] font-medium text-[#0D2137] mb-1.5">
                Produit
              </label>
              <select
                value={draft.productId}
                onChange={(e) => setDraftField("productId", e.target.value)}
                className={fieldClass}
              >
                <option value="all">Tous les produits</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12.5px] font-medium text-[#0D2137] mb-1.5">
                Email
              </label>
              <input
                value={draft.email}
                onChange={(e) => setDraftField("email", e.target.value)}
                placeholder="jean.dupont@email.com"
                className={fieldClass}
              />
            </div>
            <div>
              <label className="block text-[12.5px] font-medium text-[#0D2137] mb-1.5">
                Code postal
              </label>
              <input
                value={draft.postalCode}
                onChange={(e) => setDraftField("postalCode", e.target.value)}
                placeholder="75001"
                className={fieldClass}
              />
            </div>
            <div>
              <label className="block text-[12.5px] font-medium text-[#0D2137] mb-1.5">
                Prénom
              </label>
              <input
                value={draft.firstName}
                onChange={(e) => setDraftField("firstName", e.target.value)}
                placeholder="Jean"
                className={fieldClass}
              />
            </div>
            <div>
              <label className="block text-[12.5px] font-medium text-[#0D2137] mb-1.5">
                Nom
              </label>
              <input
                value={draft.lastName}
                onChange={(e) => setDraftField("lastName", e.target.value)}
                placeholder="Dupont"
                className={fieldClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-[12.5px] font-medium text-[#0D2137] mb-1.5">
              IDs de contacts
            </label>
            <input
              value={draft.ids}
              onChange={(e) => setDraftField("ids", e.target.value)}
              placeholder="id1, id2, id3…"
              className={fieldClass}
            />
            <p className="text-[11px] text-[#8BAFC0] mt-1">
              Plusieurs identifiants séparés par des virgules.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[12.5px] font-medium text-[#0D2137] mb-1.5">
                Trier par
              </label>
              <select
                value={draft.sort}
                onChange={(e) => setDraftField("sort", e.target.value)}
                className={fieldClass}
              >
                <option value="createdAt">Date de création</option>
                <option value="firstName">Prénom</option>
                <option value="lastName">Nom</option>
                <option value="email">Email</option>
                <option value="status">Statut</option>
              </select>
            </div>
            <div>
              <label className="block text-[12.5px] font-medium text-[#0D2137] mb-1.5">
                Ordre
              </label>
              <select
                value={draft.sortOrder}
                onChange={(e) => setDraftField("sortOrder", e.target.value)}
                className={fieldClass}
              >
                <option value="desc">Décroissant</option>
                <option value="asc">Croissant</option>
              </select>
            </div>
            <div>
              <label className="block text-[12.5px] font-medium text-[#0D2137] mb-1.5">
                Par page
              </label>
              <select
                value={draft.pageSize}
                onChange={(e) => setDraftField("pageSize", e.target.value)}
                className={fieldClass}
              >
                <option value="15">15</option>
                <option value="30">30</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
