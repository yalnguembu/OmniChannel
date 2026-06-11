import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Toggle } from "@/components/ui/Toggle";
import type {
  CreateIntegrationRequest,
  SearchIntegrationResponse,
} from "@/shared/api/generated/types.gen";

const schema = z.object({
  name: z.string().min(1, "Nom requis").max(200),
  type: z.string().min(1, "Type requis").max(1000),
  syncDirection: z.string().max(1000).optional(),
  isActive: z.boolean().default(true),
  lastSyncAt: z.string().optional(),
  nextSyncAt: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

/** ISO string -> value accepted by <input type="datetime-local"> (YYYY-MM-DDTHH:mm). */
const toLocalInput = (iso?: string | null) => (iso ? iso.slice(0, 16) : "");
/** datetime-local value -> ISO string (or null when empty). */
const toIso = (local?: string) =>
  local ? new Date(local).toISOString() : null;

interface IntegrationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editing: SearchIntegrationResponse | null;
  companies: { id: string; name: string }[];
  onSubmit: (data: CreateIntegrationRequest) => void;
  isPending: boolean;
}

export function IntegrationFormModal({
  isOpen,
  onClose,
  editing,
  companies,
  onSubmit,
  isPending,
}: IntegrationFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      type: "",
      syncDirection: "",
      isActive: true,
      lastSyncAt: "",
      nextSyncAt: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: editing?.name ?? "",
        type: editing?.type ?? "",
        syncDirection: editing?.syncDirection ?? "",
        isActive: editing?.isActive ?? true,
        lastSyncAt: toLocalInput(editing?.lastSyncAt),
        nextSyncAt: toLocalInput(editing?.nextSyncAt),
      });
    }
  }, [isOpen, editing, reset]);

  const isActive = watch("isActive");

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={editing ? `Modifier — ${editing.name}` : "Nouvelle intégration"}
      subtitle={
        editing
          ? (editing.type ?? "")
          : "Connectez une source de données externe"
      }
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit((d) =>
              onSubmit({
                name: d.name,
                type: d.type,
                syncDirection: d.syncDirection || null,
                isActive: d.isActive,
                lastSyncAt: toIso(d.lastSyncAt),
                nextSyncAt: toIso(d.nextSyncAt),
              } satisfies CreateIntegrationRequest),
            )}
            loading={isPending}
          >
            {editing ? "Enregistrer" : "Créer"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          label="Nom *"
          error={errors.name?.message}
          {...register("name")}
          placeholder="ex : CRM Salesforce"
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Type *"
            error={errors.type?.message}
            {...register("type")}
            placeholder="ex : API, Webhook, FTP"
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-medium text-[#0D2137]">
              Direction de synchronisation
            </label>
            <Select {...register("syncDirection")}>
              <option value="">—</option>
              <option value="Inbound">Entrante</option>
              <option value="Outbound">Sortante</option>
              <option value="Bidirectional">Bidirectionnelle</option>
            </Select>
          </div>
        </div>
        <div className="flex items-center justify-between p-4 bg-[#F7F8F9] border border-[#E5E7EB] rounded-md">
          <div>
            <p className="text-[13px] font-medium text-[#0D2137]">Active</p>
            <p className="text-[12px] text-[#8BAFC0] mt-0.5">
              L'intégration est opérationnelle
            </p>
          </div>
          <Toggle
            checked={isActive}
            onChange={(v) => setValue("isActive", v)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Dernière synchronisation"
            type="datetime-local"
            error={errors.lastSyncAt?.message}
            {...register("lastSyncAt")}
          />
          <Input
            label="Prochaine synchronisation"
            type="datetime-local"
            error={errors.nextSyncAt?.message}
            {...register("nextSyncAt")}
          />
        </div>
      </div>
    </Modal>
  );
}
