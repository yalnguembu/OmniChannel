import React from 'react';
import { Loader2 } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import type { MessageViewModel } from '@/hooks/chatViewModel';

interface MessagesListProps {
  vms: MessageViewModel[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onReply: (vm: MessageViewModel) => void;
  onInfo: (id: string) => void;
  onImageClick: (url: string, alt: string) => void;
}

function formatDateSep(ts: string | null | undefined): string {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return 'Hier';
  if (diff < 7) return d.toLocaleDateString('fr-FR', { weekday: 'long' });
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

/* WhatsApp background pattern — subtle tile */

export const MessagesList: React.FC<MessagesListProps> = ({
  vms,
  isLoading,
  messagesEndRef,
  onReply,
  onInfo,
  onImageClick,
}) => {
  let lastDate = '';

  return (
    <div
      className="flex-1 overflow-y-auto px-[5%] py-3 flex flex-col gap-1 [scrollbar-width:thin] [scrollbar-color:rgba(0,0,0,0.15)_transparent]"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-wa-green" />
        </div>
      ) : vms.length === 0 ? (
        <div className="text-center text-wa-muted text-sm py-12">Aucun message</div>
      ) : (
        <>
          {vms.map((vm) => {
            const ts = vm.rawMessage.sentAt || vm.rawMessage.receivedAt || vm.rawMessage.createdAt;
            const dateSep = formatDateSep(ts);
            const showSep = dateSep && dateSep !== lastDate;
            if (showSep) lastDate = dateSep;

            return (
              <React.Fragment key={vm.id}>
                {showSep && (
                  <div className="self-center bg-white/80 backdrop-blur-sm px-3 py-1 rounded-lg text-xs text-wa-icon my-2 shadow-sm">
                    {dateSep}
                  </div>
                )}
                <MessageBubble
                  vm={vm}
                  onReply={() => onReply(vm)}
                  onInfo={() => onInfo(vm.id)}
                  onImageClick={onImageClick}
                />
              </React.Fragment>
            );
          })}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};
