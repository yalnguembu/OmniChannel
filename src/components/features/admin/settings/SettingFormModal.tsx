import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { Select } from "@/components/ui/Select";
import { RegexInput } from "@/components/ui/RegexInput";
import type {
  CreateSettingRequest,
  SearchSettingResponse,
} from "@/shared/api/generated/types.gen";

const C_SHARP_TYPES = [
  { value: "string", label: "string" },
  { value: "int", label: "int" },
  { value: "long", label: "long" },
  { value: "short", label: "short" },
  { value: "byte", label: "byte" },
  { value: "float", label: "float" },
  { value: "double", label: "double" },
  { value: "decimal", label: "decimal" },
  { value: "bool", label: "bool" },
  { value: "char", label: "char" },
  { value: "DateTime", label: "DateTime" },
  { value: "Guid", label: "Guid" },
  { value: "object", label: "object" },
];

const settingSchema = z.object({
  description: z.string().min(1),
  value: z.string().optional(),
  category: z.string().optional(),
  dataType: z.string().optional(),
  allowedValues: z.string().optional(),
  validationRegex: z.string().optional(),
  isEncrypted: z.boolean().optional(),
  isReadOnly: z.boolean().optional(),
  isSystemSetting: z.boolean().optional(),
});

type FormValues = z.infer<typeof settingSchema>;

// Validation helpers
const validateValue = (value: string, dataType?: string, regex?: string): { valid: boolean; error?: string } => {
  if (!value.trim()) return { valid: false, error: "Valeur vide" };

  // Validate dataType
  if (dataType) {
    switch (dataType) {
      case "int":
      case "long":
      case "short":
      case "byte":
        if (!/^-?\d+$/.test(value)) {
          return { valid: false, error: `"${value}" n'est pas un entier valide` };
        }
        break;
      case "float":
      case "double":
      case "decimal":
        if (!/^-?\d+(\.\d+)?$/.test(value)) {
          return { valid: false, error: `"${value}" n'est pas un nombre décimal valide` };
        }
        break;
      case "bool":
        if (!["true", "false"].includes(value.toLowerCase())) {
          return { valid: false, error: `"${value}" n'est pas un booléen valide (true/false)` };
        }
        break;
      case "DateTime":
        try {
          new Date(value);
        } catch {
          return { valid: false, error: `"${value}" n'est pas une date valide` };
        }
        break;
      case "Guid":
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
          return { valid: false, error: `"${value}" n'est pas un GUID valide` };
        }
        break;
      case "char":
        if (value.length !== 1) {
          return { valid: false, error: `"${value}" doit être un seul caractère` };
        }
        break;
    }
  }

  // Validate regex
  if (regex) {
    try {
      const regexObj = new RegExp(regex);
      if (!regexObj.test(value)) {
        return { valid: false, error: `"${value}" ne correspond pas au pattern ${regex}` };
      }
    } catch (e) {
      return { valid: false, error: `Pattern invalide: ${regex}` };
    }
  }

  return { valid: true };
};

interface SettingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editing: SearchSettingResponse | null;
  onSubmit: (data: CreateSettingRequest) => void;
  isPending: boolean;
}

