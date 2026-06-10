import { Plus, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Can } from "@/security/components/Can";
import { ACTION } from "@/security/enums";
import { DataTable, type Column } from "@/components/data-table/DataTable";
import type { SearchUserProfileResponse } from "@/shared/api/generated/types.gen";
import { useAdminSettingsViewModel } from "@/hooks/admin/useAdminSettingsViewModel";
import { ProfileFormModal } from "./ProfileFormModal";

type Vm = ReturnType<typeof useAdminSettingsViewModel>;

export function ProfilesSection({ vm }: { vm: Vm }) {
  const cols: Column<SearchUserProfileResponse>[] = [
    {
      key: "name",
      label: "Profil",
      render: (p) => (
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-[#0D2137]">
            {p.name}
          </span>
          {p.isSystemProfile && <Badge variant="info">Système</Badge>}
        </div>
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (p) => (
        <span className="text-[12.5px] text-[#4A7A94]">
          {p.description ?? "—"}
        </span>
      ),
    },
    {
      key: "isActive",
      label: "Statut",
      width: "100px",
      render: (p) => (
        <Badge variant={p.isActive ? "success" : "neutral"} dot>
          {p.isActive ? "Actif" : "Inactif"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "",
      width: "110px",
      render: (p) => (
        <div className="flex gap-1">
          <Can perform={ACTION.USERPROFILE_EDIT}>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                vm.handleOpenProfileEdit(p);
              }}
            >
              <Edit size={12} />
            </Button>
          </Can>
          {!p.isSystemProfile && (
            <Can perform={ACTION.USERPROFILE_DELETE}>
              <Button
                size="sm"
                variant="danger"
                onClick={(e) => {
                  e.stopPropagation();
                  vm.handleDeleteProfile(p.id ?? "");
                }}
                loading={vm.isProfileDeletePending}
              >
                <Trash2 size={12} />
              </Button>
            </Can>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-[13px] text-[#4A7A94]">{vm.profiles.length} profils</p>
        <Can perform={ACTION.USERPROFILE_WRITE}>
          <Button
            variant="primary"
            size="sm"
            onClick={vm.handleOpenProfileCreate}
          >
            <Plus size={13} />
            Nouveau profil
          </Button>
        </Can>
      </div>
      <DataTable
        columns={cols}
        data={vm.profiles}
        loading={vm.isLoadingProfiles}
        getRowId={(p) => p.id ?? ""}
        emptyTitle="Aucun profil"
      />

      <ProfileFormModal
        isOpen={vm.modal === "profile"}
        onClose={vm.handleCloseModal}
        editing={vm.editItem}
        onSubmit={vm.handleSubmitProfile}
        isPending={vm.isProfilePending}
        active={vm.profileActive}
        onActiveChange={vm.setProfileActive}
      />
    </div>
  );
}
