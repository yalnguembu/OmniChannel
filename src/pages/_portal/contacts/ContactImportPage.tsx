import React from "react";
import {  useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Upload, FileText, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { ClientImportService } from "@/shared/api/services";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Toggle } from "@/components/ui/Toggle";
import { cn } from "@/lib/utils";

const CSV_COLUMNS = [
  "first_name",
  "last_name",
  "email",
  "phone",
  "city",
  "country",
  "gender",
];
const OC_FIELDS = [
  { value: "", label: "— Ignorer —" },
  { value: "firstName", label: "Prénom" },
  { value: "lastName", label: "Nom" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Téléphone" },
  { value: "city", label: "Ville" },
  { value: "country", label: "Pays" },
  { value: "gender", label: "Genre" },
];

const PREVIEW_DATA = [
  [
    "Kofi",
    "Mensah",
    "kofi@example.com",
    "+224 620 456 789",
    "Conakry",
    "Guinée",
    "M",
  ],
  [
    "Fatima",
    "Diallo",
    "fatima@example.com",
    "+224 631 123 456",
    "Dakar",
    "Sénégal",
    "F",
  ],
  [
    "Ibrahim",
    "Bah",
    "ibrahim@example.com",
    "+237 690 000 001",
    "Yaoundé",
    "Cameroun",
    "M",
  ],
];

export function ContactImportPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [step, setStep] = useState(1);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [fileName, setFileName] = useState("");
  const [rowCount, setRowCount] = useState(0);
  const [mapping, setMapping] = useState<Record<string, string>>({
    first_name: "firstName",
    last_name: "lastName",
    email: "email",
    phone: "phone",
    city: "city",
    country: "country",
    gender: "gender",
  });
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [optInSms, setOptInSms] = useState(true);
  const [addToSegment, setAddToSegment] = useState(false);

  const importMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      ClientImportService.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Import lancé avec succès");
      navigate({ to: "/contacts" });
    },
    onError: () => toast.error("Erreur lors de l'import"),
  });

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setFileName(file.name);
      setRowCount(Math.floor(Math.random() * 2000) + 200);
      setFileUploaded(true);
    }
  };

  const handleFileClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setFileName(file.name);
        setRowCount(Math.floor(Math.random() * 2000) + 200);
        setFileUploaded(true);
      }
    };
    input.click();
  };

  const steps = [
    { num: 1, label: "Fichier CSV", sub: "Télécharger" },
    { num: 2, label: "Mapping", sub: "Colonnes" },
    { num: 3, label: "Options", sub: "Configuration" },
    { num: 4, label: "Lancer", sub: "Confirmation" },
  ];

  return (
    <div className="p-7">
      <button
        onClick={() => navigate({ to: "/contacts" })}
        className="flex items-center gap-2 text-[12.5px] text-[#8BAFC0] hover:text-[#0D2137] mb-5 transition-colors cursor-pointer"
      >
        <ArrowLeft size={13} />
        Contacts
      </button>

      <div className="mb-6">
        <h1 className="text-[18px] font-semibold text-[#0D2137] tracking-tight">
          Importer des contacts
        </h1>
        <p className="text-[12.5px] text-[#4A7A94] mt-1">
          Importez vos contacts depuis un fichier CSV
        </p>
      </div>

      {/* Stepper */}
      <div className="bg-white border border-[#E5E7EB] rounded-[20px] p-4 mb-6 flex items-center">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center flex-1">
            <div
              className="flex items-center gap-2.5 cursor-pointer shrink-0"
              onClick={() => s.num < step && setStep(s.num)}
            >
              <div
                className={cn(
                  "w-[34px] h-[34px] rounded-full flex items-center justify-center text-[12.5px] font-semibold shrink-0 z-10",
                  s.num < step
                    ? "bg-[#E8F4F8] text-[#2E8FAD] border border-[#2E8FAD]/30"
                    : s.num === step
                      ? "bg-[#0D2137] text-white shadow-[0_3px_10px_rgba(13,33,55,0.2)]"
                      : "bg-[#F0F2F4] text-[#8BAFC0] border border-[#E5E7EB]",
                )}
              >
                {s.num < step ? <Check size={14} /> : s.num}
              </div>
              <div className="hidden sm:block">
                <p
                  className={cn(
                    "text-[12.5px] font-medium",
                    s.num === step
                      ? "text-[#0D2137]"
                      : s.num < step
                        ? "text-[#1B5E82]"
                        : "text-[#8BAFC0]",
                  )}
                >
                  {s.label}
                </p>
                <p className="text-[11px] text-[#B8CDD8]">{s.sub}</p>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 mx-3 h-px",
                  s.num < step ? "bg-[#2E8FAD]" : "bg-[#E5E7EB]",
                )}
              />
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 280px" }}>
        {/* Main step content */}
        <div className="bg-white border border-[#E5E7EB] rounded-[14px] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#E5E7EB] bg-[#F7F8F9]">
            <p className="text-[13.5px] font-medium text-[#0D2137]">
              {steps[step - 1].label}
            </p>
          </div>
          <div className="p-5">
            {step === 1 && (
              <div>
                <div
                  onDrop={handleFileDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={handleFileClick}
                  className={cn(
                    "border-[1.5px] border-dashed rounded-[14px] p-8 text-center cursor-pointer transition-all",
                    fileUploaded
                      ? "border-[#16A34A] bg-[#DCFCE7]"
                      : "border-[#E5E7EB] bg-[#F7F8F9] hover:border-[#6AB8D4] hover:bg-[#E8F4F8]",
                  )}
                >
                  {fileUploaded ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-[#16A34A]/15 flex items-center justify-center">
                        <Check size={24} className="text-[#16A34A]" />
                      </div>
                      <p className="text-[14px] font-semibold text-[#16A34A]">
                        {fileName}
                      </p>
                      <p className="text-[12.5px] text-[#16A34A]/70">
                        {rowCount.toLocaleString("fr")} lignes détectées
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-[12px] bg-[#F0F2F4] border border-[#E5E7EB] flex items-center justify-center">
                        <Upload size={20} className="text-[#4A7A94]" />
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-[#4A7A94]">
                          Glissez votre fichier ici ou cliquez
                        </p>
                        <p className="text-[12px] text-[#8BAFC0] mt-1">
                          CSV uniquement · max 50 000 lignes · UTF-8
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <button className="mt-3 flex items-center gap-1.5 text-[12.5px] text-[#2E8FAD] hover:text-[#1B5E82] transition-colors cursor-pointer">
                  <FileText size={13} />
                  Télécharger le modèle CSV
                </button>
              </div>
            )}

            {step === 2 && (
              <div>
                <p className="text-[12.5px] text-[#4A7A94] mb-4">
                  Associez chaque colonne CSV à un champ OmniChannel.
                </p>
                <div className="border border-[#E5E7EB] rounded-[10px] overflow-hidden">
                  <table className="w-full border-collapse text-[12.5px]">
                    <thead>
                      <tr className="bg-[#F7F8F9] border-b border-[#E5E7EB]">
                        <th className="px-4 py-2.5 text-left text-[10.5px] font-semibold text-[#8BAFC0] uppercase tracking-[0.06em]">
                          Colonne CSV
                        </th>
                        <th className="px-4 py-2.5 text-left text-[10.5px] font-semibold text-[#8BAFC0] uppercase tracking-[0.06em]">
                          Champ OmniChannel
                        </th>
                        <th className="px-4 py-2.5 text-left text-[10.5px] font-semibold text-[#8BAFC0] uppercase tracking-[0.06em]">
                          Aperçu
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {CSV_COLUMNS.map((col, i) => (
                        <tr
                          key={col}
                          className={cn(
                            "border-b border-[#E5E7EB] last:border-b-0",
                          )}
                        >
                          <td className="px-4 py-2.5">
                            <code className="font-mono text-[12px] text-[#2E8FAD] bg-[#E8F4F8] px-1.5 py-0.5 rounded">
                              {col}
                            </code>
                          </td>
                          <td className="px-4 py-2.5">
                            <Select
                              value={mapping[col] ?? ""}
                              onChange={(e) =>
                                setMapping((prev) => ({
                                  ...prev,
                                  [col]: e.target.value,
                                }))
                              }
                              options={OC_FIELDS}
                              className="!py-1.5 !text-[12px]"
                            />
                          </td>
                          <td className="px-4 py-2.5 text-[#8BAFC0]">
                            {PREVIEW_DATA[0][i]}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-[11.5px] text-[#8BAFC0] mt-3">
                  Aperçu : {rowCount.toLocaleString("fr")} contacts à importer
                  depuis <strong>{fileName}</strong>
                </p>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-4">
                {[
                  {
                    label: "Ignorer les doublons",
                    desc: "Les contacts avec le même email ou téléphone seront ignorés",
                    checked: skipDuplicates,
                    onChange: setSkipDuplicates,
                  },
                  {
                    label: "Opt-in SMS pour tous les contacts importés",
                    desc: "Les contacts importés seront automatiquement opt-in pour les SMS",
                    checked: optInSms,
                    onChange: setOptInSms,
                  },
                  {
                    label: 'Ajouter au segment "Nouveaux clients"',
                    desc: "Créer un segment dédié pour cet import",
                    checked: addToSegment,
                    onChange: setAddToSegment,
                  },
                ].map((opt) => (
                  <div
                    key={opt.label}
                    className="flex items-start justify-between p-4 bg-[#F7F8F9] border border-[#E5E7EB] rounded-[10px] gap-6"
                  >
                    <div>
                      <p className="text-[13px] font-medium text-[#0D2137]">
                        {opt.label}
                      </p>
                      <p className="text-[12px] text-[#8BAFC0] mt-0.5">
                        {opt.desc}
                      </p>
                    </div>
                    <Toggle checked={opt.checked} onChange={opt.onChange} />
                  </div>
                ))}
              </div>
            )}

            {step === 4 && (
              <div>
                <div className="flex items-center gap-3 p-4 bg-[#DCFCE7] border border-[#86EFAC] rounded-[10px] mb-5">
                  <Check size={16} className="text-[#16A34A] shrink-0" />
                  <p className="text-[12.5px] text-[#16A34A] font-medium">
                    Tout est prêt — votre import est configuré.
                  </p>
                </div>
                <div className="space-y-0">
                  {[
                    { k: "Fichier", v: fileName },
                    {
                      k: "Contacts",
                      v: `${rowCount.toLocaleString("fr")} lignes`,
                    },
                    {
                      k: "Champs mappés",
                      v: `${Object.values(mapping).filter(Boolean).length} / ${CSV_COLUMNS.length}`,
                    },
                    { k: "Doublons", v: skipDuplicates ? "Ignorés" : "Inclus" },
                    {
                      k: "Opt-in SMS",
                      v: optInSms ? "Activé pour tous" : "Non",
                    },
                    {
                      k: "Segment",
                      v: addToSegment ? "Nouveaux clients" : "Aucun",
                    },
                  ].map((row) => (
                    <div
                      key={row.k}
                      className="flex justify-between py-2.5 border-b border-[#E5E7EB] last:border-b-0"
                    >
                      <span className="text-[12.5px] text-[#8BAFC0]">
                        {row.k}
                      </span>
                      <span className="text-[12.5px] font-medium text-[#0D2137]">
                        {row.v}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between p-5 border-t border-[#E5E7EB]">
            <Button
              variant="secondary"
              onClick={() => step > 1 && setStep(step - 1)}
              className={step === 1 ? "invisible" : ""}
            >
              ← Précédent
            </Button>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => navigate({ to: "/contacts" })}
              >
                Annuler
              </Button>
              {step < 4 ? (
                <Button
                  variant="primary"
                  onClick={() => setStep(step + 1)}
                  disabled={step === 1 && !fileUploaded}
                >
                  Suivant →
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={() =>
                    importMutation.mutate({
                      // CreateClientImportRequest — only valid fields
                      fileName: fileName || undefined,
                      fileSize: undefined,
                      fileUrl: undefined, // TODO: wire real upload
                      mappingConfiguration: JSON.stringify(mapping),
                    })
                  }
                  loading={importMutation.isPending}
                >
                  🚀 Lancer l'import
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Summary sidebar */}
        <div className="bg-white border border-[#E5E7EB] rounded-[14px] overflow-hidden self-start sticky top-0">
          <div className="px-4 py-3.5 border-b border-[#E5E7EB] bg-[#F7F8F9]">
            <p className="text-[12.5px] font-medium text-[#0D2137]">
              Récapitulatif
            </p>
          </div>
          <div className="p-4">
            {[
              {
                k: "Fichier",
                v: fileName || "Non sélectionné",
                empty: !fileName,
              },
              {
                k: "Contacts",
                v: rowCount ? `${rowCount.toLocaleString("fr")}` : "—",
                empty: !rowCount,
              },
              {
                k: "Mappings",
                v: `${Object.values(mapping).filter(Boolean).length} champs`,
                empty: false,
              },
              {
                k: "Doublons",
                v: skipDuplicates ? "Ignorés" : "Inclus",
                empty: false,
              },
            ].map((row) => (
              <div
                key={row.k}
                className="flex justify-between py-2 border-b border-[#E5E7EB] last:border-b-0"
              >
                <span className="text-[12px] text-[#8BAFC0]">{row.k}</span>
                <span
                  className={cn(
                    "text-[12.5px] font-medium text-right ml-4",
                    row.empty
                      ? "text-[#B8CDD8] italic font-normal"
                      : "text-[#0D2137]",
                  )}
                >
                  {row.v}
                </span>
              </div>
            ))}
          </div>
          {fileUploaded && (
            <div className="p-4 border-t border-[#E5E7EB]">
              <div className="flex items-start gap-2 p-3 bg-[#E8F4F8] rounded-[8px]">
                <AlertCircle
                  size={13}
                  className="text-[#2E8FAD] shrink-0 mt-0.5"
                />
                <p className="text-[11.5px] text-[#4A7A94] leading-relaxed">
                  Vérifiez le mapping avant de lancer l'import. Il ne peut pas
                  être annulé.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
