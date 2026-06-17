import React, { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { ChatHeader } from "./ChatHeader";
import { ChatSearchBar } from "./ChatSearchBar";
import { MessagesList } from "./MessagesList";
import { MessageInput } from "./MessageInput";
import { ChatPlaceholder } from "./ChatPlaceholder";
import { LightboxModal } from "./LightboxModal";
import { ConvDetailsModal, MsgDetailsModal, FlowModal } from "./Modals";
import { useChatViewModel } from "@/hooks/chatViewModel";
import type { MessageViewModel } from "@/hooks/chatViewModel";
import { useWhatsAppStore } from "@/store/useWhatsappStore";
import { useSendFlow } from "@/hooks/useWhatsapp";

export const ChatArea: React.FC = () => {
  const { activeConversationId, users } = useWhatsAppStore();
  const {
    activeConv,
    chatHeaderVM,
    messageVMs,
    msgsLoading,
    chatSearch,
    setChatSearch,
    replyTo,
    setReplyTo,
    inputRef,
    isSending,
    handleSendMessage,
    handleSendMedia,
    handleStatusChange,
    handleAssign,
    handleSetReply,
    handleBack,
    getMessageDetails,
  } = useChatViewModel();

  const [searchVisible, setSearchVisible] = useState(false);
  const [lightbox, setLightbox] = useState<{
    open: boolean;
    type: "image" | "video" | null;
    src: string;
    caption?: string;
  }>({ open: false, type: null, src: "" });
  const [convDetailsOpen, setConvDetailsOpen] = useState(false);
  const [msgDetailsId, setMsgDetailsId] = useState<string | null>(null);
  const [flowOpen, setFlowOpen] = useState(false);

  const sendFlow = useSendFlow();

  // Stable callbacks — prevents breaking React.memo on MessageBubble
  const handleImageClick = useCallback((url: string, alt: string) => {
    setLightbox({ open: true, type: "image", src: url, caption: alt });
  }, []);

  const handleReplyMessage = useCallback(
    (vm: MessageViewModel) => {
      handleSetReply(vm.rawMessage);
    },
    [handleSetReply]
  );

  const handleInfoMessage = useCallback((id: string) => {
    setMsgDetailsId(id);
  }, []);

  const handleToggleSearch = () => {
    setSearchVisible((v) => !v);
    if (searchVisible) setChatSearch("");
  };

  const handleFlowSubmit = (token: string) => {
    if (!activeConv) return;
    sendFlow.mutate({ to: activeConv.contactAddress ?? "", flowToken: token });
    setFlowOpen(false);
  };

  // Auto-focus input when activeConv changes
  useEffect(() => {
    if (activeConv && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [activeConv, inputRef]);

  // Global Escape to go back
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "Escape" &&
        !lightbox.open &&
        !convDetailsOpen &&
        !msgDetailsId &&
        !flowOpen &&
        !searchVisible
      ) {
        handleBack();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightbox.open, convDetailsOpen, msgDetailsId, flowOpen, searchVisible, handleBack]);

  if (!activeConversationId) {
    return <ChatPlaceholder />;
  }

  return (
    <div
      className="flex-1 flex flex-col overflow-hidden"
      style={{
        backgroundColor: "rgba(234, 230, 223, 0.3)",
        backgroundImage:
          'url("https://static.whatsapp.net/rsrc.php/yx/r/voSdkk88H7C.svg")',
        backgroundBlendMode: "overlay",
        backgroundSize: "70%",
      }}
    >
      <motion.div
        className="flex-1 flex flex-col overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        style={{ backgroundColor: "rgba(234, 230, 223, 0.95)" }}
      >
        {chatHeaderVM && (
          <ChatHeader
            vm={chatHeaderVM}
            users={users}
            chatSearch={chatSearch}
            // @ts-expect-error
            onStatusChange={handleStatusChange}
            onAssign={handleAssign}
            onToggleSearch={handleToggleSearch}
            onShowDetails={() => setConvDetailsOpen(true)}
            onBack={handleBack}
            onSendFlow={() => setFlowOpen(true)}
          />
        )}

        <ChatSearchBar
          visible={searchVisible}
          value={chatSearch}
          onChange={setChatSearch}
          onClose={() => {
            setSearchVisible(false);
            setChatSearch("");
          }}
        />

        <MessagesList
          vms={messageVMs}
          isLoading={msgsLoading}
          onReply={handleReplyMessage}
          onInfo={handleInfoMessage}
          onImageClick={handleImageClick}
        />

        <MessageInput
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
          onSend={handleSendMessage}
          onSendMedia={handleSendMedia}
          onOpenFlow={() => setFlowOpen(true)}
          isSending={isSending}
          inputRef={inputRef}
        />

        {/* Modals */}
        <LightboxModal
          open={lightbox.open}
          type={lightbox.type}
          src={lightbox.src}
          caption={lightbox.caption}
          onClose={() => setLightbox({ open: false, type: null, src: "" })}
        />

        <ConvDetailsModal
          open={convDetailsOpen}
          conv={activeConv}
          onClose={() => setConvDetailsOpen(false)}
        />

        <MsgDetailsModal
          open={!!msgDetailsId}
          msg={msgDetailsId ? (getMessageDetails(msgDetailsId) ?? null) : null}
          onClose={() => setMsgDetailsId(null)}
        />

        <FlowModal
          open={flowOpen}
          contactAddress={activeConv?.contactAddress ?? ""}
          onClose={() => setFlowOpen(false)}
          onSubmit={handleFlowSubmit}
          isSending={sendFlow.isPending}
        />
      </motion.div>
    </div>
  );
};
