import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { LocalFile } from "@/api/endpoints";
import { ChatHeader, ChatSearchBar } from "@/components/chat/ChatHeader";
import {
  AssignSheet,
  ChannelStatusSheet,
  ChatMenuSheet,
  FlowSheet,
  MessageActionsSheet,
  MessageDetailsSheet,
  StatusSheet,
  TemplateSheet,
} from "@/components/chat/ChatSheets";
import { MediaComposer } from "@/components/chat/MediaComposer";
import { MediaLightbox, type LightboxState } from "@/components/chat/MediaLightbox";
import { ConversationDetailsPanel } from "@/components/chat/ConversationDetailsPanel";
import { DayPicker } from "@/components/chat/DayPicker";
import { MessagesList } from "@/components/chat/MessagesList";
import { MessageInput } from "@/components/chat/MessageInput";
import { QuickRepliesSheet } from "@/components/chat/QuickRepliesSheet";
import { FullScreenLoader } from "@/components/shared/Loader";
import { Sheet } from "@/components/shared/Sheet";
import { useChatViewModel, type MessageViewModel } from "@/hooks/useChatViewModel";
import { useSendFlow, useUsers, type PendingMedia } from "@/hooks/useWhatsapp";
import { useContactChannel, useWhatsappContact } from "@/hooks/useWhatsappContact";
import { toast } from "@/lib/toast";
import { colors } from "@/theme";

