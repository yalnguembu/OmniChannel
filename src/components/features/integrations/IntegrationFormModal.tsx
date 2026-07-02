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
});
type FormValues = z.infer<typeof schema>;

interface IntegrationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editing: SearchIntegrationResponse | null;
  onSubmit: (data: CreateIntegrationRequest) => void;
  isPending: boolean;
}

export function IntegrationFormModal({
  isOpen,
  onClose,
  editing,
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
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: editing?.name ?? "",
        type: editing?.type ?? "",
        syncDirection: editing?.syncDirection ?? "",
        isActive: editing?.isActive ?? true,
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
              <option value="Pull">Entrante</option>
              <option value="Push">Sortante</option>
              <option value="Sync">Synchrone</option>
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
      </div>
    </Modal>
  );
}
