import React, { useState } from 'react';
import {
  Images,
  ChevronRight,
  Link2,
  Check,
  CheckCircle2,
  Clock,
  CheckCheck,
  XCircle,
  UserPlus,
  UserCog,
  UserCheck,
  Phone,
  Search,
  LayoutTemplate,
  Zap,
  Pencil,
  Ban,
  ChevronDown,
  Check as CheckIcon,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { SidePanel } from '../shared/SidePanel';
import { Dropdown, type DropdownOption } from '../shared/Dropdown';
import { MediaGalleryView } from './MediaGalleryView';
import { ContactEditView } from './ContactEditView';
import { AvatarInitials } from '../shared/AvatarInitials';
import { cn, statusLabel } from '@/lib/utils';
import {
  avatarColor,
  getInitials,
  fmtTimeFull,
  type Conversation,
  type ConversationStatus,
  type User,
} from '@/models/whatsapp.models';
import type { GalleryItem } from '@/hooks/chatViewModel';
import type { ClientModel } from '@/models/client.model';
import type { SearchClientResponse } from '@/shared/api/generated/types.gen';
import { statusTone } from '../shared/statusTone';
import type { ClientForm } from '@/components/features/contacts/useContactForm';
import type { CreateClientRequest } from '@/shared/api/generated/types.gen';

/** Ties the footer's save button to the form rendered in the sub-view. */
const CONTACT_FORM_ID = 'wa-contact-form';

/** Which screen the panel is showing — gallery and edit are sub-views of info. */
export type DetailsView = 'info' | 'gallery' | 'contact';

interface ConversationDetailsPanelProps {
  /** Null closes the panel; otherwise the screen to show. */
  view: DetailsView | null;
  onViewChange: (view: DetailsView) => void;
  onClose: () => void;
  conv: Conversation | null;
  /** CRM client name resolved from the number, when there is one. */
  clientName?: string | null;
  /** Full CRM row for that client — drives the "Fiche client" section. */
  client?: SearchClientResponse | null;
  hasContact?: boolean;
  contactLoading?: boolean;
  onManageContact?: () => void;

  // ── Contact edit sub-view ──
  /** The CRM client being edited, or null to create one. */
  editingContact: ClientModel | null;
  editingProductId?: string;
  /** Product choices, only in create mode. */
  contactProducts?: { id: string; name: string }[];
  contactPrefill?: Partial<ClientForm>;
  onSaveContact: (body: CreateClientRequest) => void;
  isSavingContact?: boolean;

  // ── Shortcuts ──
  onSearch: () => void;
  onSendTemplate: () => void;
  onSendFlow: () => void;

  // ── Statuses, editable in place ──
  users: User[];
  onStatusChange: (status: ConversationStatus) => void;
  onAssign: (userId: string) => void;
  clientStatuses?: string[];
  currentClientStatus?: string;
  onChangeClientStatus?: (status: string) => void;
  channelStatuses?: string[];
  onChangeChannelStatus?: (status: string) => void;

  // ── Media sub-view ──
  galleryItems: GalleryItem[];
  hasOlder: boolean;
  isLoadingOlder: boolean;
  onLoadOlder: () => void;
  onOpenMedia: (type: 'image' | 'video', url: string, caption?: string) => void;
}

const STATUS_META: Record<
  string,
  { label: string; icon: React.ReactNode; className: string }
> = {
  OPEN: {
    label: 'Ouverte',
    icon: <CheckCircle2 size={17} />,
    className: 'bg-wa-status-open-bg text-wa-status-open',
  },
  PENDING: {
    label: 'En attente',
    icon: <Clock size={17} />,
    className: 'bg-wa-status-pending-bg text-wa-status-pending',
  },
  RESOLVED: {
    label: 'Résolue',
    icon: <CheckCheck size={17} />,
    className: 'bg-wa-status-resolved-bg text-wa-status-resolved',
  },
  CLOSED: {
    label: 'Fermée',
    icon: <XCircle size={17} />,
    className: 'bg-wa-status-closed-bg text-wa-status-closed',
  },
};

const STATUS_ORDER: ConversationStatus[] = ['OPEN', 'PENDING', 'RESOLVED', 'CLOSED'];

/** Thin grey band — how WhatsApp separates blocks in the info panel. */
const Band = () => <div className="h-2 bg-wa-hover" />;

/** `plan_tarifaire` → `Plan tarifaire`, for attribute keys with no label. */
function humanise(key: string): string {
  const words = key.replace(/[_-]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** `customData` arrives as a JSON string; a malformed one must not throw. */
function parseCustomData(raw: unknown): Array<[string, string]> {
  if (!raw) return [];
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!parsed || typeof parsed !== 'object') return [];
    return Object.entries(parsed as Record<string, unknown>)
      .map(([k, v]) => [k, v == null ? '' : String(v)] as [string, string])
      .filter(([, v]) => v.trim() !== '');
  } catch {
    return [];
  }
}

function fmtDate(value?: string | null): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString('fr-FR');
}

