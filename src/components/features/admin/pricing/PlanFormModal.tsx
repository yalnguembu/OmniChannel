import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import type {
  CreateSubscriptionPlanRequest,
  SearchSubscriptionPlanResponse,
} from "@/shared/api/generated/types.gen";

const schema = z.object({
  name: z.string().min(1, "Nom requis"),
  description: z.string().optional(),
  monthlyPrice: z.coerce.number().min(0),
  yearlyPrice: z.coerce.number().min(0).optional(),
  maxProducts: z.coerce.number().min(0).optional(),
  maxUsers: z.coerce.number().min(0).optional(),
  monthlyQuota: z.coerce.number().min(0).optional(),
  isActive: z.boolean().default(true),
});
type FormValues = z.infer<typeof schema>;

interface PlanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editing: SearchSubscriptionPlanResponse | null;
  onSubmit: (data: CreateSubscriptionPlanRequest) => void;
  isPending: boolean;
}

export function PlanFormModal({
  isOpen,
  onClose,
  editing,
  onSubmit,
  isPending,
}: PlanFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", monthlyPrice: 0, isActive: true },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: editing?.name ?? "",
        description: editing?.description ?? "",
        monthlyPrice: editing?.monthlyPrice ?? 0,
        yearlyPrice: editing?.yearlyPrice ?? undefined,
        maxProducts: editing?.maxProducts ?? undefined,
        maxUsers: editing?.maxUsers ?? undefined,
        monthlyQuota: editing?.monthlyQuota ?? undefined,
        isActive: editing?.isActive ?? true,
      });
    }
  }, [isOpen, editing, reset]);

  const isActive = watch("isActive");

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={editing ? `Modifier — ${editing.name}` : "Nouveau plan"}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit((d) =>
              onSubmit(d satisfies CreateSubscriptionPlanRequest),
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
          placeholder="ex : Growth"
        />
        <Input
          label="Description"
          {...register("description")}
          placeholder="Description du plan"
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Prix mensuel (XAF) *"
            type="number"
            error={errors.monthlyPrice?.message}
            {...register("monthlyPrice")}
          />
          <Input
            label="Prix annuel (XAF)"
            type="number"
            {...register("yearlyPrice")}
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Max produits"
            type="number"
            {...register("maxProducts")}
          />
          <Input label="Max users" type="number" {...register("maxUsers")} />
          <Input
            label="Quota messages"
            type="number"
            {...register("monthlyQuota")}
            placeholder="200000"
          />
        </div>
        <div className="flex items-center justify-between p-4 bg-[#F7F8F9] border border-[#E5E7EB] rounded-md">
          <div>
            <p className="text-[13px] font-medium text-[#0D2137]">Plan actif</p>
            <p className="text-[12px] text-[#8BAFC0] mt-0.5">
              Visible et disponible pour souscription
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
