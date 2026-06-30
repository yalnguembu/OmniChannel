import React from "react";
import { RefreshCw, Upload, MessageSquarePlus } from "lucide-react";
import { IconButton } from "../shared/IconButton";

interface SidebarHeaderProps {
  onRefresh: () => void;
  onTemplateBroadcast: () => void;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  onRefresh,
  onTemplateBroadcast,
}) => {
  return (
    <div className="bg-wa-header px-3 pt-2.5 flex items-center gap-2 min-h-auto shrink-0">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <img src="/logo-whatsapp.png" alt="WhatsApp" className="size-12" />
          <span className="text-wa-green-send font-semibold text-2xl leading-none select-none">
            Omni WhatsApp
          </span>
        </div>
      </div>
      <div className="flex items-center gap-0.5">
        <IconButton label="Diffusion de template" onClick={onTemplateBroadcast}>
          <MessageSquarePlus size={20} />
        </IconButton>
        <IconButton label="Actualiser" onClick={onRefresh}>
          <RefreshCw size={20} />
        </IconButton>
      </div>
    </div>
  );
};
