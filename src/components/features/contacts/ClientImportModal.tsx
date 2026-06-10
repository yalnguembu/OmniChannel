import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeftRight,
  Settings2,
} from "lucide-react";
import { toast } from "sonner";
import { postApiClientImportUpload } from "@/shared/api/generated/sdk.gen";
import { useProductAttributeSchema } from "@/hooks/useProductAttributeSchema";

interface ClientImportModalProps {
  open: boolean;
  onClose: () => void;
  productId: string;
  onSuccess: () => void;
}

export function ClientImportModal({
  open,
  onClose,
  productId,
  onSuccess,
}: ClientImportModalProps) {
  const qc = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<"upload" | "mapping" | "importing" | "success">("upload");
  const [mapping, setMapping] = useState<Record<string, string>>({});

  // Attribute schema + saved client-mapping via the dedicated sub-resources — the
  // same ViewModel the product "Attributs" tab uses (contract-aligned, replaces the
  // old ProductDto JSON blob). Gated on `open` so it doesn't fetch while closed.
  const schema = useProductAttributeSchema(productId, { enabled: open });
  const attributes = schema.attributes;
  const mappedAttributes = attributes.filter((a) => a.key.trim() !== "");
  const schemaReady = !schema.isSchemaLoading && !schema.isMappingLoading;

  // Seed the per-import mapping from the product's saved client-mapping, falling
  // back to identity (attribute key) for keys not yet mapped so a fresh product
  // still imports out of the box. Kept local: it's sent as a per-import override,
  // never persisted back to the product mapping.
  useEffect(() => {
    if (
      open &&
      step === "mapping" &&
      schemaReady &&
      Object.keys(mapping).length === 0
    ) {
      const next: Record<string, string> = {};
      attributes.forEach((a) => {
        if (a.key.trim() !== "") next[a.key] = schema.mapping[a.key] ?? a.key;
      });
      if (Object.keys(next).length > 0) setMapping(next);
    }
  }, [open, step, schemaReady, attributes, schema.mapping, mapping]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      const ext = f.name.split(".").pop()?.toLowerCase();
      if (["csv", "xls", "xlsx"].includes(ext || "")) {
        setFile(f);
        setStep("mapping");
      } else {
        toast.error("Format de fichier non supporté. Utilisez CSV, XLS ou XLSX.");
      }
    }
  };

  // Single-step upload using POST /api/ClientImport/upload (multipart)
  const importMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("No file selected");
      // Drop empty source columns so we don't override with blank mappings.
      const cleaned = Object.fromEntries(
        Object.entries(mapping).filter(([, v]) => (v ?? "").trim() !== ""),
      );
      return postApiClientImportUpload({
        body: {
          file,
          productId,
          mappingOverride:
            Object.keys(cleaned).length > 0
              ? JSON.stringify(cleaned)
              : undefined,
          dryRun: false,
        },
      });
    },
    onSuccess: () => {
      setStep("success");
      onSuccess();
      toast.success("Importation lancée avec succès");
      qc.invalidateQueries({ queryKey: ["product-contacts", productId] });
    },
    onError: (err: any) => {
      toast.error(
        "Erreur lors de l'importation : " +
          (err.response?.data?.message || err.message),
      );
      setStep("mapping");
    },
  });

  const handleStartImport = () => {
    setStep("importing");
    importMutation.mutate();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Importer des contacts"
      subtitle={
        step === "mapping"
          ? "Configurez le mapping des colonnes"
          : "Chargez vos contacts depuis un fichier Excel ou CSV"
      }
      size={step === "mapping" ? "lg" : "md"}
    >
      <div className="py-2">
        {step === "upload" && (
          <div className="border-2 border-dashed border-[#E5E7EB] rounded-[24px] p-12 flex flex-col items-center justify-center bg-[#FBFBFC] hover:bg-[#F3F4F6] transition-all cursor-pointer relative group">
            <input
              type="file"
              accept=".csv,.xls,.xlsx"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="w-16 h-16 rounded-2xl bg-[#E8F4F8] flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <Upload size={32} className="text-[#2E8FAD]" />
            </div>
            <p className="text-[15px] font-bold text-[#0D2137]">
              Sélectionnez votre fichier
            </p>
            <p className="text-[12.5px] text-[#8BAFC0] mt-1.5">
              CSV, Excel (.xls, .xlsx) supportés
            </p>
            <div className="mt-8 flex gap-4">
              {["CSV", "XLS", "XLSX"].map((fmt) => (
                <span
                  key={fmt}
                  className="px-3 py-1 bg-white border border-[#E5E7EB] rounded-full text-[10px] font-bold text-[#8BAFC0] uppercase tracking-wider"
                >
                  {fmt}
                </span>
              ))}
            </div>
          </div>
        )}

        {step === "mapping" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-4 p-4 bg-[#FBFBFC] border border-[#E5E7EB] rounded-[18px]">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center shadow-sm">
                <FileText size={20} className="text-[#2E8FAD]" />
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-bold text-[#0D2137]">{file?.name}</p>
                <p className="text-[12px] text-[#8BAFC0]">
                  {(file?.size || 0) / 1024 > 1024
                    ? `${((file?.size || 0) / 1048576).toFixed(2)} MB`
                    : `${((file?.size || 0) / 1024).toFixed(1)} KB`}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setStep("upload")}>
                Changer de fichier
              </Button>
            </div>

            {schemaReady && attributes.length === 0 && (
              <div className="flex items-start gap-2.5 p-3.5 bg-[#FEF3C7] border border-[#FCD34D] rounded-md">
                <AlertCircle size={14} className="text-[#D97706] shrink-0 mt-0.5" />
                <p className="text-[12px] text-[#92400E]">
                  Aucun schéma d'attributs défini pour ce produit. Configurez-le depuis l'onglet "Attributs" du produit avant d'importer.
                </p>
              </div>
            )}

            <div className="bg-white border border-[#E5E7EB] rounded-[20px] p-6">
              <div className="flex items-center gap-2 mb-4 text-[#0D2137]">
                <Settings2 size={18} />
                <h3 className="text-[15px] font-bold">Configuration du Mapping</h3>
              </div>

              {schema.isSchemaLoading ? (
                <p className="text-[13px] text-[#8BAFC0] py-4 text-center">
                  Chargement du schéma…
                </p>
              ) : mappedAttributes.length === 0 ? (
                <p className="text-[13px] text-[#8BAFC0] py-4 text-center">
                  Aucun attribut défini pour ce produit.
                </p>
              ) : (
                <div className="space-y-3">
                  <p className="text-[12.5px] text-[#8BAFC0]">
                    Associez chaque attribut du schéma à la colonne (ou l'index)
                    de votre fichier d'import.
                  </p>
                  {mappedAttributes.map((attr) => (
                    <div key={attr.key} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="px-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-md text-[13px] text-[#0D2137] truncate">
                          <span className="font-medium">
                            {attr.label || attr.key}
                          </span>
                          <span className="text-[#8BAFC0] ml-1.5">
                            ({attr.key})
                          </span>
                        </div>
                      </div>
                      <ArrowLeftRight
                        size={14}
                        className="text-[#8BAFC0] flex-shrink-0"
                      />
                      <div className="flex-1">
                        <Input
                          placeholder="Colonne CSV (ex: FIRST_NAME) ou index (0, 1…)"
                          value={mapping[attr.key] ?? ""}
                          onChange={(e) =>
                            setMapping((prev) => ({
                              ...prev,
                              [attr.key]: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={onClose}>
                Annuler
              </Button>
              <Button variant="primary" onClick={handleStartImport} className="gap-2">
                Lancer l'importation <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        )}

        {step === "importing" && (
          <div className="text-center py-16 flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-[#E8F4F8] border-t-[#2E8FAD] rounded-full animate-spin mb-6" />
            <h3 className="text-[18px] font-bold text-[#0D2137]">
              Importation en cours...
            </h3>
            <p className="text-[14px] text-[#8BAFC0] mt-2 max-w-[300px]">
              Nous préparons votre fichier et configurons les données. Veuillez patienter.
            </p>
          </div>
        )}

        {step === "success" && (
          <div className="text-center py-12 animate-in zoom-in duration-300">
            <div className="w-20 h-20 rounded-full bg-[#DCFCE7] flex items-center justify-center mx-auto mb-6 shadow-sm">
              <CheckCircle2 size={40} className="text-[#15803D]" />
            </div>
            <h3 className="text-[20px] font-bold text-[#0D2137]">
              Fichier prêt pour traitement
            </h3>
            <p className="text-[14px] text-[#8BAFC0] mt-3 mb-8 max-w-[350px] mx-auto">
              Le fichier a été téléchargé et la file d'attente d'importation a été créée. Vos contacts apparaîtront sous peu.
            </p>
            <Button variant="primary" onClick={onClose} size="md" className="px-10">
              Terminer
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
