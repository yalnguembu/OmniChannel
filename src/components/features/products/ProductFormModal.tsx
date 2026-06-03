import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema } from "@/lib/validators";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import type { ProductDto } from "@/shared/api/types";
import type { z } from "zod";

type ProductForm = z.infer<typeof productSchema>;

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: ProductDto | null;
  onSubmit: (data: ProductForm) => void;
  isPending: boolean;
}

import { Plus, Trash2, Hash, Code } from "lucide-react";

type KeyValuePair = { key: string; value: string };

export function ProductFormModal({
  isOpen,
  onClose,
  editingProduct,
  onSubmit,
  isPending,
}: ProductFormModalProps) {
  const [attributes, setAttributes] = useState<KeyValuePair[]>([]);
  const [mappings, setMappings] = useState<KeyValuePair[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (editingProduct) {
        // Parse attributes
        const attrObj: any = editingProduct.clientAttributes || {};
        const attrArr = Object.entries(attrObj).map(([k, v]) => ({ key: k, value: String(v) }));
        setAttributes(attrArr.length ? attrArr : [{ key: "", value: "" }]);

        // Parse mappings
        const mapObj: any = editingProduct.clientMappingConfiguration || {};
        const mapArr = Object.entries(mapObj).map(([k, v]) => ({ key: k, value: String(v) }));
        setMappings(mapArr.length ? mapArr : [{ key: "", value: "" }]);

        reset({
          name: editingProduct.name,
          description: editingProduct.description ?? "",
          status: editingProduct.status as any,
          clientAttributes: JSON.stringify(attrObj),
          clientMappingConfiguration: JSON.stringify(mapObj),
        });
      } else {
        setAttributes([{ key: "", value: "" }]);
        setMappings([{ key: "", value: "" }]);
        reset({ 
          name: "", 
          description: "", 
          status: "draft",
          clientAttributes: "{}",
          clientMappingConfiguration: "{}",
        });
      }
    }
  }, [isOpen, editingProduct, reset]);

  const handleFormSubmit = (data: ProductForm) => {
    // Transform arrays back to objects
    const attrObj = attributes.reduce((acc, curr) => {
      if (curr.key.trim()) acc[curr.key.trim()] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    const mapObj = mappings.reduce((acc, curr) => {
      if (curr.key.trim()) acc[curr.key.trim()] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    onSubmit({
      ...data,
      clientAttributes: JSON.stringify(attrObj),
      clientMappingConfiguration: JSON.stringify(mapObj),
    });
  };

  const KeyValueEditor = ({ 
    label, 
    items, 
    setItems, 
    icon: Icon 
  }: { 
    label: string, 
    items: KeyValuePair[], 
    setItems: React.Dispatch<React.SetStateAction<KeyValuePair[]>>,
    icon: any
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <label className="text-[12.5px] font-medium text-[#0D2137] flex items-center gap-2">
          <Icon size={14} className="text-[#8BAFC0]" />
          {label}
        </label>
        <button
          type="button"
          onClick={() => setItems([...items, { key: "", value: "" }])}
          className="text-[11.5px] text-[#2E8FAD] hover:underline flex items-center gap-1"
        >
          <Plus size={12} /> Ajouter
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2 items-start group">
            <div className="flex-1">
              <Input
                placeholder="Clé"
                value={item.key}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[i].key = e.target.value;
                  setItems(newItems);
                }}
              />
            </div>
            <div className="flex-[2]">
              <Input
                placeholder="Valeur"
                value={item.value}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[i].value = e.target.value;
                  setItems(newItems);
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => setItems(items.filter((_, idx) => idx !== i))}
              className="mt-2.5 p-2 text-[#8BAFC0] hover:text-[#DC2626] transition-colors"
              disabled={items.length === 1 && !item.key && !item.value}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={editingProduct ? `Modifier ${editingProduct.name}` : "Nouveau produit"}
      subtitle={editingProduct ? editingProduct.id : "Créez un nouvel espace produit"}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit(handleFormSubmit)}
            loading={isPending}
          >
            {editingProduct ? "Enregistrer" : "Créer le produit"}
          </Button>
        </>
      }
    >
      <form className="flex flex-col gap-6 max-h-[65vh] overflow-y-auto px-1 pr-3 scrollbar-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nom du produit *"
            placeholder="ex : Acme Shop"
            error={errors.name?.message}
            {...register("name")}
          />
          <Select
            label="Statut"
            error={errors.status?.message}
            {...register("status")}
            options={[
              { value: "active", label: "Actif" },
              { value: "paused", label: "En pause" },
              { value: "draft", label: "Brouillon" },
            ]}
          />
        </div>
        <Textarea
          label="Description"
          placeholder="Décrivez l'usage de ce produit…"
          {...register("description")}
          className="min-h-[80px]"
        />

        <div className="border-t border-[#E5E7EB] pt-5 mt-2 space-y-8">
          <KeyValueEditor 
            label="Attributs Clients (JSON)" 
            items={attributes} 
            setItems={setAttributes}
            icon={Hash}
          />
          <KeyValueEditor 
            label="Configuration du Mapping (JSON)" 
            items={mappings} 
            setItems={setMappings}
            icon={Code}
          />
        </div>
      </form>
    </Modal>
  );
}
