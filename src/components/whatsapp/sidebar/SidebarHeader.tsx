import React from "react";
import {
  RefreshCw,
  Upload,
  MessageSquarePlus,
  MoreVertical,
} from "lucide-react";
import { IconButton } from "../shared/IconButton";
import { Select } from "../../ui/Select";
import { useWhatsAppStore } from "@/store/useWhatsappStore";

interface SidebarHeaderProps {
  onRefresh: () => void;
  onBulkSend: () => void;
  onTemplateBroadcast: () => void;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  onRefresh,
  onBulkSend,
  onTemplateBroadcast,
}) => {
  const { selectedSenderId, setSelectedSenderId, senders } = useWhatsAppStore();
  const senderOptions = senders.map((sender) => ({
    value: sender.id,
    label: sender.senderName,
  }));

  return (
    <div className="bg-wa-header px-3 pt-2.5 flex items-center gap-2 min-h-auto shrink-0">
      <div className="flex-1">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <img src="/logo-whatsapp.png" alt="WhatsApp" className="size-12" />
          <span className="text-wa-green-send font-semibold text-2xl leading-none select-none">
            Omni WhatsApp
          </span>
        </div>
      </div>
      {/* Sender Filter */}
      {senderOptions.length > 0 && (
        <div className="w-30  ">
          <Select
          className="px-1 py-1"
            value={selectedSenderId || ""}
            onChange={(e) => setSelectedSenderId(e.target.value || null)}
            placeholder="Tous"
            options={senderOptions}
          />
        </div>
      )}
      {/* Actions */}
      <div className="flex items-center gap-0.5">
        <IconButton label="Diffusion de template" onClick={onTemplateBroadcast}>
          <MessageSquarePlus size={20} />
        </IconButton>
        <IconButton label="Campagne / Envoi en masse" onClick={onBulkSend}>
          <Upload size={20} />
        </IconButton>
        <IconButton label="Actualiser" onClick={onRefresh}>
          <RefreshCw size={20} />
        </IconButton>
      </div>
    </div>
  );
};
