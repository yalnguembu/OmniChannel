import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TemplateSchema, type TemplateModel } from "@/models/template.model";
import { ProductModel } from "@/models/product.model";
import { useCallback, useEffect, useMemo, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

// ── Shared Quill CSS (injected once globally) ────────────────────────────────
const QUILL_MODAL_STYLE = `
  .tpl-modal-quill .ql-toolbar {
    border-top: none !important;
    border-left: none !important;
    border-right: none !important;
    border-bottom: 0.5px solid #E5E7EB !important;
    background: #F7F8F9;
    padding: 6px 10px;
    border-radius: 0;
    flex-wrap: wrap;
  }
  .tpl-modal-quill .ql-container {
    border: none !important;
    font-family: inherit;
    font-size: 13px;
    color: #0D2137;
  }
  .tpl-modal-quill .ql-editor {
    min-height: 180px;
    max-height: 320px;
    overflow-y: auto;
    line-height: 1.7;
    padding: 12px 14px;
  }
  .tpl-modal-quill .ql-editor.ql-blank::before {
    color: #8BAFC0;
    font-style: normal;
    font-size: 13px;
  }
  .tpl-modal-quill .ql-stroke { stroke: #4A7A94 !important; }
  .tpl-modal-quill .ql-fill   { fill: #4A7A94 !important; }
  .tpl-modal-quill .ql-picker  { color: #4A7A94 !important; }
  .tpl-modal-quill button:hover .ql-stroke,
  .tpl-modal-quill button.ql-active .ql-stroke { stroke: #0D2137 !important; }
  .tpl-modal-quill button:hover .ql-fill,
  .tpl-modal-quill button.ql-active .ql-fill   { fill: #0D2137 !important; }
  .tpl-modal-quill-error .ql-toolbar,
  .tpl-modal-quill-error .ql-container { border-color: #FCA5A5 !important; }
`;

if (
  typeof document !== "undefined" &&
  !document.getElementById("tpl-modal-quill-styles")
) {
  const s = document.createElement("style");
  s.id = "tpl-modal-quill-styles";
  s.textContent = QUILL_MODAL_STYLE;
  document.head.appendChild(s);
}

// ── Variable pills ────────────────────────────────────────────────────────────
const VARIABLES = [
  "{{customer_name}}",
  "{{order_id}}",
  "{{order_amount}}",
  "{{delivery_date}}",
  "{{tracking_url}}",
];

// ── Quill modules/formats (stable refs via useMemo) ──────────────────────────
const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
    ["clean"],
  ],
  clipboard: { matchVisual: false },
};

const QUILL_FORMATS = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "color",
  "list",
  "bullet",
  "link",
];

// ── Props ─────────────────────────────────────────────────────────────────────
interface TemplateModalProps {
  open: boolean;
  onClose: () => void;
  editing: TemplateModel | null;
  onSubmit: (data: TemplateModel) => void;
  loading: boolean;
  initialValues?: TemplateModel;
  products: ProductModel[];
}

// ── Component ─────────────────────────────────────────────────────────────────
export function TemplateModal({
  open,
  onClose,
  editing,
  onSubmit,
  loading,
  initialValues,
  products,
}: TemplateModalProps) {
  const quillRef = useRef<ReactQuill>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<TemplateModel>({
    resolver: zodResolver(TemplateSchema),
    defaultValues: TemplateSchema.parse(initialValues ?? {}),
  });

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      reset(editing ? editing : TemplateSchema.parse({}));
    }
  }, [editing, reset, open]);

  /** Insert a variable at the Quill cursor position */
  const insertVariable = useCallback((variable: string) => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;
    const range = quill.getSelection(true);
    quill.insertText(range.index, variable, "user");
    quill.setSelection(range.index + variable.length, 0);
  }, []);

  const hasContentError = !!errors.content;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Modifier le template" : "Nouveau template"}
      subtitle={editing ? editing.name : "Créer un template vierge"}
      size="lg"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit(onSubmit)}
            loading={loading}
          >
            {editing ? "Enregistrer les modifications" : "Créer le template"}
          </Button>
        </div>
      }
    >
      <form
        className="flex flex-col gap-4 py-2"
        onSubmit={handleSubmit(onSubmit)}
      >
        {/* ── Row 1: metadata fields ── */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nom du template *"
            placeholder="ex: Confirmation de commande"
            error={errors.name?.message}
            {...register("name")}
          />

          <Input
            label="Sujet (email)"
            placeholder="ex: Votre commande {{order_id}} est confirmée"
            error={errors.subject?.message}
            {...register("subject")}
          />

          <Select
            label="Catégorie"
            error={errors.category?.message}
            {...register("category")}
            options={[
              { value: "", label: "— Aucune —" },
              { value: "Transactionnel", label: "Transactionnel" },
              { value: "Marketing", label: "Marketing" },
              { value: "Bienvenue", label: "Bienvenue" },
              { value: "Notification", label: "Notification" },
            ]}
          />

          <Select
            disabled={!!editing?.productId}
            label="Produit"
            error={errors.productId?.message}
            {...register("productId")}
            options={products?.map((p) => ({ value: p.id, label: p.name }))}
          />

          <Select
            label="Langue"
            error={errors.language?.message}
            {...register("language")}
            options={[
              { value: "fr", label: "Français (FR)" },
              { value: "en", label: "English (EN)" },
            ]}
          />

          <Select
            label="Statut initial"
            error={errors.status?.message}
            {...register("status")}
            options={[
              { value: "active", label: "Actif" },
              { value: "draft", label: "Brouillon" },
              { value: "archived", label: "Archivé" },
            ]}
          />
        </div>

        {/* ── Quill editor ── */}
        <div>
          <label className="block text-[12.5px] font-medium text-[#0D2137] mb-1.5">
            Contenu du message *
          </label>
          <div
            className={`border rounded-md overflow-hidden ${
              hasContentError
                ? "border-red-300 tpl-modal-quill-error"
                : "border-[#E5E7EB]"
            }`}
          >
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <div className="tpl-modal-quill">
                  <ReactQuill
                    ref={quillRef}
                    theme="snow"
                    value={field.value || ""}
                    onChange={(html) =>
                      // Store empty string instead of Quill's empty <p><br></p>
                      field.onChange(
                        html === "<p><br></p>" ? "" : html
                      )
                    }
                    onBlur={field.onBlur}
                    modules={QUILL_MODULES}
                    formats={QUILL_FORMATS}
                    placeholder="Rédigez votre message ici. Utilisez {{variable}} pour les données dynamiques…"
                  />
                </div>
              )}
            />
          </div>
          {hasContentError && (
            <p className="text-[11.5px] text-red-500 mt-1">
              {errors.content?.message}
            </p>
          )}
        </div>

        {/* ── Variable pills ── */}
        <div className="bg-[#F7F8F9] rounded-md p-3 border border-[#E5E7EB]">
          <p className="text-[11px] font-medium text-[#8BAFC0] uppercase tracking-wider mb-2">
            Variables disponibles — cliquez pour insérer
          </p>
          <div className="flex flex-wrap gap-2">
            {VARIABLES.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => insertVariable(v)}
                className="text-[11px] px-2 py-1 bg-white border border-[#E5E7EB] rounded-full text-[#E8541A] font-mono cursor-pointer hover:bg-[#FFF0EA] hover:border-[#E8541A]/30 transition-all"
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
}