const Fact: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div className="flex items-start justify-between gap-4 py-2">
    <span className="shrink-0 text-xs text-wa-muted">{label}</span>
    <span className="min-w-0 text-right text-sm text-wa-text break-words">
      {children}
    </span>
  </div>
);

/** Circular shortcut under the identity — WhatsApp's Voix / Vidéo / Rechercher row. */
const QuickAction: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}> = ({ icon, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex min-w-16 flex-col items-center gap-1.5 rounded-lg py-1 transition-colors hover:bg-wa-hover"
  >
    <span className="flex size-12 items-center justify-center rounded-full bg-wa-input-bg text-wa-teal">
      {icon}
    </span>
    <span className="text-[11px] text-wa-muted">{label}</span>
  </button>
);

/**
 * A setting changed in place, without leaving the panel. Backed by the custom
 * {@link Dropdown} so the options can carry the status icons and colours.
 */
const SelectRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  /** What the row shows when closed. */
  display: string;
  options: DropdownOption[];
  onChange: (v: string) => void;
}> = ({ icon, label, value, display, options, onChange }) => (
  <Dropdown
    label={label}
    value={value}
    options={options}
    onChange={onChange}
    menuClassName="w-[calc(100%-2rem)] mx-4"
    trigger={
      <span className="flex w-full items-center gap-3.5 px-4 py-2.5 transition-colors hover:bg-wa-hover">
        <span className="shrink-0 text-wa-icon">{icon}</span>
        <span className="min-w-0 flex-1 text-left">
          <span className="block text-[11px] text-wa-muted">{label}</span>
          <span className="block truncate text-sm text-wa-text">{display}</span>
        </span>
        <ChevronDown size={16} className="shrink-0 text-wa-icon" />
      </span>
    }
  />
);

const ActionRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  destructive?: boolean;
}> = ({ icon, label, onClick, destructive }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition-colors hover:bg-wa-hover',
      destructive ? 'text-error' : 'text-wa-text',
    )}
  >
    <span className={cn('shrink-0', destructive ? 'text-error' : 'text-wa-icon')}>
      {icon}
    </span>
    <span className="flex-1 text-sm">{label}</span>
  </button>
);

/**
 * WhatsApp's "Infos du contact" surface: a docked drawer next to the
 * conversation on desktop, a bottom sheet on mobile — see {@link SidePanel}.
 *
 * Everything actionable about the discussion lives here rather than behind a
 * menu: the shortcut row, the four statuses (editable in place), the media
 * sub-view, the shareable link and the destructive close.
 */
