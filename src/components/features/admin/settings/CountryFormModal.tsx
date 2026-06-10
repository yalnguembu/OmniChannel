import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import type {
  CreateCountryRequest,
  SearchCountryResponse,
} from "@/shared/api/generated/types.gen";

const schema = z.object({
  name: z.string().min(1, "Nom requis"),
  code: z.string().min(1, "Code requis"),
});
type FormValues = z.infer<typeof schema>;

interface CountryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editing: SearchCountryResponse | null;
  onSubmit: (data: CreateCountryRequest) => void;
  isPending: boolean;
  active: boolean;
  onActiveChange: (v: boolean) => void;
}

export function CountryFormModal({
  isOpen,
  onClose,
  editing,
  onSubmit,
  isPending,
  active,
  onActiveChange,
}: CountryFormModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (isOpen) reset({ name: editing?.name ?? "", code: editing?.code ?? "" });
  }, [isOpen, editing, reset]);

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={editing ? `Modifier — ${editing.name}` : "Nouveau pays"}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit((d) => onSubmit(d satisfies CreateCountryRequest))}
            loading={isPending}
          >
            {editing ? "Enregistrer" : "Créer"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input label="Nom *" error={errors.name?.message} {...register("name")} placeholder="ex : Guinée" />
        <Input label="Code *" error={errors.code?.message} {...register("code")} placeholder="ex : GN" />
        <div className="flex items-center justify-between p-3.5 bg-[#F7F8F9] border border-[#E5E7EB] rounded-md">
          <p className="text-[13px] font-medium text-[#0D2137]">Actif</p>
          <Toggle checked={active} onChange={onActiveChange} />
        </div>
      </div>
    </Modal>
  );
}
