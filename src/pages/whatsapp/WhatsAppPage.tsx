import React, { useEffect, useState } from "react";
import { ConversationList } from "@/components/whatsapp/sidebar/ConversationList";
import { ChatArea } from "@/components/whatsapp/chat/ChatArea";
import { TemplateBroadcastModal } from "@/components/whatsapp/chat/TemplateBroadcastModal";
import { useSignalR } from "@/hooks/useSignalR";
import { useWhatsAppStore } from "@/store/useWhatsappStore";

interface WhatsAppPageProps {
  senderId?: string;
}

export const WhatsAppPage: React.FC<WhatsAppPageProps> = ({ senderId }) => {
  const { activeConversationId, isMobileChatOpen, setSelectedSenderId } =
    useWhatsAppStore();
  const [tplOpen, setTplOpen] = useState(false);

  useEffect(() => {
    setSelectedSenderId(senderId ?? null);
  }, [senderId, setSelectedSenderId]);

  useSignalR();

  return (
    <>
      <div
        className="flex h-dvh max-w-450 mx-auto bg-white shadow-[0_0_20px_rgba(0,0,0,0.12)] relative overflow-hidden"
        style={{ background: "#dfe5e7" }}
      >
        {/* Sidebar — hidden on mobile when chat is open */}
        <div
          className={`
            absolute inset-0 md:relative md:inset-auto md:translate-x-0
            transition-transform duration-300 ease-in-out
            ${isMobileChatOpen && activeConversationId ? "-translate-x-full" : "translate-x-0"}
          `}
        >
          <ConversationList onTemplateBroadcast={() => setTplOpen(true)} />
        </div>

        {/* Chat area — slides in on mobile */}
        <div
          className={`
            absolute inset-0 md:relative md:inset-auto md:translate-x-0 flex-1 bg-wa-chat-bg
            transition-transform duration-300 ease-in-out flex flex-col
            ${isMobileChatOpen && activeConversationId ? "translate-x-0" : "translate-x-full md:translate-x-0"}
          `}
        >
          <ChatArea />
        </div>
      </div>

      <TemplateBroadcastModal
        open={tplOpen}
        onClose={() => setTplOpen(false)}
      />
    </>
  );
};
