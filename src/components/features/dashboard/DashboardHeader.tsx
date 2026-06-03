import React from "react";
import { motion } from "framer-motion";
import { Bell, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { fadeInUp } from "@/lib/animations";

export function DashboardHeader({
  notificationsCount,
  onNewCampaign,
}: {
  notificationsCount: number;
  onNewCampaign: () => void;
}) {
  return (
    <motion.div
      {...fadeInUp}
      className="flex items-center justify-between mb-8"
    >
      <div>
        <h1 className="text-[26px] font-bold text-[#0D2137] tracking-tight">
          Bonjour ! 👋
        </h1>
        <p className="text-[14px] text-[#4A7A94] mt-1 font-medium">
          Voici ce qui se passe sur votre plateforme aujourd'hui.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="md"
          className="bg-white border-[#E5E7EB] hover:bg-[#F3F4F6] text-[#4A7A94] font-bold h-11 px-5 border hover:shadow-sm"
        >
          <Bell size={18} className="mr-2" /> Notifications
          {notificationsCount > 0 && (
            <span className="ml-2 w-2 h-2 bg-[#DC2626] rounded-full" />
          )}
        </Button>
        <Button
          variant="primary"
          size="md"
          className="h-11 px-6 shadow-lg shadow-[#0D2137]/10 font-bold gap-2"
          onClick={onNewCampaign}
        >
          <Send size={18} /> Nouvelle campagne
        </Button>
      </div>
    </motion.div>
  );
}
