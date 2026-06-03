import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Copy } from "lucide-react";
import { TemplateSchema, type TemplateModel } from "@/models/template.model";
import type { ChannelModel } from "@/models/channel.model";
import type { TemplateChannelDto } from "@/shared/api/generated/types.gen";

import { TemplateTopBar } from "./detail/TemplateTopBar";
import { TemplateInfoCard } from "./detail/TemplateInfoCard";
import { TemplateSubjectCard } from "./detail/TemplateSubjectCard";
import { AIPromptBox } from "./detail/AIPromptBox";
import { TemplateContentEditor } from "./detail/TemplateContentEditor";
import { TemplatePreviewSidebar } from "./detail/TemplatePreviewSidebar";

interface TemplateDetailProps {
  template: TemplateModel;
  tplChannels: TemplateChannelDto[];
  channels: ChannelModel[];
  onEdit: (template: TemplateModel) => void;
  onDuplicate: (template: TemplateModel) => void;
  onDelete: (template: TemplateModel) => void;
  onToggleChannel: (channelId: string, linked: boolean) => void;
  onSave: (template: TemplateModel, data: Partial<TemplateModel>) => void;
  isSaving?: boolean;
}

export function TemplateDetail({
  template,
  tplChannels,
  channels,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleChannel,
  onSave,
  isSaving,
}: TemplateDetailProps) {
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { isDirty },
  } = useForm<TemplateModel>({
    resolver: zodResolver(TemplateSchema),
    defaultValues: template,
  });

  // Reset form whenever the selected template changes
  useEffect(() => {
    reset(template);
  }, [template.id, reset]);

  const handleSave = handleSubmit((data) => {
    onSave(template, data);
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Top bar */}
      <TemplateTopBar
        template={template}
        isDirty={isDirty}
        isSaving={!!isSaving}
        onSave={handleSave}
        onDuplicate={() => setShowDuplicateModal(true)}
        onDelete={() => onDelete(template)}
      />

      {/* Two-column body */}
      <div
        className="flex-1 grid overflow-y-auto"
        style={{ gridTemplateColumns: "1fr 300px" }}
      >
        {/* ── Editor Main ── */}
        <div
          className="overflow-y-auto p-5 flex flex-col gap-4 bg-[#F4F5F6]"
          style={{ scrollbarWidth: "thin" } as React.CSSProperties}
        >
          <TemplateInfoCard register={register} control={control} />

          <TemplateSubjectCard register={register} />

          <AIPromptBox />
          <div className="min-h-[400px]">
            <TemplateContentEditor control={control} />
          </div>
        </div>

        {/* ── Editor Sidebar ── */}
        <TemplatePreviewSidebar
          template={template}
          tplChannels={tplChannels}
          channels={channels}
          onToggleChannel={onToggleChannel}
        />
      </div>

      {/* ── Duplicate confirmation modal ── */}
      <Modal
        open={showDuplicateModal}
        onClose={() => setShowDuplicateModal(false)}
        title="Dupliquer le template"
        subtitle="Une copie sera créée comme brouillon"
        size="sm"
        footer={
          <div className="flex gap-2 justify-end">
            <Button
              variant="secondary"
              onClick={() => setShowDuplicateModal(false)}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                onDuplicate(template);
                setShowDuplicateModal(false);
              }}
            >
              <Copy size={13} /> Dupliquer
            </Button>
          </div>
        }
      >
        <div className="py-2">
          <p className="text-[14px] text-[#4A7A94] leading-relaxed">
            Voulez-vous créer une copie de{" "}
            <strong className="text-[#0D2137]">{template.name}</strong> ? Le
            nouveau template sera créé en brouillon.
          </p>
        </div>
      </Modal>
    </div>
  );
}
