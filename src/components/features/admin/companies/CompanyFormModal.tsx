import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Toggle } from "@/components/ui/Toggle";
import type {
  CompanyDto,
  CreateCompanyRequest,
} from "@/shared/api/generated/types.gen";

const schema = z.object({
  name: z.string().min(1, "Nom requis").max(200),
  legalName: z.string().max(200).optional(),
  taxNumber: z.string().max(100).optional(),
  countryId: z.string().min(1, "Pays requis"),
  status: z.string().optional(),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  phone: z.string().max(50).optional(),
  website: z.string().max(200).optional(),
  address: z.string().max(300).optional(),
  city: z.string().max(120).optional(),
  postalCode: z.string().max(20).optional(),
  billingMode: z.string().optional(),
  timezone: z.string().max(80).optional(),
  defaultLanguage: z.string().max(20).optional(),
  isSandbox: z.boolean().default(false),
});
type FormValues = z.infer<typeof schema>;

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "pending", label: "En attente" },
  { value: "suspended", label: "Suspendue" },
  { value: "inactive", label: "Inactive" },
];

const BILLING_OPTIONS = [
  { value: "Prepaid", label: "Prépayé" },
  { value: "Postpaid", label: "Postpayé" },
];

interface CompanyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  countries: { id: string; name: string }[];
  /** When set, the modal is in edit mode and prefills from this company. */
  editing?: CompanyDto | null;
  onSubmit: (data: CreateCompanyRequest) => void;
  isPending: boolean;
}

const toDefaults = (c?: CompanyDto | null): FormValues => ({
  name: c?.name ?? "",
  legalName: c?.legalName ?? "",
  taxNumber: c?.taxNumber ?? "",
  countryId: c?.countryId ?? "",
  status: c?.status ?? "pending",
  email: c?.email ?? "",
  phone: c?.phone ?? "",
  website: c?.website ?? "",
  address: c?.address ?? "",
  city: c?.city ?? "",
  postalCode: c?.postalCode ?? "",
  billingMode: c?.billingMode ?? "Prepaid",
  timezone: c?.timezone ?? "",
  defaultLanguage: c?.defaultLanguage ?? "fr",
  isSandbox: c?.isSandbox ?? false,
});

export function CompanyFormModal({
  isOpen,
  onClose,
  countries,
  editing,
  onSubmit,
  isPending,
}: CompanyFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: toDefaults(null),
  });

  useEffect(() => {
    if (isOpen) reset(toDefaults(editing));
  }, [isOpen, editing, reset]);

  const isSandbox = watch("isSandbox");

  const submit = (d: FormValues) => {
    const country = countries.find((c) => c.id === d.countryId)?.name ?? null;
    onSubmit({
      name: d.name,
      legalName: d.legalName || null,
      taxNumber: d.taxNumber || null,
      countryId: d.countryId,
      status: d.status || null,
      email: d.email || null,
      phone: d.phone || null,
      website: d.website || null,
      address: d.address || null,
      city: d.city || null,
      postalCode: d.postalCode || null,
      country,
      billingMode: d.billingMode || null,
      timezone: d.timezone || null,
      defaultLanguage: d.defaultLanguage || null,
      isSandbox: d.isSandbox,
    } satisfies CreateCompanyRequest);
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={editing ? `Modifier — ${editing.name ?? ""}` : "Nouvelle company"}
      subtitle={
        editing
          ? "Mettre à jour les informations de l'entreprise"
          : "Enregistrez une nouvelle entreprise cliente"
      }
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit(submit)}
            loading={isPending}
          >
            {editing ? "Enregistrer" : "Créer"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Identité */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Nom commercial *"
            error={errors.name?.message}
            {...register("name")}
            placeholder="ex : Acme SARL"
          />
          <Input
            label="Raison sociale"
            error={errors.legalName?.message}
            {...register("legalName")}
          />
          <Input
            label="Numéro fiscal"
            error={errors.taxNumber?.message}
            {...register("taxNumber")}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-medium text-[#0D2137]">
              Pays *
            </label>
            <Select {...register("countryId")}>
              <option value="">Sélectionner un pays…</option>
              {countries.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            {errors.countryId?.message && (
              <p className="text-[12px] text-[#DC2626]">
                {errors.countryId.message}
              </p>
            )}
          </div>
        </div>

        {/* Contact */}
        <div className="grid grid-cols-2 gap-3 border-t border-[#E5E7EB] pt-4">
          <Input
            label="Email"
            type="email"
            error={errors.email?.message}
            {...register("email")}
            placeholder="contact@example.com"
          />
          <Input label="Téléphone" {...register("phone")} />
          <Input
            label="Site web"
            {...register("website")}
            placeholder="https://example.com"
          />
          <Input label="Adresse" {...register("address")} />
          <Input label="Ville" {...register("city")} />
          <Input label="Code postal" {...register("postalCode")} />
        </div>

        {/* Préférences */}
        <div className="grid grid-cols-2 gap-3 border-t border-[#E5E7EB] pt-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-medium text-[#0D2137]">
              Statut
            </label>
            <Select {...register("status")}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-medium text-[#0D2137]">
              Mode de facturation
            </label>
            <Select {...register("billingMode")}>
              {BILLING_OPTIONS.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </Select>
          </div>
          <Input
            label="Fuseau horaire"
            {...register("timezone")}
            placeholder="ex : Africa/Douala"
          />
          <Input
            label="Langue par défaut"
            {...register("defaultLanguage")}
            placeholder="ex : fr"
          />
        </div>

        {/* Sandbox */}
        <div className="flex items-center justify-between p-4 bg-[#F7F8F9] border border-[#E5E7EB] rounded-md">
          <div>
            <p className="text-[13px] font-medium text-[#0D2137]">
              Mode bac à sable
            </p>
            <p className="text-[12px] text-[#8BAFC0] mt-0.5">
              Company de test, sans facturation réelle
            </p>
          </div>
          <Toggle
            checked={isSandbox}
            onChange={(v) => setValue("isSandbox", v)}
          />
        </div>
      </div>
    </Modal>
  );
}
