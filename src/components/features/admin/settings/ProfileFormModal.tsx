import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { PermissionsMapper } from "./PermissionsMapper";
import type {
  CreateUserProfileRequest,
  SearchUserProfileResponse,
} from "@/shared/api/generated/types.gen";

const schema = z.object({
  name: z.string().min(1, "Nom requis"),
  description: z.string().optional(),
  permissions: z.string().optional(),
  isSystemProfile: z.boolean().optional(),
  isActive: z.boolean().optional(),
});
type FormValues = z.infer<typeof schema>;

interface ProfileFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editing: SearchUserProfileResponse | null;
  onSubmit: (data: CreateUserProfileRequest) => void;
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
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSystemProfile, setIsSystemProfile] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const permissionsArray = editing?.permissions
        ? editing.permissions
            .split(",")
            .map((p) => p.trim())
            .filter((p) => p.length > 0)
        : [];

      setSelectedPermissions(permissionsArray);
      setIsSystemProfile(editing?.isSystemProfile ?? false);
      reset({
        name: editing?.name ?? "",
        description: editing?.description ?? "",
        permissions: editing?.permissions ?? "",
        isSystemProfile: editing?.isSystemProfile ?? false,
        isActive: editing?.isActive ?? false,
      });
    }
  }, [isOpen, editing, reset]);

  const handleSubmitForm = (data: FormValues) => {
    const permissionsStr = selectedPermissions.join(",");
    onSubmit({
      ...data,
      permissions: permissionsStr,
      isSystemProfile,
    } as CreateUserProfileRequest);
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={editing ? `Modifier — ${editing.name}` : "Nouveau profil"}
      subtitle="Profil utilisateur système"
      size="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit(handleSubmitForm)}
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
          placeholder="ex : Administrateur"
        />
        <div className="grid lg:grid-cols-3 gap-x-4 items-end">
          <Input
            label="Description"
            {...register("description")}
            placeholder="Rôle et responsabilités"
          />
          <div className="flex items-center justify-between px-3.5 py-2.5 h-min bg-[#F7F8F9] border border-[#E5E7EB] rounded-md">
            <p className="text-[13px] font-medium text-[#0D2137]">Actif</p>
            <Toggle checked={active} onChange={onActiveChange} />
          </div>
          <div className="flex items-center justify-between px-3.5 py-2.5 h-min bg-[#F7F8F9] border border-[#E5E7EB] rounded-md">
            <p className="text-[13px] font-medium text-[#0D2137]">System</p>
            <Toggle checked={isSystemProfile} onChange={setIsSystemProfile} />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[12.5px] font-medium text-[#0D2137]">
            Permissions
          </label>
          <PermissionsMapper
            selectedPermissions={selectedPermissions}
            onChange={setSelectedPermissions}
          />
        </div>
      </div>
    </Modal>
  );
}
