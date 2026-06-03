import React from "react";
import { Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import type { ProductModel } from "@/models/product.model";

interface ProductDeleteModalProps {
  product: ProductModel | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
  isPending: boolean;
}

export function ProductDeleteModal({
  product,
  onClose,
  onConfirm,
  isPending,
}: ProductDeleteModalProps) {
  if (!product) return null;

  return (
    <Modal
      open={!!product}
      onClose={onClose}
      title={`Supprimer ${product.name}`}
      subtitle="Cette action est irréversible"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="danger"
            onClick={() => onConfirm(product.id)}
            loading={isPending}
          >
            Supprimer définitivement
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3 p-4 bg-[#FEE2E2] border border-[#FCA5A5] rounded-[10px]">
        <Trash2 size={15} className="text-[#DC2626] shrink-0 mt-0.5" />
        <p className="text-[12.5px] text-[#DC2626] leading-relaxed">
          Supprimer <strong>{product.name}</strong> supprimera
          définitivement toutes ses campagnes, contacts et messages
          associés.
        </p>
      </div>
    </Modal>
  );
}
