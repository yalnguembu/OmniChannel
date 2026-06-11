import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  postApiBlocklistSearchOptions,
  postApiBlocklistSearchQueryKey,
  postApiBlocklistMutation,
  deleteApiBlocklistByIdMutation,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  DataTable,
  Pagination,
  type Column,
} from "@/components/data-table/DataTable";
import { formatRelative } from "@/lib/date";
import type { BlocklistDto } from "@/shared/api/types";
import { SettingsSidebar } from "@/components/features/settings/SettingsSidebar";

export function BlocklistPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BlocklistDto | null>(null);
  const [blockType, setBlockType] = useState<"phone" | "email">("phone");
  const [value, setValue] = useState("");
  const [reason, setReason] = useState("");
  const pageSize = 20;

  const { data, isLoading } = useQuery({
    ...postApiBlocklistSearchOptions({ body: { pageNumber: page, pageSize } }),
    select: (res: any) => {
      const items = (res?.data?.items ?? []) as BlocklistDto[];
      return {
        items,
        total: (res?.data?.totalCount ?? items.length) as number,
      };
    },
  });

  const entries = data?.items ?? [];
  const total = data?.total ?? 0;

  const createMutation = useMutation({
    ...postApiBlocklistMutation(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: postApiBlocklistSearchQueryKey() });
      setModalOpen(false);
      toast.success("Entrée ajoutée");
    },
    onError: () => toast.error("Erreur"),
  });

  const deleteMutation = useMutation({
    ...deleteApiBlocklistByIdMutation(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: postApiBlocklistSearchQueryKey() });
      setDeleteTarget(null);
      toast.success("Entrée retirée");
    },
    onError: () => toast.error("Erreur"),
  });

  const columns: Column<BlocklistDto>[] = [
    {
      key: "blockType",
      label: "Type",
      width: "100px",
      render: (b) => (
        <Badge variant={b.blockType === "phone" ? "info" : "accent"}>
          {b.blockType.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: "value",
      label: "Valeur",
      render: (b) => (
        <span className="font-mono text-[12.5px] text-[#0D2137]">
          {b.value}
        </span>
      ),
    },
    {
      key: "reason",
      label: "Raison",
      render: (b) => (
        <span className="text-[12.5px] text-[#4A7A94]">{b.reason ?? "—"}</span>
      ),
    },
    {
      key: "createdAt",
      label: "Ajouté",
      width: "130px",
      render: (b) => (
        <span className="text-[#8BAFC0] text-[12px]">
          {formatRelative(b.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      width: "80px",
      render: (b) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setDeleteTarget(b);
          }}
          className="w-7 h-7 rounded-[6px] flex items-center justify-center text-[#8BAFC0] hover:bg-[#FEE2E2] hover:text-[#DC2626] transition-all cursor-pointer"
        >
          <Trash2 size={13} />
        </button>
      ),
    },
  ];

  return (
    <div className="flex h-screen bg-white">
      <SettingsSidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-7">
          <h1 className="text-[20px] font-semibold text-[#0D2137] tracking-tight mb-2">
            Blocklist
          </h1>
          <p className="text-[12.5px] text-[#4A7A94] mb-6">
            Gérez les numéros de téléphone et emails bloqués
          </p>

          <div className="flex items-center justify-between mb-5">
        <p className="text-[13px] text-[#4A7A94]">
          {total} entrée{total !== 1 ? "s" : ""} bloquée{total !== 1 ? "s" : ""}
        </p>
        <Button
          variant="primary"
          onClick={() => {
            setModalOpen(true);
            setValue("");
            setReason("");
          }}
        >
          <Plus size={13} />
          Ajouter
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={entries}
        loading={isLoading}
        getRowId={(b) => b.id}
        emptyTitle="Blocklist vide"
        emptyDescription="Aucun numéro ou email bloqué"
      />
      <Pagination
        total={total}
        pageSize={pageSize}
        page={page}
        onChange={setPage}
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Ajouter à la blocklist"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={() =>
                createMutation.mutate({
                  body: {
                    blockType,
                    value,
                    reason,
                  } as any,
                })
              }
              loading={createMutation.isPending}
            >
              Ajouter
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Select
            label="Type"
            value={blockType}
            onChange={(e) => setBlockType(e.target.value as "phone" | "email")}
            options={[
              { value: "phone", label: "Numéro de téléphone" },
              { value: "email", label: "Adresse email" },
            ]}
          />
          <Input
            label="Valeur *"
            placeholder={
              blockType === "phone" ? "+224 620 000 000" : "email@example.com"
            }
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <Select
            label="Raison"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            options={[
              { value: "", label: "— Sélectionner —" },
              { value: "Désabonnement", label: "Désabonnement" },
              { value: "Rebond permanent", label: "Rebond permanent" },
              { value: "Numéro invalide", label: "Numéro invalide" },
              { value: "Blocage manuel", label: "Blocage manuel" },
            ]}
          />
        </div>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Retirer de la blocklist"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={() =>
                deleteTarget &&
                deleteMutation.mutate({ path: { id: deleteTarget.id } })
              }
              loading={deleteMutation.isPending}
            >
              Retirer
            </Button>
          </>
        }
      >
        <p className="text-[13px] text-[#0D2137]">
          Retirer <strong className="font-mono">{deleteTarget?.value}</strong>{" "}
          de la blocklist ?
        </p>
      </Modal>
        </div>
      </div>
    </div>
  );
}
