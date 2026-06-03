import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import type { UserProfileDto } from "@/shared/api/generated/types.gen";

const schema = z.object({
  name: z.string().min(1, "Nom requis"),
  description: z.string().optional(),
  permissions: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

interface ProfileFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editing: UserProfileDto | null;
  onSubmit: (data: { name?: string; description?: string; permissions?: string }) => void;
  isPending: boolean;
  active: boolean;
  onActiveChange: (v: boolean) => void;
}

export function ProfileFormModal({
  isOpen,
  onClose,
  editing,
  onSubmit,
  isPending,
  active,
  onActiveChange,
}: ProfileFormModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (isOpen)
      reset({
        name: editing?.name ?? "",
        description: editing?.description ?? "",
        permissions: editing?.permissions ?? "",
      });
  }, [isOpen, editing, reset]);

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={editing ? `Modifier — ${editing.name}` : "Nouveau profil"}
      subtitle="Profil utilisateur système"
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
        <Input label="Nom *" error={errors.name?.message} {...register("name")} placeholder="ex : Administrateur" />
        <Input label="Description" {...register("description")} placeholder="Rôle et responsabilités" />
        <div>
          <label className="text-[12.5px] font-medium text-[#0D2137] mb-1.5 block">
            Permissions{" "}
            <span className="font-normal text-[#8BAFC0]">(séparées par des virgules)</span>
          </label>
          <textarea
            {...register("permissions")}
            rows={4}
            className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-[10px] text-[12px] font-mono outline-none resize-none focus:border-[#2E8FAD] focus:shadow-[0_0_0_3px_rgba(46,143,173,0.1)] text-[#0D2137] placeholder-[#8BAFC0]"
            placeholder="COMPANY_READ, USER_READ, ..."
          />
        </div>
        <div className="flex items-center justify-between p-3.5 bg-[#F7F8F9] border border-[#E5E7EB] rounded-[10px]">
          <p className="text-[13px] font-medium text-[#0D2137]">Actif</p>
          <Toggle checked={active} onChange={onActiveChange} />
        </div>
      </div>
    </Modal>
  );
}
