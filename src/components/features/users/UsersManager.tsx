import { useState } from "react";
import { Plus, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { SearchInput } from "@/components/ui/SearchInput";
import {
  DataTable,
  Pagination,
  type Column,
} from "@/components/data-table/DataTable";
import { getInitials, avatarColor } from "@/lib/utils";
import { formatDate } from "@/lib/date";
import type { SearchUserResponse } from "@/shared/api/generated/types.gen";
import { useUsersViewModel, type UserScope } from "@/hooks/useUsersViewModel";
import { isSystemUser } from "@/lib/auth";
import { UserFormModal } from "./UserFormModal";
import { UserDetailModal } from "./UserDetailModal";

const statusVariant = (code?: string | null) => {
  const c = (code ?? "").toLowerCase();
  if (c === "active") return "success" as const;
  if (c === "suspended" || c === "locked") return "error" as const;
  if (c === "inactive" || c === "pending") return "warning" as const;
  return "neutral" as const;
};

export function UsersManager({
  scope,
  title,
  subtitle,
  companyId,
  embedded = false,
}: {
  scope: UserScope;
  title: string;
  subtitle?: string;
  /** When set, scopes the list + new users to a specific company (admin view). */
  companyId?: string;
  /** Compact heading for embedding inside a tab/card. */
  embedded?: boolean;
}) {
  const vm = useUsersViewModel(scope, { companyId });
  const [nextStatus, setNextStatus] = useState("");

  const statusLabelFor = (code?: string | null) =>
    vm.statuses.find((s) => s.code === code)?.displayName ?? code ?? "—";

  const columns: Column<SearchUserResponse>[] = [
    {
      key: "name",
      label: "Utilisateur",
      render: (u) => (
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold text-white shrink-0"
            style={{ background: avatarColor(u.firstName ?? "U") }}
          >
            {getInitials(u.firstName, u.lastName)}
          </div>
          <div>
            <p className="font-medium text-[13px] text-[#0D2137]">
              {u.firstName} {u.lastName}
            </p>
            <p className="text-[11.5px] text-[#8BAFC0]">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "userType",
      label: "Type",
      width: "120px",
      render: (u) => (
        <Badge variant={isSystemUser(u.userType) ? "purple" : "info"}>
          {u.userType ?? "—"}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Statut",
      width: "120px",
      render: (u) => (
        <Badge variant={statusVariant(u.status)} dot>
          {statusLabelFor(u.status)}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Rejoint le",
      width: "130px",
      render: (u) => (
        <span className="text-[#8BAFC0] text-[12px]">
          {formatDate(u.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      width: "120px",
      render: (u) => (
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            setNextStatus(u.status ?? "");
            vm.setStatusTarget(u);
          }}
        >
          <ShieldCheck size={12} />
          Statut
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-end justify-between mb-5">
        <div>
          {embedded ? (
            <h2 className="text-[15px] font-bold text-[#0D2137]">{title}</h2>
          ) : (
            <h1 className="text-[20px] font-semibold text-[#0D2137] tracking-tight">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-[12.5px] text-[#4A7A94] mt-1">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <SearchInput
            placeholder="Rechercher…"
            value={vm.search}
            onChange={(e) => vm.setSearch(e.target.value)}
            containerClassName="w-52"
          />
          <div className="w-40">
            <Select
              value={vm.statusFilter}
              onChange={(e) => vm.setStatusFilter(e.target.value)}
              options={[
                { value: "", label: "Tous les statuts" },
                ...vm.statuses.map((s) => ({
                  value: s.code ?? "",
                  label: s.displayName ?? s.code ?? "",
                })),
              ]}
            />
          </div>
          {vm.profiles.length > 0 && (
            <div className="w-40">
              <Select
                value={vm.profileFilter}
                onChange={(e) => vm.setProfileFilter(e.target.value)}
                options={[
                  { value: "", label: "Tous les profils" },
                  ...vm.profiles.map((p) => ({ value: p.id, label: p.name })),
                ]}
              />
            </div>
          )}
          <Button variant="primary" onClick={() => vm.setIsModalOpen(true)}>
            <Plus size={13} />
            {scope === "company" ? "Inviter un membre" : "Nouvel utilisateur"}
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={vm.users}
        loading={vm.isLoading}
        getRowId={(u) => u.id ?? ""}
        emptyTitle="Aucun utilisateur"
        onRowClick={(u) => vm.openDetail(u)}
      />
      <Pagination
        total={vm.total}
        pageSize={vm.pageSize}
        page={vm.page}
        onChange={vm.setPage}
      />

      <UserFormModal
        isOpen={vm.isModalOpen}
        onClose={() => vm.setIsModalOpen(false)}
        onSubmit={vm.handleCreate}
        isPending={vm.isActionPending}
        types={vm.types}
        statuses={vm.statuses}
        scope={scope}
      />

      <UserDetailModal
        isOpen={!!vm.selectedUser}
        onClose={vm.closeDetail}
        user={vm.detailUser}
        isLoading={vm.isDetailLoading}
        statuses={vm.statuses}
        onChangeStatus={vm.handleChangeStatus}
        isPending={vm.isActionPending}
      />

      {/* Status change modal (enum-driven) */}
      <Modal
        open={!!vm.statusTarget}
        onClose={() => vm.setStatusTarget(null)}
        title="Changer le statut"
        subtitle={
          vm.statusTarget
            ? `${vm.statusTarget.firstName} ${vm.statusTarget.lastName}`
            : ""
        }
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => vm.setStatusTarget(null)}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              loading={vm.isActionPending}
              disabled={!nextStatus}
              onClick={() =>
                vm.statusTarget?.id &&
                vm.handleChangeStatus(vm.statusTarget.id, nextStatus)
              }
            >
              Appliquer
            </Button>
          </>
        }
      >
        <Select
          label="Nouveau statut"
          value={nextStatus}
          onChange={(e) => setNextStatus(e.target.value)}
          options={[
            { value: "", label: "— Sélectionner —" },
            ...vm.statuses.map((s) => ({
              value: s.code ?? "",
              label: s.displayName ?? s.code ?? "",
            })),
          ]}
        />
      </Modal>
    </div>
  );
}
