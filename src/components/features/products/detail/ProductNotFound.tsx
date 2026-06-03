import { Package } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ProductNotFoundProps {
  onBack: () => void;
}

/** Empty state shown when a product id resolves to nothing. */
export function ProductNotFound({ onBack }: ProductNotFoundProps) {
  return (
    <div className="p-10 flex flex-col items-center justify-center min-h-[500px] bg-[#F7F8F9]/50">
      <div className="w-20 h-20 rounded-[24px] bg-white border border-[#E5E7EB] flex items-center justify-center shadow-sm mb-6">
        <Package size={40} className="text-[#B8CDD8] opacity-40" />
      </div>
      <h2 className="text-[18px] font-bold text-[#0D2137]">
        Produit introuvable
      </h2>
      <p className="text-[14px] text-[#8BAFC0] mt-2 mb-6">
        L'espace produit que vous recherchez n'existe pas ou a été déplacé.
      </p>
      <Button variant="secondary" size="md" onClick={onBack}>
        Retour à la liste des produits
      </Button>
    </div>
  );
}
