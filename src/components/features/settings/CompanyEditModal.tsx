import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { UpdateCompanyRequest } from "@/shared/api/generated/types.gen";

type FormValues = {
  name: string;
  legalName: string;
  email: string;
  phone: string;
  taxNumber: string;
  website: string;
  address: string;
  country: string;
};

interface CompanyEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  company?: any;
  isPending: boolean;
  /** Called with the validated UpdateCompanyRequest payload */
  onSubmit: (data: UpdateCompanyRequest) => void;
}

export function CompanyEditModal({
  isOpen,
  onClose,
  company,
  isPending,
  onSubmit,
}: CompanyEditModalProps) {
  const { register, handleSubmit, reset } = useForm<FormValues>();

  // Pre-fill form whenever the modal opens or company changes
  useEffect(() => {
    if (isOpen) {
      reset({
        name: company?.name ?? "",
        legalName: company?.legalName ?? "",
        email: company?.email ?? "",
        phone: company?.phone ?? "",
        taxNumber: company?.taxNumber ?? "",
        website: company?.website ?? "",
        address: company?.address ?? "",
        country: company?.country ?? "",
      });
    }
  }, [isOpen, company, reset]);

  const submit = (values: FormValues) => {
    onSubmit({
      id: company?.id,
      name: values.name,
      legalName: values.legalName,
      email: values.email,
      phone: values.phone,
      taxNumber: values.taxNumber,
      website: values.website,
      address: values.address,
      country: values.country,
    });
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Modifier le profil"
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
            Enregistrer
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <Input label="Nom commercial" {...register("name")} />
        <Input label="Raison sociale" {...register("legalName")} />
        <Input label="Email professionnel" type="email" {...register("email")} />
        <Input label="Téléphone" {...register("phone")} />
        <Input label="Numéro fiscal" {...register("taxNumber")} />
        <Input label="Site web" {...register("website")} />
        <Input label="Adresse" {...register("address")} />
        <Input label="Pays" {...register("country")} />
      </div>
    </Modal>
  );
}
