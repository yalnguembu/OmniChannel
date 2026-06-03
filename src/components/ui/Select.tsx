import { cn } from "@/lib/utils";
import { type SelectHTMLAttributes, forwardRef, type ReactNode } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  label?: string;
  hint?: string;
  placeholder?: string;
  prefixIcon?: ReactNode;
  options?: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      error,
      label,
      hint,
      placeholder,
      prefixIcon,
      options,
      className,
      id,
      children,
      ...props
    },
    ref,
  ) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="text-[12.5px] font-medium text-[#0D2137]"
          >
            {label}
          </label>
        )}
        <div className="relative group">
          {prefixIcon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8BAFC0] group-focus-within:text-[#2E8FAD] transition-colors pointer-events-none z-10">
              {prefixIcon}
            </div>
          )}
          <select
            ref={ref}
            id={selectId}
            className={cn(
              "w-full px-3 py-2 pr-10 border rounded-[10px] text-[13px] text-[#0D2137] bg-white outline-none transition-all duration-150 cursor-pointer appearance-none",
              prefixIcon && "pl-10",
              error
                ? "border-[#FCA5A5] focus:border-[#DC2626]"
                : "border-[#E5E7EB] focus:border-[#2E8FAD] focus:shadow-[0_0_0_3px_rgba(46,143,173,0.1)]",
              className,
            )}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options
              ? options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))
              : children}
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#8BAFC0]">
            <svg
              width="10"
              height="6"
              viewBox="0 0 10 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 1l4 4 4-4" />
            </svg>
          </div>
        </div>
        {hint && !error && (
          <p className="text-[11.5px] text-[#8BAFC0] leading-relaxed">{hint}</p>
        )}
        {error && <p className="text-[11.5px] text-[#DC2626]">{error}</p>}
      </div>
    );
  },
);

Select.displayName = "Select";
