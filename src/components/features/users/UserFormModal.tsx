import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Toggle } from "@/components/ui/Toggle";
import { getApiUserProfileDropdownOptions } from "@/shared/api/generated/@tanstack/react-query.gen";
import type { UserType, UserStatus } from "@/shared/api/generated/types.gen";
import type { UserFormData } from "@/hooks/useUsersViewModel";
import { USER_TYPE } from "@/lib/auth";

const schema = z.object({
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  email: z.string().email("Email invalide"),
  phoneNumber: z.string().optional(),
  userType: z.string().optional(),
  profileId: z.string().optional(),
  initialPassword: z.string().optional(),
  forcePasswordChange: z.boolean().default(true),
  initialStatus: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => void;
  isPending: boolean;
  types: UserType[];
  statuses: UserStatus[];
  scope: "company" | "system";
}

export function UserFormModal({
  isOpen,
  onClose,
  onSubmit,
  isPending,
  types,
  statuses,
  scope,
}: UserFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
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
        userType:
          types[0]?.code ??
          (scope === "company"
            ? USER_TYPE.COMPANY_USER
            : USER_TYPE.SYSTEM_USER),
        profileId: profiles[0]?.id ?? "",
        initialPassword: "",
        forcePasswordChange: true,
        initialStatus: "",
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, types, scope, reset]);

  const forcePasswordChange = watch("forcePasswordChange");

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

        {/* Type d'utilisateur — scope company uniquement : CreateSystemUserRequest
            n'accepte pas de userType (porté par le profil côté système). */}
        {scope === "company" && types.length > 0 && (
          <Select
            label="Type d'utilisateur"
            {...register("userType")}
            options={types.map((t) => ({
              value: t.code ?? "",
              label: t.displayName ?? t.code ?? "",
            }))}
          />
        )}

        {/* Statut initial — scope company uniquement (CreateCompanyUserRequest) */}
        {scope === "company" && statuses.length > 0 && (
          <Select
            label="Statut initial"
            {...register("initialStatus")}
            options={[
              { value: "", label: "Par défaut" },
              ...statuses.map((s) => ({
                value: s.code ?? "",
                label: s.displayName ?? s.code ?? "",
              })),
            ]}
          />
        )}

        {/* Mot de passe initial (optionnel) */}
        <Input
          label="Mot de passe initial"
          type="password"
          {...register("initialPassword")}
          placeholder="Laisser vide pour envoyer une invitation"
          hint="Si renseigné, l'utilisateur recevra ce mot de passe au lieu d'une invitation."
        />

        <div className="flex items-center justify-between p-4 bg-[#F7F8F9] border border-[#E5E7EB] rounded-md">
          <div>
            <p className="text-[13px] font-medium text-[#0D2137]">
              Forcer le changement de mot de passe
            </p>
            <p className="text-[12px] text-[#8BAFC0] mt-0.5">
              À la première connexion
            </p>
          </div>
          <Toggle
            checked={forcePasswordChange}
            onChange={(v) => setValue("forcePasswordChange", v)}
          />
        </div>
      </div>
    </Modal>
  );
}
