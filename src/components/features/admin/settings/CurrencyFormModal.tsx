import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import type { CurrencyDto } from "@/shared/api/generated/types.gen";

const schema = z.object({
  name: z.string().min(1, "Nom requis"),
  code: z.string().min(1, "Code requis"),
  symbol: z.string().optional(),
  decimalPlaces: z.coerce.number().optional(),
  exchangeRate: z.coerce.number().optional(),
});
type FormValues = z.infer<typeof schema>;

interface CurrencyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editing: CurrencyDto | null;
  onSubmit: (data: Partial<CurrencyDto>) => void;
  isPending: boolean;
  active: boolean;
  onActiveChange: (v: boolean) => void;
}

export function CurrencyFormModal({
  isOpen,
  onClose,
  editing,
  onSubmit,
  isPending,
  active,
  onActiveChange,
}: CurrencyFormModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (isOpen)
      reset({
        name: editing?.name ?? "",
        code: editing?.code ?? "",
        symbol: editing?.symbol ?? "",
        decimalPlaces: editing?.decimalPlaces ?? 2,
        exchangeRate: editing?.exchangeRate ?? 1,
      });
  }, [isOpen, editing, reset]);

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={editing ? `Modifier — ${editing.name}` : "Nouvelle devise"}
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
            {editing ? "Enregistrer" : "Créer"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Nom *" error={errors.name?.message} {...register("name")} placeholder="ex : Franc guinéen" />
          <Input label="Code *" error={errors.code?.message} {...register("code")} placeholder="ex : GNF" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Input label="Symbole" {...register("symbol")} placeholder="FG" />
          <Input label="Décimales" type="number" {...register("decimalPlaces")} />
          <Input label="Taux" type="number" step="any" {...register("exchangeRate")} />
        </div>
        <div className="flex items-center justify-between p-3.5 bg-[#F7F8F9] border border-[#E5E7EB] rounded-[10px]">
          <p className="text-[13px] font-medium text-[#0D2137]">Active</p>
          <Toggle checked={active} onChange={onActiveChange} />
        </div>
      </div>
    </Modal>
  );
}
