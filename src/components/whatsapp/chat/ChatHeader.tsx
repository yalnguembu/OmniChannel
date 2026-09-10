import React, { useState } from 'react';
import {
  Search,
  MoreVertical,
  ArrowLeft,
  Info,
  Zap,
  LayoutTemplate,
  CheckCircle2,
  Clock,
  CheckCheck,
  XCircle,
  UserCheck,
  UserCog,
  Phone,
  Images,
  RefreshCw,
  MessageSquare,
  ChevronDown,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { AvatarInitials } from '../shared/AvatarInitials';
import { IconButton } from '../shared/IconButton';
import { cn, statusLabel } from '@/lib/utils';
import { Dropdown, type DropdownOption } from '../shared/Dropdown';
import { statusTone } from '../shared/statusTone';
import type { ConversationStatus, User } from '@/models/whatsapp.models';

export interface ChatHeaderVM {
  initials: string;
  avatarBg: string;
  /** Name carried by the conversation itself, when it isn't just the number. */
  contactName: string | null;
  phone: string;
  assignedName: string | null;
  status: string;
  assignedToUserId: string;
  contactAddress: string;
}

interface ChatHeaderProps {
  vm: ChatHeaderVM;
  /** CRM client resolved from the phone number — takes precedence for the title. */
  clientName?: string | null;
  /**
   * Show the status/assignee chips inline (desktop). Turned off while the
   * details drawer is open: the chat column is 400px narrower then, and the
   * chips are what made the header overflow. They stay reachable in the ⋮ menu.
   */
  showInlineControls?: boolean;
  users: User[];
  chatSearch: string;
  onStatusChange: (status: ConversationStatus) => void;
  onAssign: (userId: string) => void;
  onToggleSearch: () => void;
  onShowDetails: () => void;
  onOpenGallery: () => void;
  onReload: () => void;
  isReloading?: boolean;
  onBack: () => void;
  onSendFlow: () => void;
  onSendTemplate: () => void;
  /** Whether a CRM client is linked to this conversation's number. */
  hasClient?: boolean;
  /** Client status vocabulary + current value (PATCH /api/Client/status/{id}). */
  clientStatuses?: string[];
  currentClientStatus?: string;
  onChangeClientStatus?: (status: string) => void;
  /** Contact-channel status vocabulary (PATCH /api/ContactChannel/status). */
  channelStatuses?: string[];
  onChangeChannelStatus?: (status: string) => void;
}

const statusConfig: Record<string, { label: string; icon: React.ReactNode; activeClass: string }> = {
  OPEN:     { label: 'Ouverte',    icon: <CheckCircle2  size={15} />, activeClass: 'text-wa-status-open' },
  PENDING:  { label: 'En attente', icon: <Clock         size={15} />, activeClass: 'text-wa-status-pending' },
  RESOLVED: { label: 'Résolue',   icon: <CheckCheck    size={15} />, activeClass: 'text-wa-status-resolved' },
  CLOSED:   { label: 'Fermée',    icon: <XCircle       size={15} />, activeClass: 'text-wa-status-closed' },
};

const STATUS_ORDER = ['OPEN', 'PENDING', 'RESOLVED', 'CLOSED'] as const;

/**
 * Icon-only header control: a round button opening a custom listbox.
 *
 * The header stays as narrow as a row of icon buttons; the current value lives
 * in the tooltip and in the icon's tint. Uses {@link Dropdown} rather than a
 * native <select>, which can't show icons or status colours in its options.
 */
const HeaderSelect: React.FC<{
  label: string;
  icon: React.ReactNode;
  value: string;
  /** Human-readable current value, shown in the tooltip. */
  valueLabel?: string;
  onChange: (v: string) => void;
  options: DropdownOption[];
  /** Tints the icon — used to surface the conversation status at a glance. */
  tone?: string;
  /** Background class for the corner dot; omitted when no status is known. */
  dot?: string;
}> = ({ label, icon, value, valueLabel, onChange, options, tone, dot }) => (
  <Dropdown
    label={label}
    title={valueLabel ? `${label} : ${valueLabel}` : label}
    value={value}
    options={options}
    onChange={onChange}
    align="right"
    className="shrink-0"
    trigger={
      <span
        className={cn(
          'relative flex size-9 items-center justify-center rounded-full',
          'bg-wa-input-bg text-wa-icon transition-colors hover:bg-wa-hover',
          tone,
        )}
      >
        {icon}
        {dot && (
          <span
            aria-hidden
            className={cn(
              'absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-wa-header',
              dot,
            )}
          />
        )}
      </span>
    }
  />
);

/** Full-width row variant of the same listbox, for the overflow menu. */
const MenuDropdown: React.FC<{
  label: string;
  icon: React.ReactNode;
  value: string;
  display: string;
  options: DropdownOption[];
  onChange: (v: string) => void;
}> = ({ label, icon, value, display, options, onChange }) => (
  <Dropdown
    label={label}
    value={value}
    options={options}
    onChange={onChange}
    menuClassName="w-full"
    trigger={
      <span className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-wa-text transition-colors hover:bg-wa-hover">
        <span className="shrink-0 text-wa-icon">{icon}</span>
        <span className="min-w-0 flex-1 truncate text-left">{display}</span>
        <ChevronDown size={14} className="shrink-0 text-wa-icon" />
      </span>
    }
  />
);

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  vm,
  clientName,
  showInlineControls = true,
  users,
  chatSearch,
  onStatusChange,
  onAssign,
  onToggleSearch,
  onShowDetails,
  onOpenGallery,
  onReload,
  isReloading = false,
  onBack,
  onSendFlow,
  onSendTemplate,
  hasClient = false,
  clientStatuses = [],
  currentClientStatus,
  onChangeClientStatus,
  channelStatuses = [],
  onChangeChannelStatus,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const current = statusConfig[vm.status] ?? statusConfig['OPEN'];

  // Option lists, memoised so the menus do not rebuild on every header render
  // (the assignee list can hold a hundred agents).
  const statusOptions = React.useMemo<DropdownOption[]>(
    () =>
      STATUS_ORDER.map((s) => ({
        value: s,
        label: statusConfig[s].label,
        icon: <span className={statusConfig[s].activeClass}>{statusConfig[s].icon}</span>,
      })),
    [],
  );
  const assigneeOptions = React.useMemo<DropdownOption[]>(
    () => [
      { value: '', label: 'Non assigné' },
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

  // Match the (lowercased) client status to one of the backend's status values.
  const clientStatusValue =
    clientStatuses.find(
      (s) => s.toLowerCase() === (currentClientStatus ?? '').toLowerCase(),
    ) ?? '';

  const conversationTone = statusTone(vm.status === 'OPEN' ? 'active' : vm.status);
  const clientTone = statusTone(currentClientStatus);

  // The CRM client name wins, then any name the conversation carries, then the
  // number. The number always stays visible on the second line.
  const title = clientName?.trim() || vm.contactName || vm.phone || '—';
  const showPhoneLine = !!vm.phone && vm.phone !== title;

  return (
    <div className="bg-wa-header px-3 py-2.5 flex items-center gap-2.5 min-h-20 border-b border-wa-border shrink-0 relative">
      {/* Mobile back */}
      <IconButton label="Retour" className="md:hidden" onClick={onBack}>
        <ArrowLeft size={20} />
      </IconButton>

      {/* Avatar */}
      <AvatarInitials
        initials={vm.initials}
        background={vm.avatarBg}
        size="lg"
        onClick={onShowDetails}
      />

      {/* Name + number + assignee */}
      <div className="flex-1 min-w-0 cursor-pointer" onClick={onShowDetails}>
        <div className="lg:text-lg font-semibold text-wa-text truncate leading-snug">
          {title}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-wa-muted leading-snug">
          {showPhoneLine && <span className="truncate">{vm.phone}</span>}
          {vm.assignedName && (
            <>
              {showPhoneLine && <span aria-hidden>·</span>}
              <span className="inline-flex min-w-0 items-center gap-1 text-wa-teal">
                <UserCheck size={12} className="shrink-0" />
                <span className="truncate">{vm.assignedName}</span>
              </span>
            </>
          )}
        </div>
      </div>

      {/* ── Inline controls (desktop) ──
          Everything the 3-dots menu offers, exposed directly on wide screens.
          Below xl the menu remains the single entry point. */}
      <div
        className={cn(
          'hidden items-center gap-1.5 min-w-0 shrink',
          showInlineControls && 'md:flex',
        )}
      >
        <HeaderSelect
          label="Statut de la conversation"
          icon={current.icon}
          value={vm.status}
          valueLabel={current.label}
          onChange={(v) => onStatusChange(v as ConversationStatus)}
          options={statusOptions}
          tone={current.activeClass}
          dot={conversationTone?.dot}
        />

        {users.length > 0 && (
          <HeaderSelect
            label="Assigné à"
            icon={<UserCheck size={16} />}
            value={vm.assignedToUserId}
            valueLabel={vm.assignedName ?? 'Non assigné'}
            onChange={onAssign}
            options={assigneeOptions}
            dot={vm.assignedToUserId ? 'bg-wa-teal' : undefined}
          />
        )}

        {hasClient && clientStatusOptions.length > 0 && (
          <HeaderSelect
            label="Statut du client"
            icon={<UserCog size={16} />}
            value={clientStatusValue}
            valueLabel={
              clientStatusValue ? statusLabel(clientStatusValue.toLowerCase()) : 'Aucun'
            }
            onChange={(v) => v && onChangeClientStatus?.(v)}
            options={clientStatusOptions}
            tone={clientTone?.text}
            dot={clientTone?.dot}
          />
        )}

        {channelStatusOptions.length > 0 && (
          // Write-only: the API exposes no read for a contact-channel status,
          // so the control applies a new one rather than reflecting the current.
          <HeaderSelect
            label="Statut du numéro"
            icon={<Phone size={16} />}
            value=""
            valueLabel="non lisible via l'API — cliquer pour en appliquer un"
            onChange={(v) => v && onChangeChannelStatus?.(v)}
            options={channelStatusOptions}
          />
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-0.5 shrink-0">
        <IconButton label="Médias et documents" onClick={onOpenGallery}>
          <Images size={20} />
        </IconButton>

        <IconButton
          label="Recharger les messages"
          onClick={onReload}
          disabled={isReloading}
        >
          <RefreshCw size={20} className={cn(isReloading && 'animate-spin')} />
        </IconButton>

        <IconButton label="Rechercher" onClick={onToggleSearch} active={!!chatSearch}>
          <Search size={20} />
        </IconButton>

        {/* 3-dots menu */}
        <div className="relative">
          <IconButton label="Plus d'options" onClick={() => setShowMenu((v) => !v)}>
            <MoreVertical size={20} />
          </IconButton>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: -4 }}
                transition={{ duration: 0.1 }}
                className="absolute right-0 top-11 bg-white rounded-xl shadow-xl border border-wa-border py-1.5 z-50 min-w-[220px] max-h-[70vh] overflow-y-auto"
              >
                {/* ── Status section (mirrors the inline chips below xl) ── */}
                <div className={cn('px-4 pt-1 pb-1', showInlineControls && 'md:hidden')}>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-wa-muted mb-1">
                    Statut de la conversation
                  </p>
                  {STATUS_ORDER.map((s) => {
                    const cfg = statusConfig[s];
                    const isActive = vm.status === s;
                    return (
                      <button
                        key={s}
                        className={cn(
                          'flex items-center gap-2.5 w-full px-2 py-2 text-sm rounded-lg transition-colors',
                          isActive
                            ? 'bg-wa-active font-semibold ' + cfg.activeClass
                            : 'text-wa-text hover:bg-wa-hover'
                        )}
                        onClick={() => { onStatusChange(s); setShowMenu(false); }}
                      >
                        <span className={isActive ? cfg.activeClass : 'text-wa-icon'}>{cfg.icon}</span>
                        {cfg.label}
                        {isActive && <CheckCheck size={13} className="ml-auto text-wa-teal" />}
                      </button>
                    );
                  })}
                  <div className="h-px bg-wa-border -mx-1 my-1" />
                </div>

                {/* ── Assign section ── */}
                {users.length > 0 && (
                  <div className={cn('px-4 pt-1 pb-1', showInlineControls && 'md:hidden')}>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-wa-muted mb-1">
                      Assigné à
                    </p>
                    <MenuDropdown
                      label="Assigné à"
                      icon={<UserCheck size={15} />}
                      value={vm.assignedToUserId}
                      display={vm.assignedName ?? 'Non assigné'}
                      options={assigneeOptions}
                      onChange={(v) => { onAssign(v); setShowMenu(false); }}
                    />
                    <div className="h-px bg-wa-border -mx-1 my-1" />
                  </div>
                )}

                {/* ── Client / number status ── */}
                {((hasClient && clientStatuses.length > 0) ||
                  channelStatuses.length > 0) && (
                  <div
                    className={cn(
                      'px-4 pt-1 pb-1 space-y-1.5',
                      showInlineControls && 'md:hidden',
                    )}
                  >
                    {hasClient && clientStatuses.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-wa-muted mb-1">
                          Statut du client
                        </p>
                        <MenuDropdown
                          label="Statut du client"
                          icon={<UserCog size={15} />}
                          value={clientStatusValue}
                          display={
                            clientStatusValue
                              ? statusLabel(clientStatusValue.toLowerCase())
                              : 'Choisir un statut…'
                          }
                          options={clientStatusOptions}
                          onChange={(v) => {
                            if (v) onChangeClientStatus?.(v);
                            setShowMenu(false);
                          }}
                        />
                      </div>
                    )}
                    {channelStatuses.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-wa-muted mb-1">
                          Statut du numéro
                        </p>
                        <MenuDropdown
                          label="Statut du numéro"
                          icon={<Phone size={15} />}
                          value=""
                          display="Changer le statut…"
                          options={channelStatusOptions}
                          onChange={(v) => {
                            if (v) onChangeChannelStatus?.(v);
                            setShowMenu(false);
                          }}
                        />
                      </div>
                    )}
                    <div className="h-px bg-wa-border -mx-1 my-1" />
                  </div>
                )}

                {/* ── Other actions ── */}
                <button
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-wa-text hover:bg-wa-hover transition-colors"
                  onClick={() => { onOpenGallery(); setShowMenu(false); }}
                >
                  <Images size={15} className="text-wa-icon" />
                  Médias et documents
                </button>
                <button
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-wa-text hover:bg-wa-hover transition-colors"
                  onClick={() => { onReload(); setShowMenu(false); }}
                >
                  <RefreshCw size={15} className="text-wa-icon" />
                  Recharger les messages
                </button>
                <button
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-wa-text hover:bg-wa-hover transition-colors"
                  onClick={() => { onSendFlow(); setShowMenu(false); }}
                >
                  <Zap size={15} className="text-wa-icon" />
                  Envoyer un Flow
                </button>
                <button
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-wa-text hover:bg-wa-hover transition-colors"
                  onClick={() => { onSendTemplate(); setShowMenu(false); }}
                >
                  <LayoutTemplate size={15} className="text-wa-icon" />
                  Envoyer un template
                </button>
                <button
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-wa-text hover:bg-wa-hover transition-colors"
                  onClick={() => { onShowDetails(); setShowMenu(false); }}
                >
                  <Info size={15} className="text-wa-icon" />
                  Détails de la conversation
                </button>
                {vm.assignedName && (
                  <p className="flex items-center gap-2.5 px-4 py-2 text-xs text-wa-muted">
                    <MessageSquare size={13} className="text-wa-icon" />
                    Assignée à {vm.assignedName}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Click-outside overlay */}
      {showMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
      )}
    </div>
  );
};
