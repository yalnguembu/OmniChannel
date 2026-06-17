import React from "react";
import {
  RefreshCw,
  Upload,
  MessageSquarePlus,
} from "lucide-react";
import { IconButton } from "../shared/IconButton";

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
  // The active sender is now selected from the portal sidebar and carried in
  // the URL (`/wa/$senderId`) — no in-header sender picker.
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
