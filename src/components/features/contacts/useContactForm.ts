import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { clientSchema } from '@/lib/validators';
import { useProductAttributeSchema } from '@/hooks/useProductAttributeSchema';
import type { ClientModel } from '@/models/client.model';
import type { CreateClientRequest } from '@/shared/api/generated/types.gen';
import type { z } from 'zod';

export type ClientForm = z.infer<typeof clientSchema>;

export interface UseContactFormOptions {
  /** Only reset/refetch while the surface is actually shown. */
  open: boolean;
  editing: ClientModel | null;
  onSubmit: (data: CreateClientRequest) => void;
  /** Product the contact belongs to — drives the custom-attributes section. */
  productId?: string;
  /** Create mode with no scoped product: the picker chooses one. */
  products?: { id: string; name: string }[];
  /** Seed values for create mode (e.g. phone/name from a WhatsApp conversation). */
  prefill?: Partial<ClientForm>;
  /** Hides (and skips saving) the product custom-attributes section. */
  hideCustomAttributes?: boolean;
}

/** Tolerantly parse a client's customData (JSON string or object) into a flat map. */
function parseCustomData(src: unknown): Record<string, string> {
  if (!src) return {};
  try {
    const obj = typeof src === 'string' ? JSON.parse(src) : src;
    if (obj && typeof obj === 'object') {
      return Object.fromEntries(
        Object.entries(obj as Record<string, unknown>).map(([k, v]) => [
          k,
          v == null ? '' : String(v),
        ]),
      );
    }
  } catch {
    /* malformed customData — start empty */
  }
  return {};
}

/**
 * All the state behind the contact form: validation, reset-on-open, the
 * product picker and the product's dynamic custom attributes.
 *
 * Extracted from `ContactModal` so the WhatsApp inbox can render the same
 * form as a panel sub-view with its own layout, without either surface
 * duplicating the logic or dictating the other's markup.
 */
export function useContactForm({
  open,
  editing,
  onSubmit,
  productId,
  products,
  prefill,
  hideCustomAttributes,
}: UseContactFormOptions) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ClientForm>({ resolver: zodResolver(clientSchema) });

  // In create mode with a product picker, the chosen product scopes everything.
  const [selectedProduct, setSelectedProduct] = useState(productId ?? '');
  const effectiveProductId = productId || selectedProduct || undefined;
  const showProductPicker = !editing && !!products && products.length > 0;

  // Custom attributes for the product (excludes derived — computed server-side).
  const schema = useProductAttributeSchema(effectiveProductId ?? '', {
    enabled: open && !!effectiveProductId && !hideCustomAttributes,
  });
  const customAttributes = useMemo(
    () => schema.attributes.filter((a) => a.key.trim() !== '' && !a.derived),
    [schema.attributes],
  );

  // Custom attribute values, kept outside RHF since the field set is dynamic.
  const [customValues, setCustomValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editing) {
      reset({
        firstName: editing.firstName || '',
        lastName: editing.lastName || '',
        email: editing.email || '',
        phone: editing.phone || '',
        city: editing.city || '',
        country: editing.country || '',
        status: editing.status,
      });
      setCustomValues(parseCustomData((editing as { customData?: unknown }).customData));
    } else {
      reset({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        city: '',
        country: '',
        status: 'active',
        ...prefill,
      });
      setCustomValues({});
      setSelectedProduct(productId ?? '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing, reset, open, productId]);

  const submit = handleSubmit((data) => {
    if (showProductPicker && !selectedProduct) {
      toast.error('Sélectionnez un produit');
      return;
    }
    const entries = hideCustomAttributes
      ? []
      : Object.entries(customValues).filter(([, v]) => (v ?? '').trim() !== '');
    const body: CreateClientRequest = {
      ...(data as CreateClientRequest),
      ...(effectiveProductId ? { productId: effectiveProductId } : {}),
      ...(entries.length > 0
        ? { customData: JSON.stringify(Object.fromEntries(entries)) }
        : {}),
    };
    onSubmit(body);
  });

  const setCustomValue = (key: string, value: string) =>
    setCustomValues((prev) => ({ ...prev, [key]: value }));

  return {
    register,
    errors,
    submit,
    /** For fields rendered as custom controls rather than native inputs. */
    setValue,
    watch,
    selectedProduct,
    setSelectedProduct,
    showProductPicker,
    effectiveProductId,
    schema,
    customAttributes,
    customValues,
    setCustomValue,
  };
}