const CLOSED_LIGHTBOX: LightboxState = { type: null, uri: "" };

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversationId = typeof id === "string" ? id : null;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    activeConv,
    convUnavailable,
    chatHeaderVM,
    messageVMs,
    msgsLoading,
    hasOlder,
    isLoadingOlder,
    loadOlder,
    searchBaseCount,
    searchTotalCount,
    canWidenSearchBase,
    searchExtendSize,
    matchCount,
    activeMatchPosition,
    canGoOlder,
    canGoNewer,
    activeMatchId,
    goToPrevMatch,
    goToNextMatch,
    widenSearchBase,
    isExtendingForSearch,
    scrollTargetId,
    clearScrollTarget,
    availableDays,
    jumpToDate,
    isJumpingToDate,
    galleryItems,
    chatSearch,
    setChatSearch,
    replyTo,
    setReplyTo,
    sessionWindowClosed,
    isSending,
    isSendingMedia,
    handleSendMessage,
    handleSendMedia,
    handleStatusChange,
    handleAssign,
    handleSetReply,
    getMessageDetails,
    refetchMessages,
  } = useChatViewModel(conversationId);

  const { data: users = [] } = useUsers();
  // Contact CRM du numéro : sert au libellé du menu et conditionne l'envoi de
  // template, qui adresse un client et non un numéro.
  const contact = useWhatsappContact(activeConv?.contactAddress);
  const contactChannel = useContactChannel();
  const sendFlow = useSendFlow();

  const [searchVisible, setSearchVisible] = useState(false);
  const [lightbox, setLightbox] = useState<LightboxState>(CLOSED_LIGHTBOX);
  const [menuOpen, setMenuOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [detailsView, setDetailsView] = useState<"info" | "gallery" | "contact" | null>(null);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [flowOpen, setFlowOpen] = useState(false);
  const [actionsVm, setActionsVm] = useState<MessageViewModel | null>(null);
  const [msgDetailsId, setMsgDetailsId] = useState<string | null>(null);
  const [pendingMedia, setPendingMedia] = useState<LocalFile[]>([]);

  const [channelStatusOpen, setChannelStatusOpen] = useState(false);
  const [reloading, setReloading] = useState(false);
  const [dayPickerOpen, setDayPickerOpen] = useState(false);
  const [quickRepliesOpen, setQuickRepliesOpen] = useState(false);

  const handleBack = useCallback(() => router.back(), [router]);

  const toggleSearch = useCallback(() => {
    setSearchVisible((visible) => {
      if (visible) setChatSearch("");
      return !visible;
    });
  }, [setChatSearch]);

  const handleOpenImage = useCallback(
    (uri: string, caption?: string) => setLightbox({ type: "image", uri, caption }),
    [],
  );
  const handleOpenVideo = useCallback((uri: string) => setLightbox({ type: "video", uri }), []);

  const handleConfirmMedia = useCallback(
    async (items: PendingMedia[]) => {
      if (items.length === 0) return;
      try {
        await handleSendMedia(items);
        setPendingMedia([]);
      } catch {
        // La mutation a déjà affiché un toast — on laisse le compositeur ouvert
        // pour permettre une nouvelle tentative ou une annulation.
      }
    },
    [handleSendMedia],
  );

  if (!conversationId || convUnavailable) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.error}>Conversation introuvable.</Text>
        <Pressable onPress={handleBack} style={styles.backLink}>
          <Text style={styles.backLinkText}>Retour aux discussions</Text>
        </Pressable>
      </View>
    );
  }

  if (!chatHeaderVM) return <FullScreenLoader label="Chargement de la discussion…" />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Papier peint « doodle » de WhatsApp, comme le web : la tuile couvre
          toute la colonne de conversation, l'en-tête opaque la masque en haut.
          RN ne sait répéter qu'un bitmap, d'où le PNG dans `assets/`. */}
      <ImageBackground
        source={require("../../../assets/chat-doodle.png")}
        resizeMode="repeat"
        imageStyle={styles.wallpaper}
        style={styles.flex}
      >
        <ChatHeader
          vm={chatHeaderVM}
          searchActive={searchVisible || !!chatSearch}
          onBack={handleBack}
          onToggleSearch={toggleSearch}
          onOpenMenu={() => setMenuOpen(true)}
          onShowDetails={() => setDetailsView("info")}
          onOpenGallery={() => setDetailsView("gallery")}
          onStatusPress={() => setStatusOpen(true)}
        />

        <ChatSearchBar
          visible={searchVisible}
          value={chatSearch}
          onChange={setChatSearch}
          matchCount={matchCount}
          activePosition={activeMatchPosition}
          canGoOlder={canGoOlder}
          canGoNewer={canGoNewer}
          onPrevMatch={goToPrevMatch}
          onNextMatch={goToNextMatch}
          searchBaseCount={searchBaseCount}
          searchTotalCount={searchTotalCount}
          canWiden={canWidenSearchBase}
          searchExtendSize={searchExtendSize}
          isExtending={isExtendingForSearch}
          onWiden={widenSearchBase}
          onOpenDayPicker={() => setDayPickerOpen(true)}
          onClose={() => {
            setSearchVisible(false);
            setChatSearch("");
          }}
        />

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <MessagesList
            conversationId={conversationId}
            vms={messageVMs}
            isLoading={msgsLoading}
            hasOlder={hasOlder}
            isLoadingOlder={isLoadingOlder}
            onLoadOlder={loadOlder}
            activeMatchId={activeMatchId}
            highlightTerm={chatSearch}
            scrollTargetId={scrollTargetId}
            onScrollTargetReached={clearScrollTarget}
            onLongPressMessage={setActionsVm}
            onOpenImage={handleOpenImage}
            onOpenVideo={handleOpenVideo}
          />

          <View style={{ paddingBottom: insets.bottom }}>
            <MessageInput
              replyTo={replyTo}
              onCancelReply={() => setReplyTo(null)}
              onSend={handleSendMessage}
              onPickMedia={setPendingMedia}
              onOpenTemplate={() => setTemplateOpen(true)}
              onManageQuickReplies={() => setQuickRepliesOpen(true)}
              disabled={sessionWindowClosed}
              isSending={isSending}
            />
          </View>
        </KeyboardAvoidingView>

      </ImageBackground>

      {/* Monté à chaque ouverture : la légende saisie ne doit pas survivre au
          fichier précédent. */}
      {pendingMedia.length > 0 ? (
        <MediaComposer
          files={pendingMedia}
          isSending={isSendingMedia}
          onSend={handleConfirmMedia}
          onCancel={() => setPendingMedia([])}
        />
      ) : null}

      <MediaLightbox state={lightbox} onClose={() => setLightbox(CLOSED_LIGHTBOX)} />

      <ChatMenuSheet
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onSearch={() => setSearchVisible(true)}
        assignedName={chatHeaderVM.assignedName}
        onStatus={() => setStatusOpen(true)}
        onAssign={() => setAssignOpen(true)}
        onDetails={() => setDetailsView("info")}
        onTemplate={() => setTemplateOpen(true)}
        onFlow={() => setFlowOpen(true)}
        onContact={() => setDetailsView("contact")}
        onChannelStatus={() => setChannelStatusOpen(true)}
        onReload={() => {
          setReloading(true);
          refetchMessages().finally(() => setReloading(false));
        }}
        hasContact={contact.hasContact}
        contactLoading={contact.isLoading}
      />

      <ChannelStatusSheet
        open={channelStatusOpen}
        statuses={contactChannel.statuses}
        onClose={() => setChannelStatusOpen(false)}
        onSelect={(status) =>
          contactChannel.changeStatus(chatHeaderVM.contactAddress, status)
        }
      />

      <StatusSheet
        open={statusOpen}
        current={chatHeaderVM.status}
        onClose={() => setStatusOpen(false)}
        onSelect={handleStatusChange}
      />

      <AssignSheet
        open={assignOpen}
        users={users}
        currentUserId={chatHeaderVM.assignedToUserId}
        onClose={() => setAssignOpen(false)}
        onSelect={handleAssign}
      />

      <QuickRepliesSheet
        open={quickRepliesOpen}
        onClose={() => setQuickRepliesOpen(false)}
      />

      <Sheet
        open={dayPickerOpen}
        onClose={() => setDayPickerOpen(false)}
        title="Aller à une date"
        scroll
      >
        <DayPicker
          availableDays={availableDays}
          busy={isJumpingToDate}
          onSelect={async (day) => {
            const found = await jumpToDate(day);
            setDayPickerOpen(false);
            if (!found) toast.error("Aucun message trouvé à cette date");
          }}
        />
      </Sheet>

      {detailsView && activeConv ? (
        <ConversationDetailsPanel
          open
          initialView={detailsView}
          onClose={() => setDetailsView(null)}
          conv={activeConv}
          initials={chatHeaderVM.initials}
          avatarBg={chatHeaderVM.avatarBg}
          client={contact.existing}
          clientLoading={contact.isLoading}
          clientStatuses={contact.statuses}
          channelStatuses={contactChannel.statuses}
          products={contact.products}
          isSavingContact={contact.isSaving}
          users={users}
          galleryItems={galleryItems}
          hasOlder={hasOlder}
          isLoadingOlder={isLoadingOlder}
          onLoadOlder={loadOlder}
          onOpenMedia={(type, url, caption) => setLightbox({ type, uri: url, caption })}
          onStatusChange={handleStatusChange}
          onAssign={handleAssign}
          onClientStatusChange={contact.changeStatus}
          onChannelStatusChange={(status) =>
            contactChannel.changeStatus(chatHeaderVM.contactAddress, status)
          }
          onSaveContact={contact.save}
          onSearch={() => {
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
        />
      ) : null}

      <MessageActionsSheet
        vm={actionsVm}
        onClose={() => setActionsVm(null)}
        onReply={(vm) => handleSetReply(vm.rawMessage)}
        onDetails={setMsgDetailsId}
      />

      <MessageDetailsSheet
        open={!!msgDetailsId}
        msg={msgDetailsId ? (getMessageDetails(msgDetailsId) ?? null) : null}
        onClose={() => setMsgDetailsId(null)}
      />

      <TemplateSheet
        open={templateOpen}
        onClose={() => setTemplateOpen(false)}
        clientId={contact.existing?.id ?? null}
        clientLoading={contact.isLoading}
        contactAddress={chatHeaderVM.contactAddress}
        onCreateContact={() => setDetailsView("contact")}
      />


      <FlowSheet
        open={flowOpen}
        onClose={() => setFlowOpen(false)}
        isSending={sendFlow.isPending}
        contactAddress={chatHeaderVM.contactAddress}
        onSubmit={(flowToken) => {
          setFlowOpen(false);
          sendFlow.mutate({ to: chatHeaderVM.contactAddress, flowToken });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.chatBg },
  // 6 % — la même opacité que le web pour sa tuile.
  wallpaper: { opacity: 0.06 },
  flex: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  error: { fontSize: 14, color: colors.muted },
  backLink: { paddingHorizontal: 14, paddingVertical: 8 },
  backLinkText: { fontSize: 14, fontWeight: "600", color: colors.teal },
});
