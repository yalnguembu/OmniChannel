import { Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";

/** "Installer l'app" — visible only when the browser reports installability. */
export function InstallPwaButton({ className }: { className?: string }) {
  const { canInstall, install } = useInstallPrompt();
  if (!canInstall) return null;

  return (
    <button
      type="button"
      onClick={install}
      title="Installer l'application"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-[#2E8FAD]/30 bg-[#E8F4F8] px-3 py-1.5 text-[12.5px] font-medium text-[#1B5E82] hover:bg-[#DFF0F8] transition-colors whitespace-nowrap",
        className,
      )}
    >
      <Download size={14} strokeWidth={2} />
      Installer l'app
    </button>
  );
}
