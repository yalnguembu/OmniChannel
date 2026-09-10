import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
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
  ConversationDetailsSheet,
  FlowSheet,
  MessageActionsSheet,
  MessageDetailsSheet,
  StatusSheet,
  TemplateSheet,
} from "@/components/chat/ChatSheets";
import { MediaComposer } from "@/components/chat/MediaComposer";
import { MediaLightbox, type LightboxState } from "@/components/chat/MediaLightbox";
import { ContactSheet } from "@/components/chat/ContactSheet";
import { MessagesList } from "@/components/chat/MessagesList";
import { MessageInput } from "@/components/chat/MessageInput";
import { FullScreenLoader } from "@/components/shared/Loader";
import { useChatViewModel, type MessageViewModel } from "@/hooks/useChatViewModel";
import { useSendFlow, useUsers } from "@/hooks/useWhatsapp";
import { useContactChannel, useWhatsappContact } from "@/hooks/useWhatsappContact";
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
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [flowOpen, setFlowOpen] = useState(false);
  const [actionsVm, setActionsVm] = useState<MessageViewModel | null>(null);
  const [msgDetailsId, setMsgDetailsId] = useState<string | null>(null);
  const [pendingMedia, setPendingMedia] = useState<LocalFile | null>(null);
  const [contactOpen, setContactOpen] = useState(false);
  const [channelStatusOpen, setChannelStatusOpen] = useState(false);

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
    async (caption: string) => {
      if (!pendingMedia) return;
      try {
        await handleSendMedia(pendingMedia, caption || undefined);
        setPendingMedia(null);
      } catch {
        // La mutation a déjà affiché un toast — on laisse le compositeur ouvert
        // pour permettre une nouvelle tentative ou une annulation.
      }
    },
    [pendingMedia, handleSendMedia],
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
      <ChatHeader
        vm={chatHeaderVM}
        onBack={handleBack}
        onToggleSearch={toggleSearch}
        onOpenMenu={() => setMenuOpen(true)}
      />

      <ChatSearchBar
        visible={searchVisible}
        value={chatSearch}
        onChange={setChatSearch}
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
            disabled={sessionWindowClosed}
            isSending={isSending}
          />
        </View>
      </KeyboardAvoidingView>

      {/* Monté à chaque ouverture : la légende saisie ne doit pas survivre au
          fichier précédent. */}
      {pendingMedia ? (
        <MediaComposer
          file={pendingMedia}
          isSending={isSendingMedia}
          onSend={handleConfirmMedia}
          onCancel={() => setPendingMedia(null)}
        />
      ) : null}

      <MediaLightbox state={lightbox} onClose={() => setLightbox(CLOSED_LIGHTBOX)} />

      <ChatMenuSheet
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onSearch={() => setSearchVisible(true)}
        onStatus={() => setStatusOpen(true)}
        onAssign={() => setAssignOpen(true)}
        onDetails={() => setDetailsOpen(true)}
        onTemplate={() => setTemplateOpen(true)}
        onFlow={() => setFlowOpen(true)}
        onContact={() => setContactOpen(true)}
        onChannelStatus={() => setChannelStatusOpen(true)}
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

      <ConversationDetailsSheet
        open={detailsOpen}
        conv={activeConv}
        onClose={() => setDetailsOpen(false)}
      />

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
        onCreateContact={() => setContactOpen(true)}
      />

      {contactOpen ? (
        <ContactSheet
          open
          onClose={() => setContactOpen(false)}
          phone={chatHeaderVM.contactAddress}
          suggestedName={activeConv?.contactName}
          existing={contact.existing}
          products={contact.products}
          statuses={contact.statuses}
          isSaving={contact.isSaving}
          onSave={contact.save}
        />
      ) : null}

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
  flex: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  error: { fontSize: 14, color: colors.muted },
  backLink: { paddingHorizontal: 14, paddingVertical: 8 },
  backLinkText: { fontSize: 14, fontWeight: "600", color: colors.teal },
});
