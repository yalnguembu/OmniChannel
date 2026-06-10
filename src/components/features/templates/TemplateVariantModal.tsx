import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getApiTemplateChannelVariantByIdOptions,
  putApiTemplateChannelVariantMutation,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { PageLoader } from "@/components/feedback/PageLoader";
import { Badge } from "@/components/ui/Badge";
import type {
  TemplateVariantResponse,
  UpdateTemplateVariantRequest,
} from "@/shared/api/generated/types.gen";

interface TemplateVariantModalProps {
  open: boolean;
  onClose: () => void;
  /** ID of the TemplateChannel record (not the template ID) */
  templateChannelId: string | null;
}

interface VariantForm {
  subject: string;
  body: string;
}

export function TemplateVariantModal({
  open,
  onClose,
  templateChannelId,
}: TemplateVariantModalProps) {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    ...getApiTemplateChannelVariantByIdOptions({
      path: { id: templateChannelId! },
    }),
    select: (res) => res?.data as TemplateVariantResponse | undefined,
    enabled: !!templateChannelId && open,
  });

  const { register, handleSubmit, reset, setValue, watch } = useForm<VariantForm>({
    defaultValues: { subject: "", body: "" },
  });

  // Sync form when data loads
  useEffect(() => {
    if (data) {
      reset({
        subject: data.subject || "",
        body: data.body || "",
      });
    }
  }, [data, reset]);

  const saveMutation = useMutation({
    ...putApiTemplateChannelVariantMutation(),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: getApiTemplateChannelVariantByIdOptions({
          path: { id: templateChannelId! },
        }).queryKey,
      });
      toast.success("Contenu du canal mis à jour");
      onClose();
    },
    onError: () => toast.error("Erreur lors de la sauvegarde"),
  });

  const onSubmit = (values: VariantForm) => {
    if (!data?.id) return;
    const body: UpdateTemplateVariantRequest = {
      id: data.id,
      subject: values.subject || undefined,
      body: values.body || undefined,
      status: data.status,
      structure: data.structure,
      variables: data.variables,
    };
    saveMutation.mutate({ body });
  };

  const bodyLength = (watch("body") || "").length;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Contenu du canal"
      subtitle={data?.language ? `Langue : ${data.language?.toUpperCase()}` : undefined}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="primary"
            loading={saveMutation.isPending}
            onClick={handleSubmit(onSubmit)}
          >
            Enregistrer
          </Button>
        </>
      }
    >
      {isLoading ? (
        <div className="py-8">
          <PageLoader />
        </div>
      ) : (
        <div className="space-y-4 py-2">
          {/* Provider status badge */}
          {data?.providerStatus && (
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[#8BAFC0]">Statut provider :</span>
              <Badge variant="neutral">{data.providerStatus}</Badge>
            </div>
          )}

          {/* Subject (email) */}
          <Input
            label="Sujet (email)"
            placeholder="Objet du message email"
            {...register("subject")}
          />

          {/* Body */}
          <div>
            <label className="block text-[12px] font-medium text-[#4A7A94] mb-1.5">
              Corps du message
            </label>
            <Textarea
              placeholder="Contenu du message…"
              {...register("body")}
              className="min-h-[160px] font-mono text-[13px]"
            />
            <p className="text-[11px] text-[#8BAFC0] mt-1 text-right">
              {bodyLength} caractère{bodyLength > 1 ? "s" : ""}
              {bodyLength > 160 && (
                <span className="text-[#D97706] ml-1">
                  ({Math.ceil(bodyLength / 160)} SMS)
                </span>
              )}
            </p>
          </div>

          {/* Variables */}
          {data?.variables && data.variables.length > 0 && (
            <div>
              <p className="text-[12px] font-medium text-[#4A7A94] mb-1.5">
                Variables disponibles
              </p>
              <div className="flex flex-wrap gap-1.5">
                {data.variables.map((v) => {
                  const varName = v.name ?? "";
                  return (
                    <button
                      key={varName}
                      type="button"
                      onClick={() =>
                        setValue("body", `${watch("body")}{{${varName}}}`)
                      }
                      className="px-2 py-0.5 bg-[#E8F4F8] text-[#2E8FAD] text-[11.5px] font-mono rounded-md hover:bg-[#D0EAF5] transition-colors cursor-pointer"
                    >
                      {`{{${varName}}}`}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Provider template name (read-only) */}
          {data?.providerTemplateName && (
            <div className="p-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[8px]">
              <p className="text-[11.5px] text-[#8BAFC0] mb-0.5">Template provider</p>
              <p className="text-[12.5px] font-mono text-[#4A7A94]">
                {data.providerTemplateName}
              </p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
