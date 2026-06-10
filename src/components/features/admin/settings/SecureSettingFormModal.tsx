import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import type { SearchSecureSettingResponse } from "@/shared/api/generated/types.gen";

const secureSettingSchema = z.object({
  systemName: z.string().min(1, "Nom système requis"),
  description: z.string().optional(),
  value: z.string().min(1, "Valeur requise"),
  salt: z.string().optional(),
  isActive: z.boolean().optional(),
});

type FormValues = z.infer<typeof secureSettingSchema>;

interface SecureSettingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editing: SearchSecureSettingResponse | null;
  onSubmit: (data: {
    systemName: string;
    description?: string;
    value: string;
    salt?: string;
    isActive?: boolean;
  }) => void;
  isPending: boolean;
}

export function SecureSettingFormModal({
  isOpen,
  onClose,
  editing,
  onSubmit,
  isPending,
}: SecureSettingFormModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(secureSettingSchema),
  });

  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsActive(true);
      reset({
        systemName: editing?.systemName ?? "",
        description: editing?.description ?? "",
        value: editing?.value ?? "",
        salt: editing?.salt ?? "",
        isActive: true,
      });
    }
  }, [isOpen, editing, reset]);

  const handleFormSubmit = (formData: FormValues) => {
    onSubmit({
      ...formData,
      isActive,
    });
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={editing ? `Modifier — ${editing.systemName}` : "Nouveau paramètre sécurisé"}
      subtitle="Paramètre système chiffré"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit(handleFormSubmit)}
            loading={isPending}
          >
            {editing ? "Enregistrer" : "Créer"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          label="Nom système *"
          error={errors.systemName?.message}
          {...register("systemName")}
          placeholder="ex : API_KEY_PRODUCTION"
          required
          disabled={editing?.systemName !== undefined}
        />

        <Input
          label="Description"
          {...register("description")}
          placeholder="Description du paramètre sécurisé"
        />

        <Input
          label="Valeur *"
          error={errors.value?.message}
          type="password"
          {...register("value")}
          placeholder="Valeur confidentielle"
          required
        />

        <Input
          label="Salt (Sel)"
          {...register("salt")}
          placeholder="Salt pour le chiffrement"
        />

        <div className="flex items-center justify-between p-3.5 bg-[#F7F8F9] border border-[#E5E7EB] rounded-md">
          <div className="flex flex-col gap-1">
            <p className="text-[13px] font-medium text-[#0D2137]">Actif</p>
            <p className="text-[11px] text-[#8BAFC0]">Paramètre disponible pour utilisation</p>
          </div>
          <Toggle checked={isActive} onChange={setIsActive} />
        </div>

        <div className="bg-[#FEF3C7] border border-[#FCD34D] rounded-md p-3">
          <p className="text-[12px] text-[#92400E]">
            <strong>⚠️ Information sécurisée:</strong> Cette valeur sera chiffrée et ne sera jamais affichée en clair après création.
          </p>
        </div>
      </div>
    </Modal>
  );
}
