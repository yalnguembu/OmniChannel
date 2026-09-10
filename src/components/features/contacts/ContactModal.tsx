import React from 'react'
import { User, Mail, Phone, MapPin, ShieldCheck, Globe, Sparkles, Package } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useContactForm, type ClientForm } from './useContactForm'
import type { ClientModel } from '@/models/client.model'
import type { CreateClientRequest } from '@/shared/api/generated/types.gen'

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
  editing: ClientModel | null;
  onSubmit: (data: CreateClientRequest) => void;
  loading: boolean;
  /** Product the contact belongs to — drives the custom-attributes section. */
  productId?: string;
  /**
   * When provided (create mode with no scoped product, e.g. from WhatsApp),
   * shows a product picker whose choice scopes the schema + the saved contact.
   */
  products?: { id: string; name: string }[];
  /** Seed values for create mode (e.g. phone/name from a WhatsApp conversation). */
  prefill?: Partial<ClientForm>;
  /** Hides (and skips saving) the product custom-attributes section. */
  hideCustomAttributes?: boolean;
}

export function ContactModal({ open, onClose, editing, onSubmit, loading, productId, products, prefill, hideCustomAttributes }: ContactModalProps) {
  const {
    register,
    errors,
    submit,
    selectedProduct,
    setSelectedProduct,
    showProductPicker,
    effectiveProductId,
    schema,
    customAttributes,
    customValues,
    setCustomValue,
  } = useContactForm({
    open,
    editing,
    onSubmit,
    productId,
    products,
    prefill,
    hideCustomAttributes,
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Modifier le Client' : 'Nouveau Contact'}
      subtitle={editing ? `Édition du profil de ${editing.firstName} ${editing.lastName}` : 'Ajoutez un prospect ou un client à votre base de données'}
      size="lg"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button variant="ghost" onClick={onClose} className="font-bold text-[#8BAFC0]">Annuler</Button>
          <Button
            variant="primary"
            onClick={submit}
            loading={loading}
            className="px-8 shadow-lg shadow-[#0D2137]/10 font-bold"
          >
            {editing ? 'Sauvegarder les modifications' : 'Créer le contact'}
          </Button>
        </div>
      }
    >
      <form className="space-y-6 py-2">
        {/* Produit — création hors contexte produit (ex: WhatsApp) */}
        {showProductPicker && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2 px-1 text-[#2E8FAD]">
              <Package size={14} />
              <span className="text-[11px] font-bold text-[#8BAFC0] uppercase tracking-[0.1em]">
                Produit
              </span>
            </div>
            <Select
              label="Produit *"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              placeholder="Choisir un produit…"
              options={products!.map((p) => ({ value: p.id, label: p.name }))}
              className="h-11 bg-[#FBFBFC]"
              prefixIcon={<Package size={14} className="text-[#8BAFC0]" />}
            />
          </div>
        )}

        {/* Identité Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2 px-1">
             <User size={14} className="text-[#2E8FAD]" />
             <span className="text-[11px] font-bold text-[#8BAFC0] uppercase tracking-[0.1em]">Identité du Client</span>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <Input 
              label="Prénom *" 
              placeholder="ex: Jean" 
              error={errors.firstName?.message} 
              {...register('firstName')} 
              className="h-11 bg-[#FBFBFC]"
            />
            <Input 
              label="Nom *" 
              placeholder="ex: Dupont" 
              error={errors.lastName?.message} 
              {...register('lastName')} 
              className="h-11 bg-[#FBFBFC]"
            />
          </div>
        </div>

        {/* Contact Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2 px-1 text-[#2E8FAD]">
             <Mail size={14} />
             <span className="text-[11px] font-bold text-[#8BAFC0] uppercase tracking-[0.1em]">Coordonnées</span>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <Input 
              label="Adresse Email" 
              type="email" 
              placeholder="jean.dupont@email.com"
              error={errors.email?.message} 
              {...register('email')} 
              prefixIcon={<Mail size={14} className="text-[#8BAFC0]" />}
              className="h-11 bg-[#FBFBFC]"
            />
            <Input 
              label="Numéro de Téléphone *" 
              placeholder="+237 6..."
              error={errors.phone?.message} 
              {...register('phone')} 
              prefixIcon={<Phone size={14} className="text-[#8BAFC0]" />}
              className="h-11 bg-[#FBFBFC]"
            />
          </div>
        </div>

        {/* Localisation & Statut */}
        <div className="space-y-4">
           <div className="flex items-center gap-2 mb-2 px-1 text-[#2E8FAD]">
             <MapPin size={14} />
             <span className="text-[11px] font-bold text-[#8BAFC0] uppercase tracking-[0.1em]">Détails du Compte</span>
          </div>
          <div className="grid grid-cols-3 gap-5">
            <Input 
              label="Ville" 
              placeholder="Douala"
              {...register('city')} 
              className="h-11 bg-[#FBFBFC]"
              prefixIcon={<MapPin size={14} className="text-[#8BAFC0]" />}
            />
            <Input 
              label="Pays" 
              placeholder="Cameroun"
              {...register('country')} 
              className="h-11 bg-[#FBFBFC]"
              prefixIcon={<Globe size={14} className="text-[#8BAFC0]" />}
            />
            <Select
              label="Statut du Compte"
              options={[
                { value: 'active', label: 'Actif' },
                { value: 'inactive', label: 'Inactif' },
                { value: 'blocked', label: 'Bloqué / Spam' },
              ]}
              {...register('status')}
              className="h-11 bg-[#FBFBFC]"
              prefixIcon={<ShieldCheck size={14} className="text-[#8BAFC0]" />}
            />
          </div>
        </div>

        {/* Attributs personnalisés (schéma du produit) */}
        {!hideCustomAttributes && effectiveProductId && customAttributes.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2 px-1 text-[#2E8FAD]">
              <Sparkles size={14} />
              <span className="text-[11px] font-bold text-[#8BAFC0] uppercase tracking-[0.1em]">
                Attributs personnalisés
              </span>
            </div>
            <div className="grid grid-cols-2 gap-5">
              {customAttributes.map((attr) => {
                const valueKind = schema.typeInfoFor(attr.type)?.valueKind;
                const value = customValues[attr.key] ?? '';
                const setValue = (v: string) => setCustomValue(attr.key, v);
                const label = `${attr.label || attr.key}${attr.required ? ' *' : ''}`;

                // Select / MultiSelect — driven by the attribute's options.
                if (attr.options.length > 0) {
                  return (
                    <Select
                      key={attr.key}
                      label={label}
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      options={[
                        { value: '', label: 'Non renseigné' },
                        ...attr.options.map((o) => ({
                          value: String(o.value ?? ''),
                          label: o.label || String(o.value ?? ''),
                        })),
                      ]}
                      className="h-11 bg-[#FBFBFC]"
                    />
                  );
                }
                if (valueKind === 'boolean') {
                  return (
                    <Select
                      key={attr.key}
                      label={label}
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      options={[
                        { value: '', label: 'Non renseigné' },
                        { value: 'true', label: 'Oui' },
                        { value: 'false', label: 'Non' },
                      ]}
                      className="h-11 bg-[#FBFBFC]"
                    />
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
                  <Input
                    key={attr.key}
                    label={label}
                    type={inputType}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="h-11 bg-[#FBFBFC]"
                  />
                );
              })}
            </div>
          </div>
        )}
      </form>
    </Modal>
  )
}
