import { cn } from "@/lib/utils";

interface PrioritySelectorProps {
  value: number;
  onChange: (val: number) => void;
  label?: string;
  disabled?: boolean;
}

export function PrioritySelector({ value, onChange, label, disabled }: PrioritySelectorProps) {
  return (
    <div className="space-y-2">
      {label && <label className="text-[12.5px] font-medium text-[#0D2137]">{label}</label>}
      <div className="flex flex-wrap gap-1.5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
          const isSelected = value === num;
          return (
            <button
              key={num}
              type="button"
              disabled={disabled}
              onClick={() => onChange(num)}
              className={cn(
                "w-8 h-8 rounded-full text-[12px] font-bold transition-all border flex items-center justify-center",
                isSelected
                  ? "bg-[#0D2137] text-white border-[#0D2137] shadow-[0_2px_8px_rgba(13,33,55,0.15)]"
                  : "bg-white text-[#8BAFC0] border-[#E5E7EB] hover:border-[#B8CDD8] hover:text-[#4A7A94]",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {num}
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-[#8BAFC0] italic">
        {value === 1 ? "Priorité minimale" : value === 10 ? "Priorité maximale" : `Niveau ${value}`}
      </p>
    </div>
  );
}
