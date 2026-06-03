import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import type { ProviderDto } from "@/shared/api/generated/types.gen";

const schema = z.object({
  name: z.string().min(1, "Nom requis"),
  code: z.string().min(1, "Code requis"),
  baseUrl: z.string().optional(),
  documentationUrl: z.string().optional(),
  isGlobal: z.boolean().default(true),
});
type FormValues = z.infer<typeof schema>;

interface ProviderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editing: ProviderDto | null;
  onSubmit: (data: Partial<ProviderDto>) => void;
  isPending: boolean;
}

export function ProviderFormModal({
  isOpen,
  onClose,
  editing,
  onSubmit,
  isPending,
}: ProviderFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", code: "", baseUrl: "", documentationUrl: "", isGlobal: true },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: editing?.name ?? "",
        code: editing?.code ?? "",
        baseUrl: editing?.baseUrl ?? "",
        documentationUrl: editing?.documentationUrl ?? "",
        isGlobal: editing?.isGlobal ?? true,
      });
    }
  }, [isOpen, editing, reset]);

  const isGlobal = watch("isGlobal");

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={editing ? `Modifier — ${editing.name}` : "Nouveau provider"}
      subtitle={editing ? (editing.code ?? "") : "Configurez un provider de messagerie"}
      size="md"
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
            {editing ? "Enregistrer" : "Créer"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Nom *"
            error={errors.name?.message}
            {...register("name")}
            placeholder="ex : Twilio"
          />
          <Input
            label="Code *"
            error={errors.code?.message}
            {...register("code")}
            placeholder="ex : TWILIO"
          />
        </div>
        <Input
          label="URL de base"
          {...register("baseUrl")}
          placeholder="https://api.twilio.com"
        />
        <Input
          label="Documentation"
          {...register("documentationUrl")}
          placeholder="https://docs.twilio.com"
        />
        <div className="flex items-center justify-between p-4 bg-[#F7F8F9] border border-[#E5E7EB] rounded-[10px]">
          <div>
            <p className="text-[13px] font-medium text-[#0D2137]">
              Provider global
            </p>
            <p className="text-[12px] text-[#8BAFC0] mt-0.5">
              Disponible pour toutes les companies
            </p>
          </div>
          <Toggle
            checked={isGlobal}
            onChange={(v) => setValue("isGlobal", v)}
          />
        </div>
      </div>
    </Modal>
  );
}
