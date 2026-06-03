import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { SettingDto } from "@/shared/api/generated/types.gen";

const settingSchema = z.object({
  key: z.string().min(1),
  value: z.string().optional(),
  category: z.string().optional(),
  dataType: z.string().optional(),
});
type FormValues = z.infer<typeof settingSchema>;

interface SettingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editing: SettingDto | null;
  onSubmit: (data: Partial<SettingDto>) => void;
  isPending: boolean;
}

export function SettingFormModal({
  isOpen,
  onClose,
  editing,
  onSubmit,
  isPending,
}: SettingFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(settingSchema),
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        key: editing?.key ?? "",
        value: editing?.value ?? "",
        category: editing?.category ?? "",
        dataType: editing?.dataType ?? "",
      });
    }
  }, [isOpen, editing, reset]);

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={`Modifier — ${editing?.key}`}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit((d) => onSubmit(d))}
            loading={isPending}
          >
            Enregistrer
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input label="Clé" {...register("key")} disabled />
        <Input
          label="Valeur"
          {...register("value")}
          placeholder="Nouvelle valeur"
        />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Catégorie" {...register("category")} />
          <Input
            label="Type de données"
            {...register("dataType")}
            placeholder="string, number, boolean"
          />
        </div>
      </div>
    </Modal>
  );
}
