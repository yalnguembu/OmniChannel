import React, { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChatHeader } from "./ChatHeader";
import { ChatSearchBar } from "./ChatSearchBar";
import { MessagesList } from "./MessagesList";
import { MessageInput } from "./MessageInput";
import { MediaPreview } from "./MediaPreview";
import { ChatPlaceholder } from "./ChatPlaceholder";
import { LightboxModal } from "./LightboxModal";
import { MsgDetailsModal, FlowModal } from "./Modals";
import { ConversationDetailsPanel } from "./ConversationDetailsPanel";
import type { DetailsView } from "./ConversationDetailsPanel";
import { TemplateBroadcastModal } from "./TemplateBroadcastModal";
import { useChatViewModel } from "@/hooks/chatViewModel";
import type { MessageViewModel } from "@/hooks/chatViewModel";
import { useWhatsAppStore } from "@/store/useWhatsappStore";
import { useSendFlow, type PendingMedia } from "@/hooks/useWhatsapp";
import {
  useContactChannelStatuses,
  useChangeContactChannelStatus,
} from "@/hooks/useContactChannel";
import {
  getApiClientStatusesOptions,
  patchApiClientStatusByIdMutation,
  postApiClientSearchQueryKey,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import { useWhatsappContactViewModel } from "@/hooks/useWhatsappContactViewModel";
import type { ClientModel } from "@/models/client.model";

export const ChatArea: React.FC = () => {
  // Narrow selectors — a whole-store subscription here re-rendered the chat on
  // every SignalR conversation push.
  const activeConversationId = useWhatsAppStore((s) => s.activeConversationId);
  const users = useWhatsAppStore((s) => s.users);
  const {
    activeConv,
    chatHeaderVM,
    convLoading,
    messageVMs,
    msgsLoading,
    hasOlder,
    isLoadingOlder,
    loadOlder,
    refetchMessages,
    isRefetchingMessages,
    chatSearch,
    setChatSearch,
    matchCount,
    activeMatchPosition,
    activeMatchId,
    canGoOlder,
    canGoNewer,
    goToPrevMatch,
    goToNextMatch,
    isSearching,
    searchBaseCount,
    searchTotalCount,
    canWidenSearchBase,
    widenSearchBase,
    searchExtendSize,
    scrollTargetId,
    clearScrollTarget,
    jumpToDate,
    isJumpingToDate,
    availableDays,
    galleryItems,
    replyTo,
    setReplyTo,
    inputRef,
    isSending,
    isSendingMedia,
    handleSendMessage,
    handleSendMedia,
    handleStatusChange,
    handleAssign,
    handleSetReply,
    handleBack,
    getMessageDetails,
    sessionWindowClosed,
  } = useChatViewModel();

  const [searchVisible, setSearchVisible] = useState(false);
  const [lightbox, setLightbox] = useState<{
    open: boolean;
    type: "image" | "video" | null;
    src: string;
    caption?: string;
  }>({ open: false, type: null, src: "" });
  // The contact-info drawer and the media gallery are one surface with two
  // screens, like WhatsApp — null means closed.
  const [detailsView, setDetailsView] = useState<DetailsView | null>(null);
  const [msgDetailsId, setMsgDetailsId] = useState<string | null>(null);
  const [flowOpen, setFlowOpen] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  // Contact being edited, snapshotted at open time so a background refetch of
  // the phone→client resolution can't mutate the form under the user.
  const [editingContact, setEditingContact] = useState<{
    client: ClientModel | null;
    productId?: string;
  }>({ client: null });
  // The whole picked selection — the composer sends one message per file.
  const [pendingFiles, setPendingFiles] = useState<File[] | null>(null);

  // CRM contact tied to this conversation's phone (add / edit directly here).
  const contactVm = useWhatsappContactViewModel(activeConv?.contactAddress);

  // Pre-select this conversation's client in the template modal when the phone
  // resolves to a CRM contact (the send-template-to-client endpoint needs an id).
  // Memoized so its identity stays stable — otherwise the modal would keep
  // re-applying it and clobber a manually picked client.
  const existingId = contactVm.existing?.id;
  const existingFirst = contactVm.existing?.firstName;
  const existingLast = contactVm.existing?.lastName;
  const contactAddress = activeConv?.contactAddress;
  const templateDefaultClient = React.useMemo(
    () =>
      existingId
        ? {
            id: existingId,
            name:
              `${existingFirst ?? ""} ${existingLast ?? ""}`.trim() ||
              contactAddress ||
              "Client",
            phone: contactAddress ?? "",
          }
        : undefined,
    [existingId, existingFirst, existingLast, contactAddress],
  );

  // ── Client / contact-channel status changes (applicable to a discussion) ──
  const qc = useQueryClient();
  const clientStatusesQ = useQuery({
    ...getApiClientStatusesOptions(),
    select: (r: any) => (r?.data ?? []) as string[],
  });
  const changeClientStatusMut = useMutation({
    ...patchApiClientStatusByIdMutation(),
    onSuccess: () => {
      toast.success("Statut du client mis à jour");
      qc.invalidateQueries({ queryKey: postApiClientSearchQueryKey() });
    },
    onError: () => toast.error("Erreur lors de la mise à jour du statut"),
  });
  const { statuses: channelStatuses } = useContactChannelStatuses();
  const { changeStatus: changeChannelStatus } = useChangeContactChannelStatus();

  const handleChangeClientStatus = useCallback(
    (status: string) => {
      if (existingId)
        changeClientStatusMut.mutate({ path: { id: existingId }, body: { status } });
    },
    [existingId, changeClientStatusMut],
  );
  const handleChangeChannelStatus = useCallback(
    (status: string) => {
      if (contactAddress) changeChannelStatus(contactAddress, status);
    },
    [contactAddress, changeChannelStatus],
  );

  const handleConfirmMedia = useCallback(
    async (items: PendingMedia[]) => {
      if (items.length === 0) return;
      try {
        await handleSendMedia(items);
        setPendingFiles(null);
      } catch {
        // The mutation already surfaced a toast on error — keep the composer
        // open so the user can retry or cancel.
      }
    },
    [handleSendMedia]
  );

  // The CRM client's name is what the header shows first; the number stays
  // on the second line.
  const clientName = React.useMemo(() => {
    const name = `${existingFirst ?? ""} ${existingLast ?? ""}`.trim();
    return name || null;
  }, [existingFirst, existingLast]);

  const handleOpenMedia = useCallback(
    (type: "image" | "video", src: string, caption?: string) => {
      setLightbox({ open: true, type, src, caption });
    },
    [],
  );

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

  // Global Escape: close the media composer first if open, then fall through
  // to leaving the conversation (but never while another overlay owns Escape).
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (
        lightbox.open || detailsView || msgDetailsId || flowOpen ||
        templateOpen || searchVisible
      ) {
        return;
      }
      if (pendingFiles) {
        setPendingFiles(null);
        return;
      }
      handleBack();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightbox.open, detailsView, msgDetailsId, flowOpen, templateOpen, searchVisible, pendingFiles, handleBack]);

  if (!activeConversationId) {
    return <ChatPlaceholder />;
  }

  return (
    <div className="flex-1 flex min-w-0 overflow-hidden">
      {/* Conversation column — shrinks when the details drawer opens */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden relative bg-[#efeae2]">
        {/* WhatsApp doodle wallpaper — its own faded layer instead of a blend
            mode, which the (previously opaque) content layer painted over. If
            the remote tile fails to load, the #efeae2 base is exactly what
            WhatsApp falls back to. */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{
            backgroundImage:
              'url("https://static.whatsapp.net/rsrc.php/yx/r/voSdkk88H7C.svg")',
            backgroundRepeat: "repeat",
            backgroundSize: "412.5px 749.25px",
          }}
        />
        <motion.div
          className="flex-1 flex flex-col overflow-hidden relative z-[1]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
        >
          {/* On a reload the conversation is fetched by id, so the header would
              otherwise blink out entirely until it lands. */}
          {!chatHeaderVM && (convLoading || !activeConv) && (
            <div className="flex min-h-20 shrink-0 items-center gap-2.5 border-b border-wa-border bg-wa-header px-3 py-2.5">
              <div className="size-12 animate-pulse rounded-full bg-wa-input-bg" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-40 animate-pulse rounded bg-wa-input-bg" />
                <div className="h-2.5 w-28 animate-pulse rounded bg-wa-input-bg" />
              </div>
            </div>
          )}

          {chatHeaderVM && (
            <ChatHeader
              vm={chatHeaderVM}
              clientName={clientName}
              showInlineControls={detailsView === null}
              users={users}
              chatSearch={chatSearch}
              onStatusChange={handleStatusChange}
              onAssign={handleAssign}
              onToggleSearch={handleToggleSearch}
              onShowDetails={() => setDetailsView("info")}
              onOpenGallery={() => setDetailsView("gallery")}
              onReload={() => refetchMessages()}
              isReloading={isRefetchingMessages}
              onBack={handleBack}
              onSendFlow={() => setFlowOpen(true)}
              onSendTemplate={() => setTemplateOpen(true)}
              hasClient={contactVm.hasContact}
              clientStatuses={clientStatusesQ.data ?? []}
              currentClientStatus={contactVm.existing?.status}
              onChangeClientStatus={handleChangeClientStatus}
              channelStatuses={channelStatuses}
              onChangeChannelStatus={handleChangeChannelStatus}
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
            matchCount={matchCount}
            activePosition={activeMatchPosition}
            canGoOlder={canGoOlder}
            canGoNewer={canGoNewer}
            onPrevMatch={goToPrevMatch}
            onNextMatch={goToNextMatch}
            isSearching={isSearching}
            searchBaseCount={searchBaseCount}
            searchTotalCount={searchTotalCount}
            canWidenSearchBase={canWidenSearchBase}
            onWidenSearchBase={widenSearchBase}
            searchExtendSize={searchExtendSize}
            onJumpToDate={jumpToDate}
            isJumpingToDate={isJumpingToDate}
            availableDays={availableDays}
          />

          <MessagesList
            conversationId={activeConversationId}
            vms={messageVMs}
            isLoading={msgsLoading}
            hasOlder={hasOlder}
            isLoadingOlder={isLoadingOlder}
            onLoadOlder={loadOlder}
            highlightTerm={chatSearch}
            activeMatchId={activeMatchId}
            scrollTargetId={scrollTargetId}
            onScrollTargetConsumed={clearScrollTarget}
            onReply={handleReplyMessage}
            onInfo={handleInfoMessage}
            onImageClick={handleImageClick}
          />

          <MessageInput
            replyTo={replyTo}
            onCancelReply={() => setReplyTo(null)}
            onSend={handleSendMessage}
            onPickMedia={setPendingFiles}
            onOpenFlow={() => setFlowOpen(true)}
            onOpenTemplate={() => setTemplateOpen(true)}
            disabled={sessionWindowClosed}
            isSending={isSending}
            inputRef={inputRef}
          />

          {/* Media composer — WhatsApp-style preview, one caption per file */}
          {pendingFiles && pendingFiles.length > 0 && (
            <MediaPreview
              files={pendingFiles}
              onSend={handleConfirmMedia}
              onCancel={() => setPendingFiles(null)}
              isSending={isSendingMedia}
            />
          )}

          {/* Modals */}
          <LightboxModal
            open={lightbox.open}
            type={lightbox.type}
            src={lightbox.src}
            caption={lightbox.caption}
            onClose={() => setLightbox({ open: false, type: null, src: "" })}
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

          {templateOpen && (
            <TemplateBroadcastModal
              open={templateOpen}
              onClose={() => setTemplateOpen(false)}
              defaultMode="client"
              defaultClient={templateDefaultClient}
            />
          )}
        </motion.div>
      </div>

      {/* Contact info — docked drawer on desktop, bottom sheet on mobile.
          A sibling of the conversation column, so opening it narrows the chat
          the way WhatsApp Web and Telegram do instead of covering it. */}
      <ConversationDetailsPanel
        view={detailsView}
        onViewChange={setDetailsView}
        onClose={() => setDetailsView(null)}
        conv={activeConv}
        clientName={clientName}
        client={contactVm.existingRaw}
        hasContact={contactVm.hasContact}
        contactLoading={contactVm.isLoading}
        onSearch={() => {
          // Those are dialogs (z-50) and the mobile sheet sits above them, so
          // the panel hands over instead of stacking.
          setDetailsView(null);
          setSearchVisible(true);
        }}
        onSendTemplate={() => {
          setDetailsView(null);
          setTemplateOpen(true);
        }}
        onSendFlow={() => {
          setDetailsView(null);
          setFlowOpen(true);
        }}
        users={users}
        onStatusChange={handleStatusChange}
        onAssign={handleAssign}
        clientStatuses={clientStatusesQ.data ?? []}
        currentClientStatus={contactVm.existing?.status}
        onChangeClientStatus={handleChangeClientStatus}
        channelStatuses={channelStatuses}
        onChangeChannelStatus={handleChangeChannelStatus}
        galleryItems={galleryItems}
        hasOlder={hasOlder}
        isLoadingOlder={isLoadingOlder}
        onLoadOlder={loadOlder}
        onOpenMedia={handleOpenMedia}
        onManageContact={() => {
          // Freeze the resolved contact (and its product) at open time, so a
          // background refetch can't swap the form's subject mid-edit.
          setEditingContact({
            client: contactVm.existing,
            productId: contactVm.existingProductId,
          });
          setDetailsView("contact");
        }}
        editingContact={editingContact.client}
        editingProductId={
          editingContact.client ? editingContact.productId : undefined
        }
        contactProducts={editingContact.client ? undefined : contactVm.products}
        contactPrefill={
          editingContact.client
            ? undefined
            : {
                phone: activeConv?.contactAddress ?? "",
                firstName:
                  activeConv?.contactName &&
                  activeConv.contactName !== activeConv.contactAddress
                    ? activeConv.contactName
                    : "",
              }
        }
        isSavingContact={contactVm.isSaving}
        onSaveContact={async (body) => {
          const ok = await contactVm.save(body);
          if (ok) setDetailsView("info");
        }}
      />
    </div>
  );
};
