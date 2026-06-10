import React from "react";
import { Filter, Download, UserPlus, Users } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

interface ContactHeaderProps {
  totalCount: number;
  search: string;
  onSearchChange: (v: string) => void;
  onNewContact: () => void;
  onImport?: () => void;
  // Filters
  filterOptions: { value: string; label: string; count?: number }[];
  currentFilter: string;
  onFilterChange: (v: string) => void;
  // Advanced Modal
  isFilterModalOpen: boolean;
  setIsFilterModalOpen: (v: boolean) => void;
  sort: string;
  setSort: (v: string) => void;
  sortOrder: string;
  setSortOrder: (v: string) => void;
  pageSize: number;
  setPageSize: (v: number) => void;
  segments: { id: string; name: string }[];
  segmentId: string;
  setSegmentId: (v: string) => void;
  products: { id: string; name: string }[];
  productId: string;
  setProductId: (v: string) => void;
  onManageSegments: () => void;
}

export function ContactHeader({
  totalCount,
  search,
  onSearchChange,
  onNewContact,
  onImport,
  filterOptions,
  currentFilter,
  onFilterChange,
  isFilterModalOpen,
  setIsFilterModalOpen,
  sort,
  setSort,
  sortOrder,
  setSortOrder,
  pageSize,
  setPageSize,
  segments,
  segmentId,
  setSegmentId,
  products,
  productId,
  setProductId,
  onManageSegments,
}: ContactHeaderProps) {
  return (
    <>
      {/* Toolbar — single row: search · filters · actions (mirrors MessageLogHeader) */}
      <div className="flex items-center gap-2 p-3 px-5 border-b border-[#E5E7EB] bg-white shrink-0 flex-wrap">
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

        <div className="w-[1px] h-[18px] bg-[#E5E7EB] shrink-0 mx-1"></div>

        {/* Product filter */}
        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          title="Filtrer par produit"
          className="h-[34px] max-w-[180px] rounded-full border border-[#E5E7EB] bg-white px-3 text-[12px] text-[#0D2137] outline-none transition-colors focus:border-[#2E8FAD]"
        >
          <option value="all">Tous les produits</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <div className="w-[1px] h-[18px] bg-[#E5E7EB] shrink-0 mx-1"></div>

        {/* Status filter pills */}
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            className={`text-[12px] px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
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

        {/* Right cluster: count + actions */}
        <div className="ml-auto flex gap-2 items-center">
          <span className="text-[12px] text-[#8BAFC0] flex items-center mr-1">
            {totalCount.toLocaleString("fr")} contacts
          </span>

          <button
            onClick={onManageSegments}
            className="text-[12px] font-normal px-3 py-[5px] rounded-full bg-white text-[#0D2137] border border-[#E5E7EB] cursor-pointer transition-colors hover:bg-[#F0F2F4] whitespace-nowrap inline-flex items-center gap-1.5"
          >
            <Users size={12} strokeWidth={1.5} />
            Segments
          </button>

          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="text-[12px] font-normal px-3 py-[5px] rounded-full bg-white text-[#0D2137] border border-[#E5E7EB] cursor-pointer transition-colors hover:bg-[#F0F2F4] whitespace-nowrap inline-flex items-center gap-1.5"
          >
            <Filter size={12} strokeWidth={1.5} />
            Filtres
          </button>

          <button
            onClick={onImport}
            className="text-[12px] font-normal px-3 py-[5px] rounded-full bg-white text-[#0D2137] border border-[#E5E7EB] cursor-pointer transition-colors hover:bg-[#F0F2F4] whitespace-nowrap inline-flex items-center gap-1.5"
          >
            <Download size={12} strokeWidth={1.5} />
            Importer CSV
          </button>

          <button
            onClick={onNewContact}
            className="text-[12px] font-medium px-3.5 py-[5px] rounded-full bg-[#E8541A] text-white border-none cursor-pointer transition-colors hover:bg-[#D44814] whitespace-nowrap inline-flex items-center gap-1.5"
          >
            <UserPlus size={12} strokeWidth={2} />
            Nouveau contact
          </button>
        </div>
      </div>

      {/* Advanced filters modal — segment · sort · order · page size */}
      <Modal
        open={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Filtres avancés"
        subtitle="Affiner la liste des contacts"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-[12.5px] font-medium text-[#0D2137] mb-1.5">
              Segment
            </label>
            <select
              value={segmentId}
              onChange={(e) => setSegmentId(e.target.value)}
              className="w-full text-[13px] px-3 py-2 border border-[#E5E7EB] rounded-lg bg-white text-[#0D2137] outline-none focus:border-[#2E8FAD] transition-colors"
            >
              <option value="all">Tous les segments</option>
              {segments.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12.5px] font-medium text-[#0D2137] mb-1.5">
                Trier par
              </label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full text-[13px] px-3 py-2 border border-[#E5E7EB] rounded-lg bg-white text-[#0D2137] outline-none focus:border-[#2E8FAD] transition-colors"
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
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full text-[13px] px-3 py-2 border border-[#E5E7EB] rounded-lg bg-white text-[#0D2137] outline-none focus:border-[#2E8FAD] transition-colors"
              >
                <option value="desc">Décroissant</option>
                <option value="asc">Croissant</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[12.5px] font-medium text-[#0D2137] mb-1.5">
              Éléments par page
            </label>
            <select
              value={pageSize.toString()}
              onChange={(e) => setPageSize(parseInt(e.target.value, 10))}
              className="w-full text-[13px] px-3 py-2 border border-[#E5E7EB] rounded-lg bg-white text-[#0D2137] outline-none focus:border-[#2E8FAD] transition-colors"
            >
              <option value="15">15</option>
              <option value="30">30</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      </Modal>
    </>
  );
}
