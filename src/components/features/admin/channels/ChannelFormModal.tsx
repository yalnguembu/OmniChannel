import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import type {
  CreateChannelRequest,
  SearchChannelResponse,
} from "@/shared/api/generated/types.gen";

const schema = z.object({
  name: z.string().min(1, "Nom requis"),
  code: z.string().min(1, "Code requis"),
  maxLength: z.coerce.number().optional(),
  supportsRichContent: z.boolean().default(false),
  supportsAttachments: z.boolean().default(false),
  requiresOptIn: z.boolean().default(false),
  isActive: z.boolean().default(true),
});
type FormValues = z.infer<typeof schema>;

interface ChannelFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editing: SearchChannelResponse | null;
  onSubmit: (data: CreateChannelRequest) => void;
  isPending: boolean;
}

export function ChannelFormModal({
  isOpen,
  onClose,
  editing,
  onSubmit,
  isPending,
}: ChannelFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      code: "",
      supportsRichContent: false,
      supportsAttachments: false,
      requiresOptIn: false,
      isActive: true,
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: editing?.name ?? "",
        code: editing?.code ?? "",
        maxLength: editing?.maxContentLength ?? undefined,
        supportsRichContent: editing?.supportsRichContent ?? false,
        supportsAttachments: editing?.supportsAttachments ?? false,
        requiresOptIn: editing?.requiresOptIn ?? false,
        isActive: editing?.isActive ?? true,
      });
    }
  }, [isOpen, editing, reset]);

  const supportsRichContent = watch("supportsRichContent");
  const supportsAttachments = watch("supportsAttachments");
  const requiresOptIn = watch("requiresOptIn");
  const isActive = watch("isActive");

  const submit = ({ maxLength, ...rest }: FormValues) =>
    onSubmit({ ...rest, maxContentLength: maxLength } satisfies CreateChannelRequest);

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={editing ? `Modifier — ${editing.name}` : "Nouveau canal"}
      subtitle={
        editing ? (editing.code ?? "") : "Configurez un canal de communication"
      }
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit(submit)}
            loading={isPending}
          >
            {editing ? "Enregistrer" : "Créer"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Nom *"
            error={errors.name?.message}
            {...register("name")}
            placeholder="ex : SMS"
          />
          <Input
            label="Code *"
            error={errors.code?.message}
            {...register("code")}
            placeholder="ex : SMS"
          />
        </div>
        <Input
          label="Longueur max (chars)"
          type="number"
          {...register("maxLength")}
          placeholder="ex : 160"
        />
        {[
          {
            label: "Contenu riche",
            desc: "Images, vidéos, boutons",
            val: supportsRichContent,
            set: (v: boolean) => setValue("supportsRichContent", v),
          },
          {
            label: "Pièces jointes",
            desc: "Fichiers PDF, médias",
            val: supportsAttachments,
            set: (v: boolean) => setValue("supportsAttachments", v),
          },
          {
            label: "Opt-in requis",
            desc: "Consentement explicite de l'abonné",
            val: requiresOptIn,
            set: (v: boolean) => setValue("requiresOptIn", v),
          },
          {
            label: "Canal actif",
            desc: "Disponible sur la plateforme",
            val: isActive,
            set: (v: boolean) => setValue("isActive", v),
          },
        ].map(({ label, desc, val, set }) => (
          <div
            key={label}
            className="flex items-center justify-between p-3.5 bg-[#F7F8F9] border border-[#E5E7EB] rounded-md"
          >
            <div>
              <p className="text-[13px] font-medium text-[#0D2137]">{label}</p>
              <p className="text-[12px] text-[#8BAFC0] mt-0.5">{desc}</p>
            </div>
            <Toggle checked={val} onChange={set} />
          </div>
        ))}
      </div>
    </Modal>
  );
}
