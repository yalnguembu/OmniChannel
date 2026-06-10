import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Trash2, Plus } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import type {
  ConfigureIntegrationRequest,
  IntegrationAuthConfig,
  SearchIntegrationResponse,
} from "@/shared/api/generated/types.gen";
import { IntegrationAuthType, ApiKeyLocation } from "@/shared/api/generated/types.gen";

const schema = z.object({
  baseUrl: z.string().url("URL valide requise").optional().or(z.literal("")),
  authType: z.nativeEnum(IntegrationAuthType).default(IntegrationAuthType.NONE),
  token: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  apiKey: z.string().optional(),
  apiKeyName: z.string().optional(),
  apiKeyLocation: z.nativeEnum(ApiKeyLocation).default(ApiKeyLocation.HEADER),
  apiKeyPrefix: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

type Pair = { key: string; value: string };

function PairEditor({
  label,
  pairs,
  setter,
  keyPlaceholder,
  disabled,
}: {
  label: string;
  pairs: Pair[];
  setter: React.Dispatch<React.SetStateAction<Pair[]>>;
  keyPlaceholder: string;
  disabled: boolean;
}) {
  const update = (index: number, field: keyof Pair, value: string) =>
    setter((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    );
  const add = () => setter((prev) => [...prev, { key: "", value: "" }]);
  const remove = (index: number) =>
    setter((prev) => prev.filter((_, i) => i !== index));

  return (
    <div className="border-t border-[#E5E7EB] pt-4">
      <div className="flex items-center justify-between mb-3">
        <label className="text-[13px] font-medium text-[#0D2137]">{label}</label>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={add}
          disabled={disabled}
        >
          <Plus size={13} />
          Ajouter
        </Button>
      </div>
      <div className="space-y-2">
        {pairs.length === 0 && (
          <p className="text-[12px] text-[#8BAFC0]">Aucune entrée</p>
        )}
        {pairs.map((pair, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={pair.key}
              onChange={(e) => update(index, "key", e.target.value)}
              placeholder={keyPlaceholder}
              className="flex-1"
            />
            <Input
              value={pair.value}
              onChange={(e) => update(index, "value", e.target.value)}
              placeholder="Valeur"
              className="flex-1"
            />
            <Button
              type="button"
              size="sm"
              variant="danger"
              onClick={() => remove(index)}
              disabled={disabled}
            >
              <Trash2 size={13} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ConfigureIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  editing: SearchIntegrationResponse | null;
  onSubmit: (data: ConfigureIntegrationRequest) => void;
  isPending: boolean;
}

export function ConfigureIntegrationModal({
  isOpen,
  onClose,
  editing,
  onSubmit,
  isPending,
}: ConfigureIntegrationModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      baseUrl: "",
      authType: IntegrationAuthType.NONE,
      token: "",
      username: "",
      password: "",
      apiKey: "",
      apiKeyName: "",
      apiKeyLocation: ApiKeyLocation.HEADER,
      apiKeyPrefix: "",
    },
  });

  const authType = watch("authType");
  const [headers, setHeaders] = useState<Pair[]>([]);
  const [settings, setSettings] = useState<Pair[]>([]);

  useEffect(() => {
    if (isOpen) {
      reset({
        baseUrl: "",
        authType: IntegrationAuthType.NONE,
        token: "",
        username: "",
        password: "",
        apiKey: "",
        apiKeyName: "",
        apiKeyLocation: ApiKeyLocation.HEADER,
        apiKeyPrefix: "",
      });
      setHeaders([]);
      setSettings([]);
    }
  }, [isOpen, reset]);

  const toRecord = (pairs: Pair[]): { [key: string]: string } =>
    pairs.reduce<{ [key: string]: string }>((acc, { key, value }) => {
      const k = key.trim();
      if (k) acc[k] = value;
      return acc;
    }, {});

  const handleFormSubmit = (data: FormValues) => {
    const auth: IntegrationAuthConfig = { type: data.authType };

    if (data.authType === IntegrationAuthType.BEARER) {
      auth.token = data.token || null;
    } else if (data.authType === IntegrationAuthType.BASIC) {
      auth.username = data.username || null;
      auth.password = data.password || null;
    } else if (data.authType === IntegrationAuthType.API_KEY) {
      auth.apiKey = data.apiKey || null;
      auth.apiKeyName = data.apiKeyName || null;
      auth.apiKeyLocation = data.apiKeyLocation;
      auth.apiKeyPrefix = data.apiKeyPrefix || null;
    }

    const headerRecord = toRecord(headers);
    if (Object.keys(headerRecord).length > 0) {
      auth.defaultHeaders = headerRecord;
    }

    const settingsRecord = toRecord(settings);

    onSubmit({
      id: editing?.id,
      baseUrl: data.baseUrl || null,
      auth,
      settings:
        Object.keys(settingsRecord).length > 0 ? settingsRecord : null,
    } satisfies ConfigureIntegrationRequest);
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Configurer l'intégration"
      subtitle={editing?.name ?? ""}
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
        <Input
          label="URL de base"
          type="url"
          {...register("baseUrl")}
          placeholder="https://api.example.com"
          error={errors.baseUrl?.message}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-[12.5px] font-medium text-[#0D2137]">
            Type d'authentification
          </label>
          <Select {...register("authType")}>
            <option value={IntegrationAuthType.NONE}>Aucune</option>
            <option value={IntegrationAuthType.BEARER}>Bearer Token</option>
            <option value={IntegrationAuthType.BASIC}>Basic Auth</option>
            <option value={IntegrationAuthType.API_KEY}>API Key</option>
          </Select>
        </div>

        {authType === IntegrationAuthType.BEARER && (
          <Input
            label="Token Bearer"
            type="password"
            {...register("token")}
            placeholder="Entrez le token"
          />
        )}

        {authType === IntegrationAuthType.BASIC && (
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Nom d'utilisateur"
              {...register("username")}
              placeholder="Nom d'utilisateur"
            />
            <Input
              label="Mot de passe"
              type="password"
              {...register("password")}
              placeholder="Mot de passe"
            />
          </div>
        )}

        {authType === IntegrationAuthType.API_KEY && (
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Clé API"
              type="password"
              {...register("apiKey")}
              placeholder="Entrez la clé API"
            />
            <Input
              label="Nom du paramètre"
              {...register("apiKeyName")}
              placeholder="ex : X-API-Key"
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-[12.5px] font-medium text-[#0D2137]">
                Localisation
              </label>
              <Select {...register("apiKeyLocation")}>
                <option value={ApiKeyLocation.HEADER}>En-tête HTTP</option>
                <option value={ApiKeyLocation.QUERY}>
                  Paramètre de requête
                </option>
              </Select>
            </div>
            <Input
              label="Préfixe (optionnel)"
              {...register("apiKeyPrefix")}
              placeholder="ex : Bearer"
            />
          </div>
        )}

        <PairEditor
          label="En-têtes personnalisés"
          pairs={headers}
          setter={setHeaders}
          keyPlaceholder="Nom de l'en-tête"
          disabled={isPending}
        />

        <PairEditor
          label="Paramètres"
          pairs={settings}
          setter={setSettings}
          keyPlaceholder="Clé"
          disabled={isPending}
        />
      </div>
    </Modal>
  );
}
