interface SectionTagProps {
  children: string;
  light?: boolean;
}

export function SectionTag({ children, light = false }: SectionTagProps) {
  return (
    <p
      className={`font-body text-[11px] font-medium tracking-[0.1em] uppercase mb-3.5 ${
        light ? "text-white/45" : "text-[#2E8FAD]"
      }`}
    >
      — {children} —
    </p>
  );
}
