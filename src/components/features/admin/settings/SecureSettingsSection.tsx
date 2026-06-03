import { Lock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Can } from "@/security/components/Can";
import { ACTION } from "@/security/enums";
import { DataTable, type Column } from "@/components/data-table/DataTable";
import type { SearchSecureSettingResponse } from "@/shared/api/generated/types.gen";
import { useAdminSettingsViewModel } from "@/hooks/admin/useAdminSettingsViewModel";

type Vm = ReturnType<typeof useAdminSettingsViewModel>;

interface SecureSettingsSectionProps {
  vm: Vm;
}

export function SecureSettingsSection({ vm }: SecureSettingsSectionProps) {
  const secureCols: Column<SearchSecureSettingResponse>[] = [
    {
      key: "key",
      label: "System Name",
      render: (s) => (
        <span className="font-mono text-[12px] text-[#7C3AED]">
          {s.systemName}
        </span>
      ),
    },
    {
      key: "value",
      label: "Valeur",
      render: () => (
        <span className="font-mono text-[12px] text-[#8BAFC0]">
          ••••••••••••
        </span>
      ),
    },
    {
      key: "category",
      label: "Description",
      width: "130px",
      render: (s) => (
        <span className="text-[12.5px] text-[#4A7A94]">
          {s.description ?? "—"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      width: "70px",
      render: (s) => (
        <Can perform={ACTION.SECURESETTING_WRITE}>
          <Button
            size="sm"
            variant="danger"
            onClick={(e) => {
              e.stopPropagation();
              vm.handleDeleteSecure(s.id ?? "");
            }}
            loading={vm.isSecureDeletePending}
          >
            <Trash2 size={12} />
          </Button>
        </Can>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[13px] text-[#4A7A94]">
            {vm.secureSettings.length} paramètres sécurisés
          </p>
          <p className="text-[12px] text-[#8BAFC0] mt-0.5">
            Les valeurs sont chiffrées et masquées
          </p>
        </div>
      </div>
      <div className="bg-[#EDE9FE] border border-[#C4B5FD] rounded-[12px] p-4 mb-4 flex items-center gap-3">
        <Lock size={16} className="text-[#7C3AED] shrink-0" />
        <p className="text-[12.5px] text-[#7C3AED]">
          Les SecureSettings contiennent des clés API et secrets. Modifiable
          uniquement via l'interface serveur.
        </p>
      </div>
      <DataTable
        columns={secureCols}
        data={vm.secureSettings}
        loading={vm.isLoadingSecure}
        getRowId={(s) => s.id ?? ""}
        emptyTitle="Aucun paramètre sécurisé"
      />
    </div>
  );
}
