import { useQuery } from "@tanstack/react-query";
import { Select } from "@/components/ui/Select";
import {
  getApiFlowDropdownOptions,
  getApiTemplateDropdownOptions,
  getApiSenderDropdownOptions,
  getApiUserDropdownOptions,
  getApiClientSegmentDropdownOptions,
} from "@/shared/api/generated/@tanstack/react-query.gen";

/** Reference entities that have a generated dropdown endpoint. */
export type EntitySource = "flow" | "template" | "sender" | "user" | "segment";

interface EntitySelectProps {
  source: EntitySource;
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Scopes product-filtered dropdowns (template, segment). */
  productId?: string;
  /** Adds a leading empty option (for optional references). */
  allowEmpty?: boolean;
  emptyLabel?: string;
}

interface Item {
  id?: string;
  name?: string | null;
  code?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  // Sender dropdown carries no name/code — it identifies itself by these.
  displayName?: string | null;
  address?: string | null;
}

export function EntitySelect({
  source,
  label,
  value,
  onChange,
  productId,
  allowEmpty = true,
  emptyLabel = "Aucun",
}: EntitySelectProps) {
  // Build the query config for the requested source. Each *Options() call just
  // assembles a config object, so evaluating the map is cheap; only the picked
  // query actually runs.
  const config = {
    flow: getApiFlowDropdownOptions(),
    sender: getApiSenderDropdownOptions(),
    user: getApiUserDropdownOptions(),
    template: getApiTemplateDropdownOptions({
      query: { productid: productId || undefined },
    }),
    segment: getApiClientSegmentDropdownOptions({
      query: { productid: productId || undefined },
    }),
  }[source];

  const { data: items = [] } = useQuery({
    ...config,
    select: (res: any) => (res?.data ?? []) as Item[],
  });

  const options = items
    .filter((it) => (source === "template" ? it.name : it.id))
    .map((it) => {
      // WhatsApp templates are referenced by name, not id; every other entity
      // is referenced by its GUID.
      const val = source === "template" ? (it.name as string) : (it.id as string);
      let optLabel = it.name || it.code || val;
      if (source === "user") {
        optLabel =
          `${it.firstName ?? ""} ${it.lastName ?? ""}`.trim() || it.email || val;
      } else if (source === "sender") {
        // Senders have no name/code — show a human-readable identity.
        optLabel = it.displayName || it.address || val;
      }
      return { value: val, label: optLabel };
    });

  return (
    <Select
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      options={[
        ...(allowEmpty ? [{ value: "", label: emptyLabel }] : []),
        ...options,
      ]}
    />
  );
}
