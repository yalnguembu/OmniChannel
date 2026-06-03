import React, { useState } from 'react';
import { Toaster } from 'sonner';
import { ConversationList } from '@/components/whatsapp/sidebar/ConversationList';
import { ChatArea } from '@/components/whatsapp//chat/ChatArea';
import { BulkModal } from '@/components/whatsapp//chat/Modals';
import { useSignalR } from '@/hooks/useSignalR';
import { useBulkSend } from '@/hooks/useWhatsapp';
import { useWhatsAppStore } from '@/store/useWhatsappStore';

export const WhatsAppPage: React.FC = () => {
  const { activeConversationId, isMobileChatOpen } = useWhatsAppStore();
  const [bulkOpen, setBulkOpen] = useState(false);
  const bulkSend = useBulkSend();

  // Init SignalR
  useSignalR();

  const handleBulkSubmit = (type: 'j0' | 'j3', file: File) => {
    bulkSend.mutate({ type, file });
    setBulkOpen(false);
  };

  return (
    <>
      <div
        className="flex h-dvh max-w-450 mx-auto bg-white shadow-[0_0_20px_rgba(0,0,0,0.12)] relative overflow-hidden"
        style={{ background: '#dfe5e7' }}
      >
        {/* Sidebar — hidden on mobile when chat is open */}
        <div
          className={`
            absolute inset-0 md:relative md:inset-auto md:translate-x-0
            transition-transform duration-300 ease-in-out
            ${isMobileChatOpen && activeConversationId ? '-translate-x-full' : 'translate-x-0'}
          `}
        >
          <ConversationList onBulkSend={() => setBulkOpen(true)} />
        </div>

        {/* Chat area — slides in on mobile */}
        <div
          className={`
            absolute inset-0 md:relative md:inset-auto md:translate-x-0 flex-1 bg-wa-chat-bg
            transition-transform duration-300 ease-in-out flex flex-col
            ${isMobileChatOpen && activeConversationId ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
          `}
        >
          <ChatArea />
        </div>
      </div>

      {/* Bulk send modal */}
      <BulkModal
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        onSubmit={handleBulkSubmit}
        isSending={bulkSend.isPending}
      />

      <Toaster position="bottom-center" richColors />
    </>
  );
};
