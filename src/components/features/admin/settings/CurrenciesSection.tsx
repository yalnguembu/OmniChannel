import { Plus, Edit } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Can } from "@/security/components/Can";
import { ACTION } from "@/security/enums";
import { DataTable, type Column } from "@/components/data-table/DataTable";
import type { CurrencyDto } from "@/shared/api/generated/types.gen";
import { useAdminSettingsViewModel } from "@/hooks/admin/useAdminSettingsViewModel";
import { CurrencyFormModal } from "./CurrencyFormModal";

type Vm = ReturnType<typeof useAdminSettingsViewModel>;

export function CurrenciesSection({ vm }: { vm: Vm }) {
  const cols: Column<CurrencyDto>[] = [
    {
      key: "name",
      label: "Devise",
      render: (c) => (
        <span className="text-[13px] font-medium text-[#0D2137]">{c.name}</span>
      ),
    },
    {
      key: "code",
      label: "Code",
      width: "90px",
      render: (c) => (
        <span className="font-mono text-[12px] text-[#4A7A94]">{c.code}</span>
      ),
    },
    {
      key: "symbol",
      label: "Symbole",
      width: "90px",
      render: (c) => <span className="text-[12.5px]">{c.symbol ?? "—"}</span>,
    },
    {
      key: "exchangeRate",
      label: "Taux",
      width: "110px",
      render: (c) => (
        <span className="font-mono text-[12px] text-[#4A7A94]">
          {c.exchangeRate ?? "—"}
        </span>
      ),
    },
    {
      key: "isActive",
      label: "Statut",
      width: "100px",
      render: (c) => (
        <Badge variant={c.isActive ? "success" : "neutral"} dot>
          {c.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "",
      width: "70px",
      render: (c) => (
        <Can perform={ACTION.SETTING_WRITE}>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              vm.handleOpenCurrencyEdit(c);
            }}
          >
            <Edit size={12} />
          </Button>
        </Can>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-[13px] text-[#4A7A94]">
          {vm.currencies.length} devises
        </p>
        <Can perform={ACTION.SETTING_WRITE}>
          <Button
            variant="primary"
            size="sm"
            onClick={vm.handleOpenCurrencyCreate}
          >
            <Plus size={13} />
            Nouvelle devise
          </Button>
        </Can>
      </div>
      <DataTable
        columns={cols}
        data={vm.currencies}
        loading={vm.isLoadingCurrencies}
        getRowId={(c) => c.id ?? ""}
        emptyTitle="Aucune devise"
      />

      <CurrencyFormModal
        isOpen={vm.modal === "currency"}
        onClose={vm.handleCloseModal}
        editing={vm.editItem}
        onSubmit={vm.handleSubmitCurrency}
        isPending={vm.isCurrencyPending}
        active={vm.currencyActive}
        onActiveChange={vm.setCurrencyActive}
      />
    </div>
  );
}
