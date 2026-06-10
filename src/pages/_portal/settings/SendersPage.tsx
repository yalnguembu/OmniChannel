import { useState } from "react";
import { useForm } from "react-hook-form";
import { Wifi, Plus, Pencil, Trash2, Send } from "lucide-react";
import { SettingsSidebar } from "@/components/features/settings/SettingsSidebar";
import { useSenderViewModel } from "@/hooks/useSenderViewModel";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { PageLoader } from "@/components/feedback/PageLoader";
import { EmptyState } from "@/components/feedback/EmptyState";
import type { SearchSenderResponse } from "@/shared/api/generated/types.gen";

const STATUS_BADGE: Record<string, "success" | "warning" | "error" | "neutral"> = {
  active: "success",
  inactive: "neutral",
  pending: "warning",
  rejected: "error",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Actif",
  inactive: "Inactif",
  pending: "En attente",
  rejected: "Rejeté",
};

function SenderRow({
  sender,
  onEdit,
  onDelete,
}: {
  sender: SearchSenderResponse;
  onEdit: (s: SearchSenderResponse) => void;
  onDelete: (s: SearchSenderResponse) => void;
}) {
  const status = (sender.status || "inactive").toLowerCase();
  return (
    <tr className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#E8F4F8] flex items-center justify-center flex-shrink-0">
            <Send size={12} className="text-[#2E8FAD]" />
          </div>
          <div>
            <p className="text-[13px] font-medium text-[#0D2137]">
              {sender.address || "—"}
            </p>
            {sender.displayName && (
              <p className="text-[11.5px] text-[#8BAFC0]">{sender.displayName}</p>
            )}
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5 text-[12.5px] text-[#4A7A94]">
        {sender.externalId || "—"}
      </td>
      <td className="px-5 py-3.5">
        <Badge variant={STATUS_BADGE[status] || "default"}>
          {STATUS_LABELS[status] || status}
        </Badge>
      </td>
      <td className="px-5 py-3.5 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => onEdit(sender)}
            className="p-1.5 text-[#8BAFC0] hover:text-[#1B5E82] hover:bg-[#E8F4F8] rounded-md transition-colors"
            title="Modifier"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(sender)}
            className="p-1.5 text-[#8BAFC0] hover:text-[#DC2626] hover:bg-red-50 rounded-md transition-colors"
            title="Supprimer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

interface SenderFormValues {
  channelId: string;
  externalId: string;
  address: string;
  displayName: string;
  status: string;
}

function SenderModal({
  open,
  onClose,
  onSubmit,
  channels,
  editingSender,
  isLoading,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: SenderFormValues) => void;
  channels: Array<{ id: string; name: string }>;
  editingSender: SearchSenderResponse | null;
  isLoading: boolean;
}) {
  const { register, handleSubmit, reset, setValue, watch } =
    useForm<SenderFormValues>({
      defaultValues: {
        channelId: editingSender?.channelId || "",
        externalId: editingSender?.externalId || "",
        address: editingSender?.address || "",
        displayName: editingSender?.displayName || "",
        status: editingSender?.status || "active",
      },
    });

  // Reset when modal opens with new data
  useState(() => {
    reset({
      channelId: editingSender?.channelId || "",
      externalId: editingSender?.externalId || "",
      address: editingSender?.address || "",
      displayName: editingSender?.displayName || "",
      status: editingSender?.status || "active",
    });
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingSender ? "Modifier l'expéditeur" : "Nouvel expéditeur"}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="primary"
            loading={isLoading}
            onClick={handleSubmit(onSubmit)}
          >
            {editingSender ? "Enregistrer" : "Créer"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-[12px] font-medium text-[#4A7A94] mb-1.5">
            Canal
          </label>
          <Select
            value={watch("channelId")}
            onChange={(e) => setValue("channelId", e.target.value)}
          >
            <option value="">Sélectionner un canal</option>
            {channels.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </div>
        <Input
          label="Adresse expéditeur"
          placeholder="ex: +33612345678 ou MYBRAND"
          {...register("address")}
        />
        <Input
          label="Nom affiché"
          placeholder="ex: MonEntreprise"
          {...register("displayName")}
        />
        <Input
          label="ID externe (référence provider)"
          placeholder="ex: SID_xxxxxxxxxx"
          {...register("externalId")}
        />
        <div>
          <label className="block text-[12px] font-medium text-[#4A7A94] mb-1.5">
            Statut
          </label>
          <Select
            value={watch("status")}
            onChange={(e) => setValue("status", e.target.value)}
          >
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
            <option value="pending">En attente</option>
          </Select>
        </div>
      </div>
    </Modal>
  );
}

export function SendersPage() {
  const vm = useSenderViewModel();

  return (
    <div className="flex h-screen bg-white">
      <SettingsSidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-7">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-[20px] font-semibold text-[#0D2137] tracking-tight">
                Expéditeurs
              </h1>
              <p className="text-[12.5px] text-[#4A7A94] mt-1">
                Adresses et numéros expéditeurs enregistrés pour vos canaux
              </p>
            </div>
            <Button variant="primary" size="sm" onClick={vm.handleOpenCreate}>
              <Plus size={14} />
              Nouvel expéditeur
            </Button>
          </div>

          {/* Search */}
          <div className="mb-4">
            <Input
              placeholder="Rechercher par adresse ou nom…"
              value={vm.search}
              onChange={(e) => vm.handleSearch(e.target.value)}
              className="max-w-xs"
            />
          </div>

          {/* Table */}
          {vm.isLoading ? (
            <PageLoader />
          ) : vm.senders.length === 0 ? (
            <EmptyState
              icon={<Wifi size={32} />}
              title="Aucun expéditeur"
              description="Ajoutez des expéditeurs pour vos campagnes SMS et WhatsApp."
            />
          ) : (
            <div className="bg-white border border-[#E5E7EB] rounded-[14px] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                    <th className="px-5 py-3 text-left text-[11.5px] font-semibold text-[#8BAFC0] uppercase tracking-wide">
                      Adresse
                    </th>
                    <th className="px-5 py-3 text-left text-[11.5px] font-semibold text-[#8BAFC0] uppercase tracking-wide">
                      Réf. provider
                    </th>
                    <th className="px-5 py-3 text-left text-[11.5px] font-semibold text-[#8BAFC0] uppercase tracking-wide">
                      Statut
                    </th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {vm.senders.map((sender) => (
                    <SenderRow
                      key={sender.id}
                      sender={sender}
                      onEdit={vm.handleOpenEdit}
                      onDelete={vm.handleConfirmDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {vm.totalCount > 20 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-[12.5px] text-[#8BAFC0]">
                {vm.totalCount} expéditeur{vm.totalCount > 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={vm.page === 1}
                  onClick={() => vm.setPage(vm.page - 1)}
                >
                  Précédent
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={vm.senders.length < 20}
                  onClick={() => vm.setPage(vm.page + 1)}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit modal */}
      {vm.isModalOpen && (
        <SenderModal
          open={vm.isModalOpen}
          onClose={vm.handleCloseModal}
          onSubmit={vm.handleSubmit}
          channels={vm.channels}
          editingSender={vm.editingSender}
          isLoading={vm.isActionLoading}
        />
      )}

      {/* Delete confirmation */}
      <Modal
        open={!!vm.deleteTarget}
        onClose={vm.handleCancelDelete}
        title="Supprimer l'expéditeur"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={vm.handleCancelDelete}>
              Annuler
            </Button>
            <Button
              variant="danger"
              loading={vm.isActionLoading}
              onClick={vm.handleDelete}
            >
              Supprimer
            </Button>
          </>
        }
      >
        <p className="text-[13px] text-[#4A7A94]">
          Supprimer l'expéditeur{" "}
          <span className="font-medium text-[#0D2137]">
            {vm.deleteTarget?.address}
          </span>{" "}
          ? Cette action est irréversible.
        </p>
      </Modal>
    </div>
  );
}
