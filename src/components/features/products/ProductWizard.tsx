import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { ProductModel } from "@/models/product.model";
import type { CreateProductRequest } from "@/shared/api/generated/types.gen";

interface ProductWizardProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: ProductModel | null;
  onSubmit: (data: CreateProductRequest) => void;
  isPending: boolean;
}

export function ProductWizard({
  isOpen,
  onClose,
  editingProduct,
  onSubmit,
  isPending,
}: ProductWizardProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "draft",
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: editingProduct?.name ?? "",
        description: editingProduct?.description ?? "",
        status: (editingProduct?.status as any) ?? "draft",
      });
    }
  }, [isOpen, editingProduct]);

  const handleSave = () => {
    if (!formData.name.trim()) return;

    onSubmit({
      name: formData.name,
      description: formData.description || undefined,
      status: formData.status,
    });
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={
        editingProduct ? `Modifier ${editingProduct.name}` : "Nouveau produit"
      }
      subtitle={
        editingProduct
          ? `ID: ${editingProduct.id}`
          : "Configurez votre espace omnicanal"
      }
      size="md"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            loading={isPending}
            disabled={!formData.name.trim()}
          >
            {editingProduct ? "Enregistrer" : "Créer le produit"}
          </Button>
        </div>
      }
    >
      <AnimatePresence mode="wait">
        <motion.div
          key="form"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="space-y-5 py-2"
        >
          {/* Info banner — attribute schema moved to dedicated tab */}
          <div className="flex items-start gap-2.5 p-3.5 bg-[#E8F4F8] border border-[#2E8FAD]/20 rounded-md">
            <Info size={14} className="text-[#2E8FAD] shrink-0 mt-0.5" />
            <p className="text-[12px] text-[#1B5E82] leading-relaxed">
              Le schéma d'attributs et le mapping CSV se configurent dans
              l'onglet <strong>Attributs</strong> de la fiche produit, après
              création.
            </p>
          </div>

          <Input
            label="Nom du produit *"
            placeholder="ex: Canal Boutique E-commerce"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <Textarea
            label="Description"
            placeholder="À quoi sert cet espace ? (ex: Gestion des commandes et SAV)"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="min-h-[120px]"
          />
        </motion.div>
      </AnimatePresence>
    </Modal>
  );
}