export function SettingFormModal({
  isOpen,
  onClose,
  editing,
  onSubmit,
  isPending,
}: SettingFormModalProps) {
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(settingSchema),
  });

  const [allowedValuesList, setAllowedValuesList] = useState<string[]>([]);
  const [newAllowedValue, setNewAllowedValue] = useState("");
  const [valueError, setValueError] = useState<string>("");
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isSystemSetting, setIsSystemSetting] = useState(false);

  const dataType = watch("dataType");
  const validationRegex = watch("validationRegex");

  useEffect(() => {
    if (isOpen) {
      const allowedValuesStr = editing?.allowedValues ?? "";
      const valuesList = allowedValuesStr
        .split(",")
        .map(v => v.trim())
        .filter(v => v.length > 0);

      setAllowedValuesList(valuesList);
      setNewAllowedValue("");
      setValueError("");
      setIsEncrypted(editing?.isEncrypted ?? false);
      setIsReadOnly(editing?.isReadOnly ?? false);
      setIsSystemSetting(editing?.isSystemSetting ?? false);

      reset({
        description: editing?.description ?? "",
        value: editing?.value ?? "",
        category: editing?.category ?? "",
        dataType: editing?.dataType ?? "",
        validationRegex: editing?.validationRegex ?? "",
      });
    }
  }, [isOpen, editing, reset]);

  const handleAddAllowedValue = () => {
    const validation = validateValue(newAllowedValue, dataType, validationRegex);
    
    if (!validation.valid) {
      setValueError(validation.error || "Valeur invalide");
      return;
    }

    if (allowedValuesList.includes(newAllowedValue.trim())) {
      setValueError("Cette valeur existe déjà");
      return;
    }

    setAllowedValuesList([...allowedValuesList, newAllowedValue.trim()]);
    setNewAllowedValue("");
    setValueError("");
  };

  const handleRemoveAllowedValue = (index: number) => {
    setAllowedValuesList(allowedValuesList.filter((_, i) => i !== index));
  };

  const handleFormSubmit = (formData: FormValues) => {
    // Validate and map allowed values
    const validatedValues: string[] = [];
    for (const val of allowedValuesList) {
      const validation = validateValue(val, dataType, validationRegex);
      if (!validation.valid) {
        setValueError(`Valeur invalide: ${validation.error}`);
        return;
      }
      validatedValues.push(val);
    }

    const allowedValuesStr = validatedValues.length > 0 ? validatedValues.join(",") : undefined;

    onSubmit({
      ...formData,
      allowedValues: allowedValuesStr,
      isEncrypted,
      isReadOnly,
      isSystemSetting,
    } satisfies CreateSettingRequest);
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={editing?.description ? `Modifier — ${editing?.description}`:"Ajouter un parametre"}
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
            Enregistrer
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input label="Description" placeholder="Ajouter une description" {...register("description")} required disabled={editing?.description !== undefined} />
        <Input
          required
          label="Valeur"
          {...register("value")}
          placeholder="Nouvelle valeur"
        />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Catégorie" placeholder="Ajouter une catégorie" {...register("category")} required />
          <Select
            label="Type de données"
            required
            {...register("dataType")}
            options={C_SHARP_TYPES}
            placeholder="Sélectionner un type"
          />
        </div>

        <RegexInput
          label="Regex de validation"
          value={validationRegex ?? ""}
          onChange={(v) =>
            setValue("validationRegex", v, { shouldDirty: true })
          }
          placeholder="Ex: ^[A-Za-z0-9_-]+$"
        />

        {/* Allowed Values List */}
        <div className="flex flex-col gap-2">
          <label className="text-[12.5px] font-medium text-[#0D2137]">
            Valeurs autorisées
          </label>
          
          <div className="flex gap-2">
            <Input
              value={newAllowedValue}
              onChange={(e) => {
                setNewAllowedValue(e.target.value);
                setValueError("");
              }}
              placeholder="Ajouter une valeur"
              error={valueError}
              className="flex-1"
              // label="Valeurs autorisées"
            />
            <button
              type="button"
              onClick={handleAddAllowedValue}
              className="px-3 py-2 bg-[#2E8FAD] text-white rounded-md text-sm font-medium hover:bg-[#1e5f7d] transition-colors"
            >
              +
            </button>
          </div>

          {allowedValuesList.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {allowedValuesList.map((value, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-[#E8F4F8] border border-[#2E8FAD] rounded-full text-sm text-[#0D2137]"
                >
                  {value}
                  <button
                    type="button"
                    onClick={() => handleRemoveAllowedValue(idx)}
                    className="text-[#DC2626] hover:font-semibold transition-all"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Toggle Fields */}
        <div className="grid md:grid-cols-3 gap-3 border-t pt-3">
          <label className="flex items-center justify-between p-3.5 bg-[#F7F8F9] border border-[#E5E7EB] rounded-md">
            <span className="text-[12.5px] font-medium text-[#0D2137]">Chiffré</span>
            <Toggle
              checked={isEncrypted}
              onChange={setIsEncrypted}
            />
          </label>
          <label className="flex items-center justify-between p-3.5 bg-[#F7F8F9] border border-[#E5E7EB] rounded-md">
            <span className="text-[12.5px] font-medium text-[#0D2137]">Lecture seule</span>
            <Toggle
              checked={isReadOnly}
              onChange={setIsReadOnly}
            />
          </label>
          <label className="flex items-center justify-between p-3.5 bg-[#F7F8F9] border border-[#E5E7EB] rounded-md">
            <span className="text-[12.5px] font-medium text-[#0D2137]">Paramètre système</span>
            <Toggle
              checked={isSystemSetting}
              onChange={setIsSystemSetting}
            />
          </label>
        </div>
      </div>
    </Modal>
  );
}
