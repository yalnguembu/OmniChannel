import { useState } from "react";
import { Toggle } from "@/components/ui/Toggle";
import { FileText, Sparkles, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { statusLabel } from "@/lib/utils";
import { formatDate, formatRelative } from "@/lib/date";
import type { TemplateModel } from "@/models/template.model";
import type { ChannelModel } from "@/models/channel.model";
import type { SearchTemplateChannelResponse } from "@/shared/api/generated/types.gen";

const AI_SUGGESTIONS = [
  {
    title: "Ton plus chaleureux",
    desc: "Réécriture avec emojis et formule de politesse renforcée",
  },
  {
    title: "Version courte SMS",
    desc: "Condensé en 160 caractères, lien raccourci inclus",
  },
  {
    title: "Variante promotionnelle",
    desc: "Ajout d'une réduction 10% en fin de message",
  },
];

interface TemplatePreviewSidebarProps {
  template: TemplateModel;
  tplChannels: SearchTemplateChannelResponse[];
  channels: ChannelModel[];
  onToggleChannel: (channelId: string, linked: boolean) => void;
  onEditVariant?: (templateChannelId: string) => void;
}

export function TemplatePreviewSidebar({
  template,
  tplChannels,
  channels,
  onToggleChannel,
  onEditVariant,
}: TemplatePreviewSidebarProps) {
  return (
    <div
      className="border-l border-[#E5E7EB] bg-white overflow-y-auto flex flex-col"
      style={{ scrollbarWidth: "thin" }}
    >
      {/* ── Aperçu ── */}
      <div className="border-b border-[#E5E7EB]">
        <p className="px-4 pt-3 pb-0 text-[11px] font-semibold text-[#B8CDD8] uppercase tracking-[0.08em]">
          Aperçu
        </p>

        {/* Phone mockup */}
        <div className="p-4 flex justify-center">
          <p className="text-md text-[#0D2137] bg-gray-100 rounded-md p-3 leading-relaxed whitespace-pre-wrap">
            {template.content?.slice(0, 200)}
          </p>
        </div>
      </div>

      {/* ── Canaux associés ── */}
      <div className="border-b border-[#E5E7EB]">
        <div className="px-4 py-3">
          <span className="text-[12.5px] font-medium text-[#0D2137]">
            Canaux associés
          </span>
        </div>
        <div className="px-4 pb-3 flex flex-col">
          {channels.length === 0 ? (
            <p className="text-[12px] text-[#8BAFC0]">Aucun canal configuré</p>
          ) : (
            channels.map((ch) => {
              const tc = (tplChannels || []).find((x) => x.channelId === ch.id);
              const linked = !!tc;
              return (
                <div
                  key={ch.id}
                  className="flex items-center gap-2.5 py-2 border-b border-[#E5E7EB] last:border-0"
                >
                  <div className="w-7 h-7 rounded-[8px] bg-[#E8F4F8] flex items-center justify-center shrink-0">
                    <FileText size={13} className="text-[#2E8FAD]" />
                  </div>
                  <span className="text-[13px] font-medium text-[#0D2137] flex-1">
                    {ch.name}
                  </span>
                  {linked && onEditVariant && tc?.id && (
                    <button
                      onClick={() => onEditVariant(tc.id!)}
                      className="p-1 text-[#8BAFC0] hover:text-[#1B5E82] hover:bg-[#E8F4F8] rounded transition-colors"
                      title="Modifier le contenu"
                    >
                      <Pencil size={12} />
                    </button>
                  )}
                  <Toggle
                    checked={linked}
                    onChange={() => onToggleChannel(ch.id, linked)}
                  />
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Métadonnées ── */}
      <div className="border-b border-[#E5E7EB]">
        <div className="px-4 py-3">
          <span className="text-[12.5px] font-medium text-[#0D2137]">
            Métadonnées
          </span>
        </div>
        <div className="px-4 pb-3 flex flex-col">
          {[
            {
              key: "Créé le",
              val: template.createdAt ? formatDate(template.createdAt) : "—",
            },
            {
              key: "Modifié",
              val: template.updatedAt
                ? formatRelative(template.updatedAt)
                : "—",
            },
            { key: "Statut", val: statusLabel(template.status || "draft") },
            { key: "Langue", val: template.language?.toUpperCase() || "—" },
          ].map(({ key, val }) => (
            <div
              key={key}
              className="flex items-center justify-between py-1.5 border-b border-[#E5E7EB] last:border-0"
            >
              <span className="text-[12px] text-[#8BAFC0]">{key}</span>
              <span className="text-[12.5px] text-[#0D2137]">{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Suggestions IA ── */}
      <div className="flex-1">
        <div className="px-4 py-3 flex items-center gap-1.5">
          <Sparkles size={12} className="text-[#7C3AED]" />
          <span className="text-[12.5px] font-medium text-[#0D2137]">
            Suggestions IA
          </span>
        </div>
        <div className="px-4 pb-4 flex flex-col">
          {AI_SUGGESTIONS.map(({ title, desc }) => (
            <div
              key={title}
              className="py-2 border-b border-[#E5E7EB] last:border-0 cursor-pointer"
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <Sparkles size={10} className="text-[#7C3AED] opacity-60" />
                <p className="text-[12.5px] font-medium text-[#7C3AED]">
                  {title}
                </p>
              </div>
              <p className="text-[11.5px] text-[#8BAFC0]">{desc}</p>
            </div>
          ))}
          <button className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-full border border-[#C4B5FD] text-[12px] text-[#7C3AED] bg-transparent cursor-pointer hover:bg-[#F3F0FF] transition-all">
            <Sparkles size={11} /> Générer une nouvelle variante
          </button>
        </div>
      </div>
    </div>
  );
}
