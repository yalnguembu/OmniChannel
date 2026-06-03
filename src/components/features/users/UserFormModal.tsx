import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { getApiUserProfileDropdownOptions } from "@/shared/api/generated/@tanstack/react-query.gen";
import type { UserType } from "@/shared/api/generated/types.gen";
import type { UserFormData } from "@/hooks/useUsersViewModel";

const schema = z.object({
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  email: z.string().email("Email invalide"),
  phoneNumber: z.string().optional(),
  userType: z.string().optional(),
  profileId: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => void;
  isPending: boolean;
  types: UserType[];
  scope: "company" | "system";
}

export function UserFormModal({
  isOpen,
  onClose,
  onSubmit,
  isPending,
  types,
  scope,
}: UserFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  // Fetch user profiles for the role/profile selector
  const { data: profileData } = useQuery({
    ...getApiUserProfileDropdownOptions(),
    select: (res: any) => (res?.data ?? []) as { id: string; name: string }[],
    enabled: isOpen,
  });
  const profiles = profileData ?? [];

  useEffect(() => {
    if (isOpen)
      reset({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        userType: types[0]?.code ?? (scope === "company" ? "company" : "system"),
        profileId: profiles[0]?.id ?? "",
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, types, scope, reset]);

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={
        scope === "company" ? "Inviter un membre" : "Nouvel utilisateur système"
      }
      subtitle="Un email d'invitation sera envoyé"
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
            Envoyer l'invitation
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Prénom *"
            error={errors.firstName?.message}
            {...register("firstName")}
            placeholder="Kofi"
          />
          <Input
            label="Nom *"
            error={errors.lastName?.message}
            {...register("lastName")}
            placeholder="Mensah"
          />
        </div>
        <Input
          label="Email *"
          type="email"
          error={errors.email?.message}
          {...register("email")}
          placeholder="kofi@example.com"
        />
        <Input
          label="Téléphone"
          {...register("phoneNumber")}
          placeholder="+224 620 000 000"
        />

        {/* Profil / Rôle — champ requis pour que profileId soit envoyé */}
        {profiles.length > 0 && (
          <Select
            label="Profil / Rôle"
            {...register("profileId")}
            options={[
              { value: "", label: "Aucun profil" },
              ...profiles.map((p) => ({ value: p.id, label: p.name })),
            ]}
          />
        )}

        {types.length > 0 && (
          <Select
            label="Type d'utilisateur"
            {...register("userType")}
            options={types.map((t) => ({
              value: t.code ?? "",
              label: t.displayName ?? t.code ?? "",
            }))}
          />
        )}
      </div>
    </Modal>
  );
}