export const ConversationDetailsPanel: React.FC<ConversationDetailsPanelProps> = ({
  view,
  onViewChange,
  onClose,
  conv,
  clientName,
  client,
  hasContact,
  contactLoading,
  onManageContact,
  editingContact,
  editingProductId,
  contactProducts,
  contactPrefill,
  onSaveContact,
  isSavingContact,
  onSearch,
  onSendTemplate,
  onSendFlow,
  users,
  onStatusChange,
  onAssign,
  clientStatuses = [],
  currentClientStatus,
  onChangeClientStatus,
  channelStatuses = [],
  onChangeChannelStatus,
  galleryItems,
  hasOlder,
  isLoadingOlder,
  onLoadOlder,
  onOpenMedia,
}) => {
  const [copied, setCopied] = useState(false);

  const statusOptions = React.useMemo<DropdownOption[]>(
    () =>
      STATUS_ORDER.map((s) => ({
        value: s,
        label: STATUS_META[s].label,
        icon: (
          <span className={STATUS_META[s].className.split(' ').pop()}>
            {STATUS_META[s].icon}
          </span>
        ),
      })),
    [],
  );
  const assigneeOptions = React.useMemo<DropdownOption[]>(
    () => [
      { value: '', label: 'Non assignée' },
      ...users.map((u) => ({
        value: u.id,
        label: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email || u.id,
      })),
    ],
    [users],
  );
  const clientStatusOptions = React.useMemo<DropdownOption[]>(
    () => clientStatuses.map((s) => ({ value: s, label: statusLabel(s.toLowerCase()) })),
    [clientStatuses],
  );
  const channelStatusOptions = React.useMemo<DropdownOption[]>(
    () => channelStatuses.map((s) => ({ value: s, label: statusLabel(s.toLowerCase()) })),
    [channelStatuses],
  );

  if (!conv) return null;

  const phone = conv.contactAddress ?? '';
  const contactName =
    conv.contactName && conv.contactName !== phone ? conv.contactName : null;
  const title = clientName?.trim() || contactName || phone || '—';
  const status = (conv.status ?? 'OPEN').toUpperCase();
  const statusMeta = STATUS_META[status] ?? STATUS_META.OPEN;
  const clientStatusValue =
    clientStatuses.find(
      (s) => s.toLowerCase() === (currentClientStatus ?? '').toLowerCase(),
    ) ?? '';

  /**
   * Copies a link that reopens this exact discussion. Built from the current
   * URL so the sender segment and the active filters survive — `c` is the
   * param the inbox restores the open conversation from.
   */
  const copyLink = async () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('c', conv.id);
      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
      toast.success('Lien de la discussion copié');
    } catch {
      toast.error('Impossible de copier le lien');
    }
  };

  const isGallery = view === 'gallery';
  const isContact = view === 'contact';
  const isSubView = isGallery || isContact;

  return (
    <SidePanel
      open={view !== null}
      onClose={onClose}
      title={
        isGallery
          ? 'Médias et documents'
          : isContact
            ? hasContact
              ? 'Modifier le contact'
              : 'Ajouter le contact'
            : 'Infos du contact'
      }
      // Only a sub-view gets a back arrow; from the info screen the leading
      // control closes the panel.
      onBack={isSubView ? () => onViewChange('info') : undefined}
      headerAction={
        onManageContact ? (
          <button
            type="button"
            onClick={onManageContact}
            disabled={contactLoading || isSubView}
            aria-label={hasContact ? 'Éditer le contact' : 'Ajouter aux contacts'}
            title={hasContact ? 'Éditer le contact' : 'Ajouter aux contacts'}
            className="size-9 shrink-0 rounded-full flex items-center justify-center text-wa-icon transition-colors hover:bg-wa-active disabled:opacity-50"
          >
            {hasContact ? <Pencil size={18} /> : <UserPlus size={18} />}
          </button>
        ) : undefined
      }
      footer={
        isContact ? (
          // Round green confirm, like WhatsApp's floating save.
          <div className="flex justify-center">
            <button
              type="submit"
              form={CONTACT_FORM_ID}
              disabled={isSavingContact}
              aria-label="Enregistrer le contact"
              className="flex size-12 items-center justify-center rounded-full bg-wa-green-send text-white shadow-md transition-all hover:brightness-105 disabled:opacity-60"
            >
              {isSavingContact ? (
                <Loader2 size={22} className="animate-spin" />
              ) : (
                <CheckIcon size={24} />
              )}
            </button>
          </div>
        ) : undefined
      }
    >
      {isContact ? (
        <ContactEditView
          formId={CONTACT_FORM_ID}
          editing={editingContact}
          productId={editingProductId}
          products={contactProducts}
          prefill={contactPrefill}
          // An existing client's custom attributes belong to its product and
          // are edited on the contacts page, not from the inbox.
          hideCustomAttributes={!!editingContact}
          onSubmit={onSaveContact}
        />
      ) : isGallery ? (
        <MediaGalleryView
          items={galleryItems}
          hasOlder={hasOlder}
          isLoadingOlder={isLoadingOlder}
          onLoadOlder={onLoadOlder}
          onOpen={onOpenMedia}
        />
      ) : (
        <>
          {/* Identity */}
          <div className="flex flex-col items-center gap-2 bg-white px-6 pt-6 pb-4">
            <AvatarInitials
              initials={getInitials(title)}
              background={avatarColor(conv.id)}
              className="size-28 text-3xl"
            />
            <h3 className="mt-2 text-center text-xl font-medium text-wa-text break-words">
              {title}
            </h3>
            {phone && phone !== title && (
              <p className="text-sm text-wa-muted">{phone}</p>
            )}
            <span
              className={cn(
                'mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                statusMeta.className,
              )}
            >
              {React.cloneElement(
                statusMeta.icon as React.ReactElement<{ size?: number }>,
                { size: 13 },
              )}
              {statusMeta.label}
            </span>
          </div>

          {/* Shortcuts */}
          <div className="flex items-start justify-center gap-2 bg-white px-4 pb-5">
            <QuickAction
              icon={<Search size={20} />}
              label="Rechercher"
              onClick={onSearch}
            />
            <QuickAction
              icon={<LayoutTemplate size={20} />}
              label="Template"
              onClick={onSendTemplate}
            />
            <QuickAction icon={<Zap size={20} />} label="Flow" onClick={onSendFlow} />
            {onManageContact && (
              <QuickAction
                icon={hasContact ? <Pencil size={20} /> : <UserPlus size={20} />}
                label={hasContact ? 'Éditer' : 'Ajouter'}
                onClick={onManageContact}
              />
            )}
          </div>

          <Band />

          {/* Media shortcut — WhatsApp puts the gallery right under the identity */}
          <button
            type="button"
            onClick={() => onViewChange('gallery')}
            className="flex w-full items-center gap-3.5 bg-white px-4 py-3.5 text-left transition-colors hover:bg-wa-hover"
          >
            <Images size={19} className="shrink-0 text-wa-icon" />
            <span className="flex-1 text-sm text-wa-text">Médias et documents</span>
            <span className="text-sm text-wa-muted">{galleryItems.length || ''}</span>
            <ChevronRight size={17} className="shrink-0 text-wa-icon" />
          </button>

          <Band />

          {/* Statuses, changed without leaving the panel */}
          <div className="bg-white py-1">
            <SelectRow
              icon={statusMeta.icon}
              label="Statut de la conversation"
              value={status}
              display={statusMeta.label}
              options={statusOptions}
              onChange={(v) => onStatusChange(v as ConversationStatus)}
            />

            {users.length > 0 && (
              <SelectRow
                icon={<UserCheck size={17} />}
                label="Assignée à"
                value={conv.assignedToUserId ?? ''}
                display={
                  assigneeOptions.find((o) => o.value === (conv.assignedToUserId ?? ''))
                    ?.label ?? 'Non assignée'
                }
                options={assigneeOptions}
                onChange={onAssign}
              />
            )}

            {hasContact && clientStatuses.length > 0 && (
              <SelectRow
                icon={<UserCog size={17} />}
                label="Statut du client"
                value={clientStatusValue}
                display={
                  clientStatusValue
                    ? statusLabel(clientStatusValue.toLowerCase())
                    : 'Choisir un statut…'
                }
                options={clientStatusOptions}
                onChange={(v) => v && onChangeClientStatus?.(v)}
              />
            )}

            {channelStatuses.length > 0 && (
              // Write-only: the API exposes no read for a contact-channel
              // status, so this applies one rather than reflecting the current.
              <SelectRow
                icon={<Phone size={17} />}
                label="Statut du numéro"
                value=""
                display="Changer le statut…"
                options={channelStatusOptions}
                onChange={(v) => v && onChangeChannelStatus?.(v)}
              />
            )}
          </div>

          <Band />

          {/* Actions */}
          <div className="bg-white">
            <ActionRow
              icon={copied ? <Check size={19} /> : <Link2 size={19} />}
              label={copied ? 'Lien copié' : 'Copier le lien de la discussion'}
              onClick={copyLink}
            />
            {status !== 'CLOSED' && (
              <ActionRow
                icon={<Ban size={19} />}
                label="Fermer la discussion"
                destructive
                onClick={() => {
                  onStatusChange('CLOSED');
                  onClose();
                }}
              />
            )}
          </div>

          <Band />

          {/* Full CRM record for the number */}
          {client && (
            <>
              <div className="bg-white px-4 py-2">
                <p className="flex items-center gap-2 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-wa-muted">
                  Fiche client
                  {client.status && (
                    <span
                      className={cn(
                        'size-1.5 rounded-full',
                        statusTone(client.status)?.dot ?? 'bg-wa-status-closed',
                      )}
                    />
                  )}
                </p>
                <div className="divide-y divide-wa-border">
                  {/* Only fields the record actually carries — an empty CRM
                      row should not render a wall of "N/A". */}
                  {(
                    [
                      ['Nom', `${client.firstName ?? ''} ${client.lastName ?? ''}`.trim()],
                      ['Statut', client.status ? statusLabel(client.status.toLowerCase()) : ''],
                      ['Téléphone', client.phone],
                      ['Email', client.email],
                      ['Produit', client.productName],
                      ['Référence externe', client.externalId],
                      ['Genre', client.gender],
                      ['Date de naissance', fmtDate(client.birthDate)],
                      ['Adresse', client.address],
                      ['Ville', client.city],
                      ['Code postal', client.postalCode],
                      ['Pays', client.country],
                      ['Langue', client.language],
                      ['Fuseau horaire', client.timezone],
                      ['Créé le', fmtDate(client.createdAt)],
                      ['Mis à jour le', fmtDate(client.updatedAt)],
                    ] as Array<[string, string | null | undefined]>
                  )
                    .filter(([, value]) => !!value && String(value).trim() !== '')
                    .map(([label, value]) => (
                      <Fact key={label} label={label}>
                        {value}
                      </Fact>
                    ))}
                </div>

                {parseCustomData(client.customData).length > 0 && (
                  <>
                    <p className="pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-wa-muted">
                      Attributs personnalisés
                    </p>
                    <div className="divide-y divide-wa-border">
                      {parseCustomData(client.customData).map(([key, value]) => (
                        <Fact key={key} label={humanise(key)}>
                          {value}
                        </Fact>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <Band />
            </>
          )}

          {/* Read-only facts */}
          <div className="bg-white px-4 py-2 pb-6">
            <p className="pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-wa-muted">
              Conversation
            </p>
            <div className="divide-y divide-wa-border">
              <Fact label="Canal">
                {[conv.channelName, conv.channelCode && `(${conv.channelCode})`]
                  .filter(Boolean)
                  .join(' ') || 'WhatsApp'}
              </Fact>
              <Fact label="Expéditeur">
                {[conv.senderName, conv.senderAddress && `(${conv.senderAddress})`]
                  .filter(Boolean)
                  .join(' ') || 'N/A'}
              </Fact>
              <Fact label="Créée le">
                {fmtTimeFull(conv.createdAt || conv.lastMessageAt)}
              </Fact>
              <Fact label="Dernière activité">{fmtTimeFull(conv.lastMessageAt)}</Fact>
              <Fact label="Identifiant">
                <span className="font-mono text-xs break-all">{conv.id}</span>
              </Fact>
            </div>
          </div>
        </>
      )}
    </SidePanel>
  );
};
