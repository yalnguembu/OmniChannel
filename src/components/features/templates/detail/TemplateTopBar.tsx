import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Copy, Trash2, Save } from "lucide-react";
import { statusLabel } from "@/lib/utils";
import type { TemplateModel } from "@/models/template.model";

const statusV = (s: string) =>
  s === "active" ? "success" : s === "archived" ? "neutral" : "warning";

interface TemplateTopBarProps {
  template: TemplateModel;
  isDirty: boolean;
  isSaving: boolean;
  onSave: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function TemplateTopBar({
  template,
  isDirty,
  isSaving,
  onSave,
  onDuplicate,
  onDelete,
}: TemplateTopBarProps) {
  return (
    <div className="h-[52px] bg-white border-b border-[#E5E7EB] flex items-center justify-between px-5 shrink-0">
      {/* Left: name + badge */}
      <div className="flex items-center gap-2.5">
        <span className="text-[14px] font-medium text-[#0D2137]">
          {template.name}
        </span>
        <Badge
          variant={statusV(template.status || "draft")}
          className="text-[10px]"
        >
          {statusLabel(template.status || "draft")}
        </Badge>
        {isDirty && !isSaving && (
          <span className="text-[11px] text-[#8BAFC0] italic">
            · modifications non sauvegardées
          </span>
        )}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onDuplicate}>
          <Copy size={13} /> Dupliquer
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={onSave}
          loading={isSaving}
          disabled={!isDirty && !isSaving}
        >
          <Save size={13} /> Sauvegarder
        </Button>

        <Button variant="danger" size="sm" onClick={onDelete}>
          <Trash2 size={13} />
        </Button>
      </div>
    </div>
  );
}
