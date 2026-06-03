import { Plus } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { StandardPageHeader } from "@/components/layout/StandardPageHeader";
import { StandardPageFilters } from "@/components/layout/StandardPageFilters";
import { ProductGrid } from "@/components/features/products/ProductGrid";
import { ProductWizard } from "@/components/features/products/ProductWizard";
import { ProductDeleteModal } from "@/components/features/products/ProductDeleteModal";
import { Pagination } from "@/components/data-table/DataTable";
import {
  useProductViewModel,
  type ProductFilterType,
} from "@/hooks/useProductViewModel";

const SORT_OPTIONS = [
  { value: "createdAt:desc", label: "Trier : Récent" },
  { value: "createdAt:asc", label: "Trier : Plus ancien" },
  { value: "name:asc", label: "Trier : Nom A→Z" },
  { value: "name:desc", label: "Trier : Nom Z→A" },
  { value: "updatedAt:desc", label: "Trier : Mis à jour" },
];

export default function ProductsPage() {
  const vm = useProductViewModel();

  const filterOptions: {
    value: ProductFilterType;
    label: string;
    count: number;
  }[] = [
    { value: "all", label: "Tous", count: vm.counts.all },
    { value: "active", label: "Actifs", count: vm.counts.active },
    { value: "paused", label: "En pause", count: vm.counts.paused },
    { value: "draft", label: "Brouillon", count: vm.counts.draft },
  ];

  const subtitleParts = [
    `${vm.counts.all} produit${vm.counts.all !== 1 ? "s" : ""}`,
    vm.counts.active
      ? `${vm.counts.active} actif${vm.counts.active !== 1 ? "s" : ""}`
      : null,
    vm.counts.paused ? `${vm.counts.paused} en pause` : null,
    vm.counts.draft
      ? `${vm.counts.draft} brouillon${vm.counts.draft !== 1 ? "s" : ""}`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="p-6 max-w-[1600px] mx-auto min-h-screen bg-[#F4F5F6]">
      <StandardPageHeader
        title="Mes produits"
        subtitle={subtitleParts}
        searchValue={vm.search}
        onSearchChange={vm.setSearch}
        searchPlaceholder="Rechercher un produit…"
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={vm.handleOpenCreate}
            className="rounded-full px-[18px] py-2 text-[12.5px] font-medium flex items-center gap-[6px] shadow-[0_3px_10px_rgba(232,84,26,0.25)] hover:shadow-[0_5px_16px_rgba(232,84,26,0.35)] hover:-translate-y-px transition-all"
          >
            <Plus size={13} />
            Nouveau produit
          </Button>
        }
      />

      <StandardPageFilters
        options={filterOptions}
        currentFilter={vm.filter}
        onFilterChange={vm.setFilter}
        totalFilteredCount={vm.totalCount}
        resultsLabel="produits"
        sortOptions={SORT_OPTIONS}
        currentSort={vm.currentSortValue}
        onSortChange={vm.handleSortChange}
      />

      <ProductGrid
        products={vm.products}
        isLoading={vm.isLoading}
        onEdit={vm.handleOpenEdit}
        onDelete={vm.setDeleteTarget}
        onCreateClick={vm.handleOpenCreate}
      />

      {/* Pagination */}
      {/* {vm.totalPages > 1 && ( */}
      <div className="mt-5">
        <Pagination
          total={vm.totalCount}
          pageSize={vm.pageSize}
          page={vm.page}
          onChange={vm.setPage}
        />
      </div>
      {/* )} */}

      <ProductWizard
        isOpen={vm.isWizardOpen}
        onClose={vm.handleCloseWizard}
        editingProduct={vm.editingProduct}
        onSubmit={vm.handleSubmit}
        isPending={vm.isActionPending}
      />

      <AnimatePresence>
        {vm.deleteTarget && (
          <ProductDeleteModal
            product={vm.deleteTarget}
            onClose={() => vm.setDeleteTarget(null)}
            onConfirm={vm.handleDelete}
            isPending={vm.isActionPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
