import { useCallback, useRef } from "react";
import { Controller, type Control } from "react-hook-form";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Sparkles } from "lucide-react";
import type { TemplateModel } from "@/models/template.model";

// ── Custom variable blot ─────────────────────────────────────────────────────
const Inline = Quill.import("blots/inline") as any;
class VariableBlot extends Inline {
  static blotName = "variable";
  static tagName = "span";
  static create(value: string) {
    const node = super.create();
    node.setAttribute("data-variable", value);
    node.classList.add("ql-variable-blot");
    node.textContent = value;
    return node;
  }
  static formats(node: HTMLElement) {
    return node.getAttribute("data-variable");
  }
}
// Guard: Quill registers globally — only once
// if (!Quill.imports["formats/variable"]) {
//   Quill.register(VariableBlot);
// }

// ── Global styles (injected once) ────────────────────────────────────────────
const STYLE_ID = "tpl-editor-styles";
if (typeof document !== "undefined" && !document.getElementById(STYLE_ID)) {
  const s = document.createElement("style");
  s.id = STYLE_ID;
  s.textContent = `
    .ql-variable-blot {
      display: inline-flex; align-items: center; padding: 1px 7px;
      border-radius: 999px; background: #FFF0EA; color: #E8541A;
      border: 0.5px solid rgba(232,84,26,0.2);
      font-family: 'JetBrains Mono', monospace; font-size: 12px;
      cursor: pointer; user-select: all; white-space: nowrap;
    }
    .ql-variable-blot:hover { background: #F28A5F; color: #fff; }
    .tpl-quill .ql-toolbar {
      border: none !important; border-bottom: 0.5px solid #E5E7EB !important;
      background: #F7F8F9; padding: 6px 10px;
    }
    .tpl-quill .ql-container { border: none !important; font-size: 13.5px; color: #0D2137; }
    .tpl-quill .ql-editor { min-height: 180px; line-height: 1.7; padding: 14px; }
    .tpl-quill .ql-editor.ql-blank::before { color: #8BAFC0; font-style: normal; }
    .tpl-quill .ql-stroke { stroke: #4A7A94 !important; }
    .tpl-quill .ql-fill   { fill:   #4A7A94 !important; }
    .tpl-quill .ql-picker  { color:  #4A7A94 !important; }
    .tpl-quill button:hover .ql-stroke,
    .tpl-quill button.ql-active .ql-stroke { stroke: #0D2137 !important; }
    .tpl-quill button:hover .ql-fill,
    .tpl-quill button.ql-active .ql-fill   { fill:   #0D2137 !important; }
  `;
  document.head.appendChild(s);
}

// ── Constants ────────────────────────────────────────────────────────────────
const VARIABLES = [
  "{{customer_name}}",
  "{{order_id}}",
  "{{order_amount}}",
  "{{delivery_date}}",
  "{{tracking_url}}",
  "{{first_name}}",
  "{{phone}}",
];

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
    ["clean"],
  ],
  clipboard: { matchVisual: false },
};

const QUILL_FORMATS = [
  "header", "bold", "italic", "underline", "strike",
  "color", "background", "list", "bullet", "link", "variable",
];

// ── Component ────────────────────────────────────────────────────────────────
interface TemplateContentEditorProps {
  control: Control<TemplateModel>;
}

export function TemplateContentEditor({ control }: TemplateContentEditorProps) {
  const quillRef = useRef<ReactQuill>(null);

  /** Insert a variable pill at the current Quill cursor */
  const insertVariable = useCallback((variable: string) => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;
    const range = quill.getSelection(true);
    quill.insertText(range.index, variable, "variable", variable);
    quill.setSelection(range.index + variable.length, 0);
  }, []);

  return (
    <Controller
      name="content"
      control={control}
      render={({ field, fieldState }) => {
        // Character count from plain text
        const charCount = (field.value || "")
          .replace(/<[^>]*>/g, "")
          .replace(/&nbsp;/g, " ").length;

        return (
          <div className="bg-white border border-[#E5E7EB] rounded-[14px] overflow-hidden">
            {/* Card header */}
            <div className="px-4 py-3 border-b border-[#E5E7EB] bg-[#F7F8F9] flex items-center justify-between">
              <span className="text-[12.5px] font-medium text-[#0D2137]">
                Contenu du message
              </span>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-[#8BAFC0]">
                  {charCount} caractères
                </span>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-[11px] font-medium text-[#7C3AED] border border-[#C4B5FD]/60 hover:bg-[#EDE9FE] transition-all cursor-pointer"
                  style={{ background: "rgba(196,181,253,0.15)" }}
                >
                  <Sparkles size={10} /> IA
                </button>
              </div>
            </div>

            {/* Quill */}
            <div className={`tpl-quill ${fieldState.error ? "border border-red-300 rounded-b-[14px]" : ""}`}>
              <ReactQuill
                ref={quillRef}
                theme="snow"
                value={field.value || ""}
                onChange={(html) =>
                  field.onChange(html === "<p><br></p>" ? "" : html)
                }
                onBlur={field.onBlur}
                modules={QUILL_MODULES}
                formats={QUILL_FORMATS}
                placeholder="Rédigez votre message ici. Utilisez les variables pour les données dynamiques…"
              />
            </div>
            {fieldState.error && (
              <p className="px-4 py-1.5 text-[11.5px] text-red-500 border-t border-red-100">
                {fieldState.error.message}
              </p>
            )}

            {/* Variable pills */}
            <div className="px-4 py-3 border-t border-[#E5E7EB] bg-[#FAFBFC]">
              <p className="text-[11.5px] text-[#8BAFC0] mb-2">
                Variables disponibles — cliquez pour insérer
              </p>
              <div className="flex flex-wrap gap-1.5">
                {VARIABLES.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => insertVariable(v)}
                    className="inline-flex items-center text-[11.5px] px-2.5 py-1 rounded-full bg-[#FFF0EA] text-[#E8541A] border border-[#E8541A]/20 cursor-pointer font-mono hover:bg-[#F28A5F] hover:text-white transition-all"
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      }}
    />
  );
}
