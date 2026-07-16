import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, ChevronDown, Check, X } from "lucide-react";
import { postApiClientSearchOptions } from "@/shared/api/generated/@tanstack/react-query.gen";
import type { SearchClientResponse } from "@/shared/api/generated/types.gen";

export interface SelectedClient {
  id: string;
  name: string;
  phone: string;
}

interface ClientSelectProps {
  /** Currently selected client id. */
  value: string;
  onChange: (clientId: string, client: SelectedClient | null) => void;
  placeholder?: string;
  /** Scope the search to a product, when relevant. */
  productId?: string;
  /** Seeds the visible selection when the picker opens pre-scoped to a client. */
  initialClient?: SelectedClient;
}

const triggerCls =
  "flex w-full items-center justify-between gap-2 rounded-md border h-11 border-input bg-transparent px-3 py-1 text-base transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

// SearchClientRequest's text filters are mutually exclusive — one criterion maps
// to exactly one field (phone has no dedicated field, so it uses searchTerm).
type Criterion = "lastName" | "firstName" | "phone" | "email";

const CRITERIA: { value: Criterion; label: string; placeholder: string }[] = [
  { value: "lastName", label: "Nom", placeholder: "Nom de famille…" },
  { value: "firstName", label: "Prénom", placeholder: "Prénom…" },
  { value: "phone", label: "Téléphone", placeholder: "Numéro de téléphone…" },
  { value: "email", label: "Email", placeholder: "Adresse email…" },
];

/** Maps a criterion + value to the single SearchClientRequest field it targets. */
function criterionBody(criterion: Criterion, value: string) {
  switch (criterion) {
    case "firstName":
      return { firstName: value };
    case "lastName":
      return { lastName: value };
    case "email":
      return { email: value };
    case "phone":
    default:
      return { searchTerm: value };
  }
}

function fullName(c: SearchClientResponse): string {
  const n = `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim();
  return n || c.email || c.phone || "Client sans nom";
}

/**
 * Searchable client picker (par nom / téléphone / email). Selects a client and
 * emits its id — the addressing key expected by the WhatsApp
 * send-template-to-client endpoint.
 */
export function ClientSelect({
  value,
  onChange,
  placeholder = "Rechercher un client…",
  productId,
  initialClient,
}: ClientSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [criterion, setCriterion] = useState<Criterion>("lastName");
  const [selected, setSelected] = useState<SelectedClient | null>(
    initialClient ?? null,
  );
  const rootRef = useRef<HTMLDivElement>(null);

  // Debounce the search term.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  // Keep the visible selection in sync when the parent clears the value.
  useEffect(() => {
    if (!value) setSelected(null);
  }, [value]);

  // Seed / refresh the display when the caller pre-scopes to a client.
  useEffect(() => {
    if (initialClient && initialClient.id === value) setSelected(initialClient);
  }, [initialClient, value]);

  const clientsQuery = useQuery({
    ...postApiClientSearchOptions({
      body: {
        productId: productId || undefined,
        // Only the selected criterion's field is sent (exclusive filters).
        ...(debounced ? criterionBody(criterion, debounced) : {}),
        pageNumber: 1,
        pageSize: 20,
      },
    }),
    enabled: open,
    select: (res) => (res?.data?.items ?? []) as SearchClientResponse[],
  });

  const clients = useMemo(() => clientsQuery.data ?? [], [clientsQuery.data]);

  const pick = (c: SearchClientResponse) => {
    if (!c.id) return;
    const sel: SelectedClient = {
      id: c.id,
      name: fullName(c),
      phone: c.phone ?? "",
    };
    setSelected(sel);
    onChange(sel.id, sel);
    setOpen(false);
    setSearch("");
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected(null);
    onChange("", null);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={triggerCls}
      >
        <span
          className={`truncate ${selected ? "text-[#0D2137]" : "text-[#667781]"}`}
        >
          {selected
            ? `${selected.name}${selected.phone ? ` · ${selected.phone}` : ""}`
            : placeholder}
        </span>
        <span className="flex items-center gap-1 shrink-0">
          {selected && (
            <span
              role="button"
              tabIndex={0}
              onClick={clear}
              className="text-[#667781] hover:text-[#0D2137]"
            >
              <X size={15} />
            </span>
          )}
          <ChevronDown size={16} className="text-[#667781]" />
        </span>
      </button>

      {open && (
        <div className="absolute z-[300] mt-1 w-full rounded-md border border-input bg-white shadow-lg">
          {/* Critère de recherche — un seul champ exclusif à la fois */}
          <div className="flex gap-1 border-b border-[#E5E7EB] p-2">
            {CRITERIA.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => {
                  setCriterion(c.value);
                  setSearch("");
                }}
                className={`flex-1 rounded-md px-2 py-1 text-xs transition-colors ${
                  criterion === c.value
                    ? "bg-[#25D366]/10 font-medium text-[#0D2137]"
                    : "text-[#667781] hover:bg-muted"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 border-b border-[#E5E7EB] px-3 py-2">
            <Search size={14} className="text-[#8BAFC0] shrink-0" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                CRITERIA.find((c) => c.value === criterion)?.placeholder
              }
              className="w-full border-none bg-transparent text-sm text-[#0D2137] outline-none placeholder:text-[#8BAFC0]"
            />
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {clientsQuery.isLoading ? (
              <div className="px-3 py-4 text-center text-sm text-[#8BAFC0]">
                Chargement…
              </div>
            ) : clients.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-[#8BAFC0]">
                Aucun client trouvé
              </div>
            ) : (
              clients.map((c) => {
                const isSelected = !!c.id && c.id === value;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => pick(c)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-[#F7F8F9]"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-[#0D2137]">
                        {fullName(c)}
                      </div>
                      <div className="truncate text-xs text-[#8BAFC0]">
                        {[c.phone, c.email].filter(Boolean).join(" · ") ||
                          "Aucun contact"}
                      </div>
                    </div>
                    {isSelected && (
                      <Check size={15} className="shrink-0 text-[#25D366]" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
