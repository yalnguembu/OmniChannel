import { Plus, Edit } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Can } from "@/security/components/Can";
import { ACTION } from "@/security/enums";
import { DataTable, type Column } from "@/components/data-table/DataTable";
import type { CountryDto } from "@/shared/api/generated/types.gen";
import { useAdminSettingsViewModel } from "@/hooks/admin/useAdminSettingsViewModel";
import { CountryFormModal } from "./CountryFormModal";

type Vm = ReturnType<typeof useAdminSettingsViewModel>;

export function CountriesSection({ vm }: { vm: Vm }) {
  const cols: Column<CountryDto>[] = [
    {
      key: "name",
      label: "Pays",
      render: (c) => (
        <span className="text-[13px] font-medium text-[#0D2137]">{c.name}</span>
      ),
    },
    {
      key: "code",
      label: "Code",
      width: "100px",
      render: (c) => (
        <span className="font-mono text-[12px] text-[#4A7A94]">{c.code}</span>
      ),
    },
    {
      key: "isActive",
      label: "Statut",
      width: "100px",
      render: (c) => (
        <Badge variant={c.isActive ? "success" : "neutral"} dot>
          {c.isActive ? "Actif" : "Inactif"}
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
              vm.handleOpenCountryEdit(c);
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
        <p className="text-[13px] text-[#4A7A94]">{vm.countries.length} pays</p>
        <Can perform={ACTION.SETTING_WRITE}>
          <Button variant="primary" size="sm" onClick={vm.handleOpenCountryCreate}>
            <Plus size={13} />
            Nouveau pays
          </Button>
        </Can>
      </div>
      <DataTable
        columns={cols}
        data={vm.countries}
        loading={vm.isLoadingCountries}
        getRowId={(c) => c.id ?? ""}
        emptyTitle="Aucun pays"
      />

      <CountryFormModal
        isOpen={vm.modal === "country"}
        onClose={vm.handleCloseModal}
        editing={vm.editItem}
        onSubmit={vm.handleSubmitCountry}
        isPending={vm.isCountryPending}
        active={vm.countryActive}
        onActiveChange={vm.setCountryActive}
      />
    </div>
  );
}
