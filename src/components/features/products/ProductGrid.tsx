import React from "react";
import { motion } from "framer-motion";
import { Package } from "lucide-react";
import { PageLoader } from "@/components/feedback/PageLoader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { staggerContainer, cardItem } from "@/lib/animations";
import { ProductCard } from "./ProductCard";
import type { ProductModel } from "@/models/product.model";

interface ProductGridProps {
  products: ProductModel[];
  isLoading: boolean;
  onEdit: (product: ProductModel) => void;
  onDelete: (product: ProductModel) => void;
  onCreateClick: () => void;
}

export function ProductGrid({
  products,
  isLoading,
  onEdit,
  onDelete,
  onCreateClick,
}: ProductGridProps) {
  if (isLoading) return <div className="py-20"><PageLoader /></div>;

  if (products.length === 0 && !isLoading) {
    return (
      <div className="py-20">
        <EmptyState
          icon={<Package size={48} className="text-[#B8CDD8]" />}
          title="Aucun produit"
          description="Il semblerait que vous n'ayez pas encore créé de produit. Commencez par en ajouter un pour configurer vos stratégies omnicanales."
          action={
            <button
              onClick={onCreateClick}
              className="mt-4 px-6 py-2.5 bg-[#2E8FAD] text-white rounded-md text-[13px] font-semibold hover:bg-[#1B5E82] transition-colors shadow-sm"
            >
              Créer un produit
            </button>
          }
        />
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[14px]"
    >
      {products.map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          onEdit={() => onEdit(p)}
          onDelete={() => onDelete(p)}
        />
      ))}

      {/* "Add Product" new-card */}
      <motion.div
        variants={cardItem}
        onClick={onCreateClick}
        className="border-[0.5px] border-dashed border-[#E5E7EB] rounded-[14px] flex flex-col items-center justify-center gap-[10px] p-8 cursor-pointer transition-all duration-[200ms] min-h-[320px] hover:bg-white hover:border-[#6AB8D4] hover:border-solid group"
      >
        <div className="w-11 h-11 rounded-[12px] bg-[#F0F2F4] border-[0.5px] border-[#E5E7EB] flex items-center justify-center transition-all group-hover:bg-[#E8F4F8] group-hover:border-[#6AB8D4]">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M9 4v10M4 9h10"
              stroke="#4A7A94"
              strokeWidth="1.4"
              strokeLinecap="round"
              className="group-hover:stroke-[#2E8FAD] transition-colors"
            />
          </svg>
        </div>
        <p className="text-[13px] font-medium text-[#4A7A94]">Nouveau produit</p>
        <p className="text-[11.5px] text-[#8BAFC0] text-center leading-[1.5] max-w-[160px]">
          Créez un espace dédié avec ses propres canaux et contacts
        </p>
      </motion.div>
    </motion.div>
  );
}
