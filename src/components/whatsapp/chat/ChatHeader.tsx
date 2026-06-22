import React, { useState } from 'react';
import {
  Search,
  MoreVertical,
  ArrowLeft,
  Info,
  Zap,
  CheckCircle2,
  Clock,
  CheckCheck,
  XCircle,
  UserCheck,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { AvatarInitials } from '../shared/AvatarInitials';
import { IconButton } from '../shared/IconButton';
import { cn } from '@/lib/utils';
import type { ConversationStatus, User } from '@/models/whatsapp.models';

interface ChatHeaderVM {
  initials: string;
  avatarBg: string;
  name: string;
  sub: string;
  status: string;
  assignedToUserId: string;
  contactAddress: string;
}

interface ChatHeaderProps {
  vm: ChatHeaderVM;
  users: User[];
  chatSearch: string;
  onStatusChange: (status: ConversationStatus) => void;
  onAssign: (userId: string) => void;
  onToggleSearch: () => void;
  onShowDetails: () => void;
  onBack: () => void;
  onSendFlow: () => void;
}

const statusConfig: Record<string, { label: string; icon: React.ReactNode; activeClass: string }> = {
  OPEN:     { label: 'Ouverte',    icon: <CheckCircle2  size={15} />, activeClass: 'text-wa-status-open' },
  PENDING:  { label: 'En attente', icon: <Clock         size={15} />, activeClass: 'text-wa-status-pending' },
  RESOLVED: { label: 'Résolue',   icon: <CheckCheck    size={15} />, activeClass: 'text-wa-status-resolved' },
  CLOSED:   { label: 'Fermée',    icon: <XCircle       size={15} />, activeClass: 'text-wa-status-closed' },
};

const STATUS_ORDER = ['OPEN', 'PENDING', 'RESOLVED', 'CLOSED'] as const;

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  vm,
  users,
  chatSearch,
  onStatusChange,
  onAssign,
  onToggleSearch,
  onShowDetails,
  onBack,
  onSendFlow,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const current = statusConfig[vm.status] ?? statusConfig['OPEN'];

  return (
    <div className="bg-wa-header px-3 py-3 flex items-center gap-2.5 min-h-20 border-b border-wa-border shrink-0 relative">
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

      {/* Name + sub */}
      <div className="flex-1 min-w-0 cursor-pointer" onClick={onShowDetails}>
        <div className="lg:text-lg font-semibold text-wa-text truncate leading-snug">
          {vm.name}
        </div>
        <div className="text-xs text-wa-muted truncate leading-snug">{vm.sub}</div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-0.5">
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
                className="absolute right-0 top-11 bg-white rounded-xl shadow-xl border border-wa-border py-1.5 z-50 min-w-[220px] overflow-hidden"
              >
                {/* ── Status section ── */}
                <div className="px-4 pt-1 pb-1">
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
                </div>

                <div className="h-px bg-wa-border mx-3 my-1" />

                {/* ── Assign section ── */}
                {users.length > 0 && (
                  <>
                    <div className="px-4 pt-1 pb-1">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-wa-muted mb-1">
                        Assigné à
                      </p>
                      <div className="flex items-center gap-2 px-2 py-1.5">
                        <UserCheck size={15} className="text-wa-icon shrink-0" />
                        <select
                          value={vm.assignedToUserId}
                          onChange={(e) => { onAssign(e.target.value); setShowMenu(false); }}
                          className="flex-1 text-sm text-wa-text bg-transparent outline-none cursor-pointer"
                        >
                          <option value="">Non assigné</option>
                          {users.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.firstName} {u.lastName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="h-px bg-wa-border mx-3 my-1" />
                  </>
                )}

                {/* ── Other actions ── */}
                <button
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-wa-text hover:bg-wa-hover transition-colors"
                  onClick={() => { onSendFlow(); setShowMenu(false); }}
                >
                  <Zap size={15} className="text-wa-icon" />
                  Envoyer un Flow
                </button>
                <button
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-wa-text hover:bg-wa-hover transition-colors"
                  onClick={() => { onShowDetails(); setShowMenu(false); }}
                >
                  <Info size={15} className="text-wa-icon" />
                  Détails de la conversation
                </button>
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
