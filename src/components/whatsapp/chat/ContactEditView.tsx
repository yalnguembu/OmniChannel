import React from 'react';
import { User, Mail, Phone, MapPin, ShieldCheck, Package } from 'lucide-react';
import { cn, statusLabel } from '@/lib/utils';
import { Dropdown } from '../shared/Dropdown';
import {
  useContactForm,
  type ClientForm,
} from '@/components/features/contacts/useContactForm';
import type { ClientModel } from '@/models/client.model';
import type { CreateClientRequest } from '@/shared/api/generated/types.gen';

interface ContactEditViewProps {
  /** The form is submitted by a button elsewhere (the panel footer). */
  formId: string;
  editing: ClientModel | null;
  onSubmit: (data: CreateClientRequest) => void;
  productId?: string;
  products?: { id: string; name: string }[];
  prefill?: Partial<ClientForm>;
  hideCustomAttributes?: boolean;
}

const STATUS_OPTIONS = [
  { value: 'active', label: 'Actif' },
  { value: 'inactive', label: 'Inactif' },
  { value: 'blocked', label: 'Bloqué / Spam' },
];

/** One field: floating label above an underlined input, WhatsApp-style. */
const Field: React.FC<{
  label: string;
  error?: string;
  children: React.ReactNode;
}> = ({ label, error, children }) => (
  <label className="block">
    <span className="block text-[11px] text-wa-muted">{label}</span>
    {children}
    {error && <span className="mt-0.5 block text-[11px] text-error">{error}</span>}
  </label>
);

const inputCls =
  'w-full border-0 border-b border-wa-border bg-transparent py-1.5 text-[15px] text-wa-text outline-none transition-colors placeholder:text-wa-muted focus:border-wa-teal';

/** A row of fields preceded by the left icon gutter. */
const Group: React.FC<{ icon: React.ReactNode; children: React.ReactNode }> = ({
  icon,
  children,
}) => (
  <div className="flex gap-4 px-4 py-3">
    <span className="mt-6 shrink-0 text-wa-icon">{icon}</span>
    <div className="min-w-0 flex-1 space-y-5">{children}</div>
  </div>
);

/**
 * Contact editing as a panel sub-view, laid out like WhatsApp's "Modifier le
 * contact": a left icon gutter, one underlined field per row, and the save
 * action in the panel's footer.
 *
 * Shares all its behaviour with the contacts page through
 * {@link useContactForm} — only the layout differs.
 */
export const ContactEditView: React.FC<ContactEditViewProps> = ({
  formId,
  editing,
  onSubmit,
  productId,
  products,
  prefill,
  hideCustomAttributes,
}) => {
  const {
    register,
    errors,
    submit,
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
  } = useContactForm({
    open: true,
    editing,
    onSubmit,
    productId,
    products,
    prefill,
    hideCustomAttributes,
  });

  const productOptions = (products ?? []).map((p) => ({
    value: p.id,
    label: p.name,
  }));

  // A contact may already carry a status outside the three common ones
  // (the backend owns that vocabulary), so keep it as an option.
  const status = watch('status') ?? 'active';
  const statusOptions = STATUS_OPTIONS.some((o) => o.value === status)
    ? STATUS_OPTIONS
    : [...STATUS_OPTIONS, { value: status, label: statusLabel(status) }];

  return (
    <form id={formId} onSubmit={submit} className="bg-white pb-4">
      {showProductPicker && (
        <Group icon={<Package size={20} />}>
          <Field label="Produit *">
            <Dropdown
              label="Produit"
              value={selectedProduct}
              options={[{ value: '', label: 'Choisir un produit…' }, ...productOptions]}
              onChange={setSelectedProduct}
              menuClassName="w-full"
              trigger={
                <span className={cn(inputCls, 'flex items-center justify-between')}>
                  <span className={selectedProduct ? '' : 'text-wa-muted'}>
                    {productOptions.find((o) => o.value === selectedProduct)?.label ??
                      'Choisir un produit…'}
                  </span>
                </span>
              }
            />
          </Field>
        </Group>
      )}

      <Group icon={<User size={20} />}>
        <Field label="Prénom *" error={errors.firstName?.message}>
          <input {...register('firstName')} placeholder="ex: Jean" className={inputCls} />
        </Field>
        <Field label="Nom *" error={errors.lastName?.message}>
          <input {...register('lastName')} placeholder="ex: Dupont" className={inputCls} />
        </Field>
      </Group>

      <Group icon={<Phone size={20} />}>
        <Field label="Téléphone *" error={errors.phone?.message}>
          <input {...register('phone')} placeholder="+237 6…" className={inputCls} />
        </Field>
      </Group>

      <Group icon={<Mail size={20} />}>
        <Field label="Email" error={errors.email?.message}>
          <input
            {...register('email')}
            type="email"
            placeholder="jean.dupont@email.com"
            className={inputCls}
          />
        </Field>
      </Group>

      <Group icon={<MapPin size={20} />}>
        <Field label="Ville">
          <input {...register('city')} placeholder="Douala" className={inputCls} />
        </Field>
        <Field label="Pays">
          <input {...register('country')} placeholder="Cameroun" className={inputCls} />
        </Field>
      </Group>

      <Group icon={<ShieldCheck size={20} />}>
        <Field label="Statut du compte">
          {/* Driven through RHF's setValue/watch rather than a registered
              input, so the listbox and the form state stay in step. */}
          <Dropdown
            label="Statut du compte"
            value={status}
            options={statusOptions}
            onChange={(v) => setValue('status', v, { shouldDirty: true })}
            menuClassName="w-full"
            trigger={
              <span className={cn(inputCls, 'flex items-center justify-between')}>
                {statusOptions.find((o) => o.value === status)?.label ?? status}
              </span>
            }
          />
        </Field>
      </Group>

      {!hideCustomAttributes && effectiveProductId && customAttributes.length > 0 && (
        <Group icon={<Package size={20} />}>
          {customAttributes.map((attr) => {
            const valueKind = schema.typeInfoFor(attr.type)?.valueKind;
            const value = customValues[attr.key] ?? '';
            const label = `${attr.label || attr.key}${attr.required ? ' *' : ''}`;

            if (attr.options.length > 0 || valueKind === 'boolean') {
              const options =
                attr.options.length > 0
                  ? attr.options.map((o) => ({
                      value: String(o.value ?? ''),
                      label: o.label || String(o.value ?? ''),
                    }))
                  : [
                      { value: 'true', label: 'Oui' },
                      { value: 'false', label: 'Non' },
                    ];
              return (
                <Field key={attr.key} label={label}>
                  <Dropdown
                    label={label}
                    value={value}
                    options={[{ value: '', label: 'Non renseigné' }, ...options]}
                    onChange={(v) => setCustomValue(attr.key, v)}
                    menuClassName="w-full"
                    trigger={
                      <span className={cn(inputCls, 'flex items-center justify-between')}>
                        <span className={value ? '' : 'text-wa-muted'}>
                          {options.find((o) => o.value === value)?.label ??
                            'Non renseigné'}
                        </span>
                      </span>
                    }
                  />
                </Field>
              );
            }

            const inputType =
              valueKind === 'number'
                ? 'number'
                : valueKind === 'date'
                  ? 'date'
                  : valueKind === 'dateTime'
                    ? 'datetime-local'
                    : 'text';
            return (
              <Field key={attr.key} label={label}>
                <input
                  type={inputType}
                  value={value}
                  onChange={(e) => setCustomValue(attr.key, e.target.value)}
                  className={inputCls}
                />
              </Field>
            );
          })}
        </Group>
      )}
    </form>
  );
};
