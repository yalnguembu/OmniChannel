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
    <motion.div {...fadeInUp} className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-[20px] font-semibold text-[#0D2137] tracking-tight">
          Bonjour
        </h1>
        <p className="text-[12.5px] text-[#4A7A94] mt-1">
          Voici ce qui se passe sur votre plateforme aujourd'hui.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="bg-white border border-[#E5E7EB] hover:bg-[#F3F4F6] text-[#4A7A94]"
        >
          <Bell size={15} className="mr-1.5" /> Notifications
          {notificationsCount > 0 && (
            <span className="ml-1.5 w-1.5 h-1.5 bg-[#DC2626] rounded-full" />
          )}
        </Button>
        <Button
          variant="primary"
          size="sm"
          className="gap-1.5"
          onClick={onNewCampaign}
        >
          <Send size={15} /> Nouvelle campagne
        </Button>
      </div>
    </motion.div>
  );
}
