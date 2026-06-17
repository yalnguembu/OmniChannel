import React from 'react';
import { cn } from '@/lib/utils';
import { AvatarInitials } from '../shared/AvatarInitials';
import { UnreadBadge, StatusDot } from '../shared/StatusBadges';
import type { ConversationViewModel } from '@/hooks/sidebarViewModel';

interface ConversationItemProps {
  vm: ConversationViewModel;
  onSelect: (id: string) => void;
}

export const ConversationItem = React.memo<ConversationItemProps>(({ vm, onSelect }) => (
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
        <span
          className={cn(
            'text-[13px] leading-[1.3] truncate flex items-center gap-1.5 flex-1',
            vm.unread > 0 ? 'text-wa-text font-medium' : 'text-wa-muted'
          )}
        >
          <StatusDot status={vm.status} />
          {vm.preview}
        </span>
        <UnreadBadge count={vm.unread} />
      </div>
    </div>
  </div>
));

ConversationItem.displayName = 'ConversationItem';
