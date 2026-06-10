import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { ProductModel } from "@/models/product.model";
import type { ProductEditData } from "@/hooks/useProductDetailViewModel";

const schema = z.object({
  name: z.string().min(1, "Nom requis"),
  description: z.string().optional().default(""),
  status: z.string().min(1, "Statut requis"),
});
type FormValues = z.infer<typeof schema>;

const STATUS_OPTIONS = [
  { value: "active", label: "Actif" },
  { value: "paused", label: "En pause" },
  { value: "draft", label: "Brouillon" },
  { value: "inactive", label: "Inactif" },
];

interface ProductEditModalProps {
  open: boolean;
  onClose: () => void;
  product: ProductModel | null | undefined;
  onSubmit: (data: ProductEditData) => void;
  isPending: boolean;
}

/** Inline edit of a product's core fields (PUT /api/Product). */
export function ProductEditModal({
  open,
  onClose,
  product,
  onSubmit,
  isPending,
}: ProductEditModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open && product)
      reset({
        name: product.name ?? "",
        description: product.description ?? "",
        status: product.status ?? "draft",
      });
  }, [open, product, reset]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Modifier le produit"
      subtitle="Informations générales du produit"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit((d) =>
              onSubmit({
                name: d.name,
                description: d.description ?? "",
                status: d.status,
              }),
            )}
            loading={isPending}
          >
            Enregistrer
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          label="Nom du produit *"
          error={errors.name?.message}
          {...register("name")}
          placeholder="Programme fidélité"
        />
        <Input
          label="Description"
          {...register("description")}
          placeholder="Description du produit"
        />
        <Select
          label="Statut"
          error={errors.status?.message}
          options={STATUS_OPTIONS}
          {...register("status")}
        />
      </div>
    </Modal>
  );
}
