import { useState, useEffect, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Toggle } from "@/components/ui/Toggle";
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
  // Single global choice: override the product config (the mapping flow below)
  // or use the product's default config. When off, no mappingOverride is sent —
  // every field stays `undefined` and the backend applies the default config.
  const [override, setOverride] = useState(false);

  const schema = useProductAttributeSchema(productId, { enabled: open });
  const attributes = schema.attributes;
  const schemaReady = !schema.isSchemaLoading && !schema.isMappingLoading;

  const mappingTargets = useMemo(() => {
    const reserved = schema.reservedKeyList.map((k) => ({
      key: k,
      label: k,
      kind: "reserved" as const,
    }));
    const custom = attributes
      .filter((a) => a.key.trim() !== "")
      .map((a) => ({
        key: a.key,
        label: a.label || a.key,
        kind: "custom" as const,
      }));

    const seen = new Set<string>();
    return [...reserved, ...custom].filter((t) => {
      const k = t.key.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }, [schema.reservedKeyList, attributes]);

  useEffect(() => {
    if (
      open &&
      step === "mapping" &&
      schemaReady &&
      mappingTargets.length > 0 &&
      Object.keys(mapping).length === 0
    ) {
      const next: Record<string, string> = {};
      mappingTargets.forEach((t) => {
        next[t.key] = schema.mapping[t.key] ?? t.key;
      });
      setMapping(next);
    }
  }, [open, step, schemaReady, mappingTargets, schema.mapping, mapping]);

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

  const importMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("No file selected");
      // Only send an override when the user explicitly chose to. Otherwise the
      // field stays `undefined` and the backend applies the product default config.
      const cleaned = override
        ? Object.fromEntries(
            Object.entries(mapping).filter(([, v]) => (v ?? "").trim() !== ""),
          )
        : {};
      return postApiClientImportUpload({
        body: {
          file,
          productId,
          mappingOverride:
            override && Object.keys(cleaned).length > 0
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
                  Aucun attribut personnalisé défini pour ce produit. Vous pouvez tout de même mapper les champs réservés ci-dessous, ou en ajouter depuis l'onglet "Attributs" du produit.
                </p>
              </div>
            )}

            <div className="bg-white border border-[#E5E7EB] rounded-[20px] p-6">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2 text-[#0D2137]">
                  <Settings2 size={18} />
                  <h3 className="text-[15px] font-bold">Configuration du Mapping</h3>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="text-[12px] text-[#4A7A94]">
                    {override ? "Redéfinir le mapping" : "Config par défaut"}
                  </span>
                  <Toggle checked={override} onChange={setOverride} />
                </div>
              </div>

              {!schemaReady ? (
                <p className="text-[13px] text-[#8BAFC0] py-4 text-center">
                  Chargement du schéma…
                </p>
              ) : !override ? (
                <p className="text-[12.5px] text-[#8BAFC0] py-2 leading-relaxed">
                  La configuration de mapping par défaut du produit sera utilisée.
                  Activez « Redéfinir le mapping » pour associer manuellement les
                  champs aux colonnes de votre fichier.
                </p>
              ) : mappingTargets.length === 0 ? (
                <p className="text-[13px] text-[#8BAFC0] py-4 text-center">
                  Aucun champ à mapper pour ce produit.
                </p>
              ) : (
                <div className="space-y-3">
                  <p className="text-[12.5px] text-[#8BAFC0]">
                    Associez chaque champ à la colonne (ou l'index) de votre
                    fichier d'import. Laissez un champ vide pour conserver sa
                    valeur par défaut.
                  </p>
                  {mappingTargets.map((t) => (
                    <div key={t.key} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="px-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-md text-[13px] text-[#0D2137] truncate flex items-center gap-1.5">
                          <span className="font-medium">{t.label}</span>
                          {t.kind === "reserved" ? (
                            <Badge variant="info" className="shrink-0">
                              Réservé
                            </Badge>
                          ) : (
                            <span className="text-[#8BAFC0]">({t.key})</span>
                          )}
                        </div>
                      </div>
                      <ArrowLeftRight
                        size={14}
                        className="text-[#8BAFC0] flex-shrink-0"
                      />
                      <div className="flex-1">
                        <Input
                          placeholder="Colonne CSV (ex: FIRST_NAME) ou index (0, 1…)"
                          value={mapping[t.key] ?? ""}
                          onChange={(e) =>
                            setMapping((prev) => ({
                              ...prev,
                              [t.key]: e.target.value,
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
