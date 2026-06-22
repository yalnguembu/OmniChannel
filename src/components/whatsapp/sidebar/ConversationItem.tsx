import React from 'react';
import {
  ArrowUpRight,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  User,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AvatarInitials } from '../shared/AvatarInitials';
import { UnreadBadge, StatusDot } from '../shared/StatusBadges';
import type { ConversationViewModel } from '@/hooks/sidebarViewModel';

// Maps the last-message type to its leading preview icon (replaces the emojis).
const PREVIEW_ICONS: Record<string, LucideIcon> = {
  IMAGE: ImageIcon,
  VIDEO: Video,
  AUDIO: Music,
  DOCUMENT: FileText,
  CONTACT: User,
};

interface ConversationItemProps {
  vm: ConversationViewModel;
  onSelect: (id: string) => void;
}

export const ConversationItem = React.memo<ConversationItemProps>(({ vm, onSelect }) => {
  const PreviewIcon = PREVIEW_ICONS[vm.previewType];
  return (
  <div
    role="listitem"
    tabIndex={0}
    className={cn(
      'flex items-center px-3 py-4 cursor-pointer gap-3 relative outline-none rounded-lg',
      'transition-colors duration-100',
      vm.isActive
        ? 'bg-wa-active/50'
        : 'hover:bg-wa-hover focus-visible:bg-wa-hover focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-wa-teal'
    )}
    onClick={() => onSelect(vm.id)}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect(vm.id);
      }
    }}
  >
    {/* Avatar */}
    <AvatarInitials initials={vm.initials} background={vm.avatarBg} size="lg" />

    <div className="flex-1 min-w-0">
      {/* Row 1: name + time */}
      <div className="flex items-baseline justify-between gap-1">
        <span
          className={cn(
            'text-[16px] leading-[1.3] truncate',
            vm.unread > 0 ? 'text-wa-text font-semibold' : 'text-wa-text font-normal'
          )}
        >
          {vm.name}
          {vm.assigneeName && (
            <span className="ml-2 text-[10px] bg-wa-active border border-wa-border text-wa-muted px-1 py-px rounded align-middle">
              {vm.assigneeName}
            </span>
          )}
        </span>
        <span
          className={cn(
            'text-[12px] shrink-0 tabular-nums',
            vm.unread > 0 ? 'text-wa-green font-semibold' : 'text-wa-muted'
          )}
        >
          {vm.time}
        </span>
      </div>

      {/* Row 2: preview + badge */}
      <div className="flex items-center justify-between gap-1 mt-0.5">
        <div
          className={cn(
            'flex items-center gap-1.5 flex-1 min-w-0 text-[13px] leading-[1.3]',
            vm.unread > 0 ? 'text-wa-text font-medium' : 'text-wa-muted'
          )}
        >
          <StatusDot status={vm.status} />
          {/* Direction marker: an arrow when the last message is outbound
              (sent by us), nothing when it's inbound — like WhatsApp. */}
          {vm.lastOutbound && (
            <ArrowUpRight
              size={14}
              strokeWidth={2.5}
              className="shrink-0 text-wa-muted"
              aria-label="Dernier message envoyé"
            />
          )}
          {PreviewIcon && <PreviewIcon size={14} className="shrink-0 text-wa-muted" />}
          {/* Text in its own node so it truncates while the icons stay fixed. */}
          <span className="truncate">{vm.preview}</span>
        </div>
        <UnreadBadge count={vm.unread} />
      </div>
    </div>
  </div>
  );
});

ConversationItem.displayName = 'ConversationItem';
