import { Edit } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Can } from "@/security/components/Can";
import { ACTION } from "@/security/enums";
import { DataTable, type Column } from "@/components/data-table/DataTable";
import type { SettingDto } from "@/shared/api/generated/types.gen";
import { useAdminSettingsViewModel } from "@/hooks/admin/useAdminSettingsViewModel";
import { SettingFormModal } from "./SettingFormModal";

type Vm = ReturnType<typeof useAdminSettingsViewModel>;

interface SettingsSectionProps {
  vm: Vm;
}

export function SettingsSection({ vm }: SettingsSectionProps) {
  const settingCols: Column<SettingDto>[] = [
    {
      key: "key",
      label: "Clé",
      render: (s) => (
        <span className="font-mono text-[12px] text-[#2E8FAD]">{s.key}</span>
      ),
    },
    {
      key: "value",
      label: "Valeur",
      render: (s) => (
        <span className="font-mono text-[12px] truncate max-w-[260px] block">
          {s.isEncrypted ? "••••••••" : (s.value ?? "—")}
        </span>
      ),
    },
    {
      key: "category",
      label: "Catégorie",
      width: "120px",
      render: (s) => (
        <span className="text-[12.5px] text-[#4A7A94]">
          {s.category ?? "—"}
        </span>
      ),
    },
    {
      key: "flags",
      label: "",
      width: "120px",
      render: (s) => (
        <div className="flex gap-1">
          {s.isReadOnly && <Badge variant="warning">Lecture seule</Badge>}
          {s.isEncrypted && <Badge variant="neutral">Chiffré</Badge>}
        </div>
      ),
    },
    {
      key: "actions",
      label: "",
      width: "70px",
      render: (s) =>
        !s.isReadOnly ? (
          <Can perform={ACTION.SETTING_WRITE}>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                vm.handleOpenSettingEdit(s);
              }}
            >
              <Edit size={12} />
            </Button>
          </Can>
        ) : null,
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-[13px] text-[#4A7A94]">
          {vm.settings.length} paramètres
        </p>
      </div>
      <DataTable
        columns={settingCols}
        data={vm.settings}
        loading={vm.isLoadingSettings}
        getRowId={(s) => s.id ?? ""}
        emptyTitle="Aucun paramètre"
      />

      <SettingFormModal
        isOpen={vm.modal === "setting"}
        onClose={vm.handleCloseModal}
        editing={vm.editItem}
        onSubmit={vm.handleSubmitSetting}
        isPending={vm.isSettingPending}
      />
    </div>
  );
}
