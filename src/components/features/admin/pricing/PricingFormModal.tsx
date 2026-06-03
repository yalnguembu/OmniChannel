import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { PricingDto } from "@/shared/api/generated/types.gen";

const schema = z.object({
  channelCode: z.string().min(1, "Canal requis"),
  providerCode: z.string().optional(),
  unitPrice: z.coerce.number().min(0),
  setupFee: z.coerce.number().min(0).optional(),
});
type FormValues = z.infer<typeof schema>;

interface PricingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editing: PricingDto | null;
  onSubmit: (data: Partial<PricingDto>) => void;
  isPending: boolean;
}

export function PricingFormModal({
  isOpen,
  onClose,
  editing,
  onSubmit,
  isPending,
}: PricingFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { channelCode: "", unitPrice: 0 },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        channelCode: editing?.channelId ?? "",
        providerCode: editing?.providerId ?? "",
        unitPrice: editing?.unitPrice ?? 0,
        setupFee: editing?.platformFee ?? undefined,
      });
    }
  }, [isOpen, editing, reset]);

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={editing ? "Modifier le tarif" : "Nouveau tarif"}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit((d) =>
              onSubmit({
                channelId: d.channelCode,
                providerId: d.providerCode || undefined,
                unitPrice: d.unitPrice,
                platformFee: d.setupFee,
              }),
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
          label="Code canal *"
          error={errors.channelCode?.message}
          {...register("channelCode")}
          placeholder="ex : SMS"
        />
        <Input
          label="Code provider"
          {...register("providerCode")}
          placeholder="ex : TWILIO (optionnel)"
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Prix unitaire (XAF) *"
            type="number"
            error={errors.unitPrice?.message}
            {...register("unitPrice")}
          />
          <Input label="Frais setup" type="number" {...register("setupFee")} />
        </div>
      </div>
    </Modal>
  );
}
