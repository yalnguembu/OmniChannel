import {
  Camera,
  Clock,
  FileText,
  Image as ImageIcon,
  Mic,
  Plus,
  Send,
  Smile,
  X,
  Zap,
} from "lucide-react-native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { LocalFile } from "@/api/endpoints";
import { Sheet, SheetOption } from "@/components/shared/Sheet";
import { EmojiPicker } from "./EmojiPicker";
import { LinkPreview } from "./LinkPreview";
import { QuickReplyMenu } from "./QuickReplyMenu";
import { matchQuickReplies, readSlashToken, type QuickReply } from "@/lib/quickReplies";
import { extractFirstUrl } from "@/lib/richText";
import { toast } from "@/lib/toast";
import { useQuickReplyStore } from "@/store/quickReplyStore";
import type { ReplyTo } from "@/store/whatsappStore";
import { colors, radius } from "@/theme";

/**
 * Composeur — portage de `MessageInput` du web : barre de réponse, bandeau de
 * fenêtre 24h, puis la carte blanche flottante `rounded-2xl mx-4 mb-2` avec ses
 * boutons ronds de 40.
 */

interface MessageInputProps {
  replyTo: ReplyTo | null;
  onCancelReply: () => void;
  onSend: (text: string) => Promise<void>;
  /** Des fichiers ont été choisis — le parent ouvre le compositeur de média.
      Plusieurs à la fois est supporté : chacun devient son propre message. */
  onPickMedia: (files: LocalFile[]) => void;
  onOpenTemplate: () => void;
  /** Ouvre l'écran de gestion des réponses rapides. */
  onManageQuickReplies: () => void;
  /** Vrai quand la fenêtre WhatsApp de 24h est fermée : seuls les templates passent. */
  disabled?: boolean;
  isSending: boolean;
}

/** Devine un nom de fichier lisible quand le sélecteur n'en fournit pas. */
function fileNameFrom(uri: string, fallbackExt: string): string {
  const last = uri.split("/").pop() || "";
  if (last.includes(".")) return last;
  return `${last || "fichier"}.${fallbackExt}`;
}

export function MessageInput({
  replyTo,
  onCancelReply,
  onSend,
  onPickMedia,
  onOpenTemplate,
  onManageQuickReplies,
  disabled = false,
  isSending,
}: MessageInputProps) {
  const [text, setText] = useState("");
  const [attachOpen, setAttachOpen] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  /** Position du curseur — sert à repérer le `/raccourci` en cours de saisie. */
  const [caret, setCaret] = useState(0);
  const [menuDismissed, setMenuDismissed] = useState(false);
  /** URL dont l'aperçu a été masqué — on ne le réaffiche pas pour la même. */
  const [dismissedUrl, setDismissedUrl] = useState<string | null>(null);

  const quickReplies = useQuickReplyStore((s) => s.replies);
  const hydrateQuickReplies = useQuickReplyStore((s) => s.hydrate);
  useEffect(() => {
    hydrateQuickReplies();
  }, [hydrateQuickReplies]);

  const hasText = text.trim().length > 0;

  // Aperçu du lien : première URL du message, comme WhatsApp qui prévisualise
  // ce qu'on est en train d'envoyer.
  const previewUrl = useMemo(() => {
    const url = extractFirstUrl(text);
    return url && url !== dismissedUrl ? url : null;
  }, [text, dismissedUrl]);

  // Palette `/raccourci` : le jeton est recalculé à chaque frappe et à chaque
  // déplacement du curseur, comme le `syncSlashToken` du web.
  const slashToken = useMemo(() => readSlashToken(text, caret), [text, caret]);
  const menuOpen = !!slashToken && !disabled && !menuDismissed;
  const matchedReplies = useMemo(
    () => (slashToken ? matchQuickReplies(quickReplies, slashToken.query) : []),
    [slashToken, quickReplies],
  );

  const insertQuickReply = (reply: QuickReply) => {
    if (!slashToken) return;
    const next = text.slice(0, slashToken.start) + reply.content + text.slice(slashToken.end);
    setText(next);
    // Le curseur va en fin de champ : sur un champ contrôlé, c'est là que RN le
    // place, et le jeton se trouve de toute façon en fin de saisie.
    setCaret(next.length);
    setMenuDismissed(true);
  };

  /** Insertion au curseur, comme le `onEmojiClick` du web. */
  const insertEmoji = (emoji: string) => {
    const at = Math.min(caret, text.length);
    const next = text.slice(0, at) + emoji + text.slice(at);
    setText(next);
    setCaret(at + emoji.length);
  };

  const submit = async () => {
    const value = text.trim();
    if (!value || isSending) return;
    // On vide tout de suite : l'envoi peut prendre une seconde sur mobile et
    // laisser le texte dans le champ invite un double envoi.
    setText("");
    setCaret(0);
    setDismissedUrl(null);
    setEmojiOpen(false);
    try {
      await onSend(value);
    } catch {
      // La mutation a déjà affiché un toast ; on rend le texte pour permettre
      // une nouvelle tentative sans le retaper.
      setText(value);
    }
  };

  const pickFromLibrary = async () => {
    setAttachOpen(false);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      toast.error("Accès à la galerie refusé");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      quality: 0.85,
      allowsMultipleSelection: true,
    });
    if (res.canceled || res.assets.length === 0) return;
    onPickMedia(
      res.assets.map((asset) => {
        const isVideo = asset.type === "video";
        return {
          uri: asset.uri,
          name: asset.fileName || fileNameFrom(asset.uri, isVideo ? "mp4" : "jpg"),
          mimeType: asset.mimeType || (isVideo ? "video/mp4" : "image/jpeg"),
        };
      }),
    );
  };

  const takePhoto = async () => {
    setAttachOpen(false);
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      toast.error("Accès à l'appareil photo refusé");
      return;
    }
    const res = await ImagePicker.launchCameraAsync({ quality: 0.85 });
    const asset = res.canceled ? null : res.assets[0];
    if (!asset) return;
    onPickMedia([
      {
        uri: asset.uri,
        name: asset.fileName || fileNameFrom(asset.uri, "jpg"),
        mimeType: asset.mimeType || "image/jpeg",
      },
    ]);
  };

  const pickDocument = async () => {
    setAttachOpen(false);
    const res = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: true,
    });
    if (res.canceled || res.assets.length === 0) return;
    onPickMedia(
      res.assets.map((asset) => ({
        uri: asset.uri,
        name: asset.name || fileNameFrom(asset.uri, "bin"),
        mimeType: asset.mimeType || "application/octet-stream",
      })),
    );
  };

  return (
    <View>
      {menuOpen ? (
        <QuickReplyMenu
          query={slashToken?.query ?? ""}
          replies={matchedReplies}
          onSelect={insertQuickReply}
          onManage={() => {
            setMenuDismissed(true);
            onManageQuickReplies();
          }}
        />
      ) : null}

      {previewUrl && !disabled ? (
        <LinkPreview url={previewUrl} onDismiss={() => setDismissedUrl(previewUrl)} />
      ) : null}

      {replyTo ? (
        <View style={styles.replyBar}>
          <View style={styles.replyBody}>
            <Text numberOfLines={2} style={styles.replyText}>
              <Text style={styles.replyAuthor}>{replyTo.author}</Text>{" "}
              <Text style={styles.replyContent}>{replyTo.content}</Text>
            </Text>
          </View>
          <Pressable onPress={onCancelReply} hitSlop={10} accessibilityLabel="Annuler la réponse">
            <X size={20} color={colors.icon} />
          </Pressable>
        </View>
      ) : null}

      {/* Fenêtre de 24h fermée : WhatsApp n'autorise plus que les templates. */}
      {disabled ? (
        <View style={styles.notice}>
          <Clock size={15} color={colors.icon} />
          <Text style={styles.noticeText}>
            Fenêtre de 24h expirée — seul un template peut être envoyé.
          </Text>
          <Pressable style={styles.noticeButton} onPress={onOpenTemplate}>
            <FileText size={13} color={colors.white} />
            <Text style={styles.noticeButtonText}>Template</Text>
          </Pressable>
        </View>
      ) : null}

      {emojiOpen ? <EmojiPicker onSelect={insertEmoji} /> : null}

      <View style={styles.bar}>
        <Pressable
          onPress={() => {
            setEmojiOpen(false);
            setAttachOpen(true);
          }}
          disabled={disabled}
          accessibilityLabel="Joindre un fichier"
          style={({ pressed }) => [
            styles.roundButton,
            pressed && styles.roundButtonPressed,
            disabled && styles.roundButtonDisabled,
          ]}
        >
          <Plus size={24} color={colors.icon} />
        </Pressable>

        <Pressable
          onPress={() => setEmojiOpen((v) => !v)}
          disabled={disabled}
          accessibilityLabel="Émojis"
          style={({ pressed }) => [
            styles.roundButton,
            pressed && styles.roundButtonPressed,
            disabled && styles.roundButtonDisabled,
          ]}
        >
          <Smile size={24} color={emojiOpen ? colors.teal : colors.icon} />
        </Pressable>

        <View style={styles.inputWrap}>
          <TextInput
            testID="composer-input"
            accessibilityLabel="Message"
            value={text}
            onChangeText={(v) => {
              setText(v);
              // Réouvre la palette dès qu'un nouveau jeton est tapé.
              setMenuDismissed(false);
            }}
            onSelectionChange={(e) => setCaret(e.nativeEvent.selection.start)}
            editable={!disabled}
            placeholder={
              disabled ? "Fenêtre de 24h expirée — envoyez un template" : "Tapez un message"
            }
            placeholderTextColor={colors.muted}
            style={styles.input}
            multiline
            maxLength={4096}
          />
        </View>

        {/* Dictée : le module natif de reconnaissance vocale n'est pas dans
            Expo Go, le bouton reste donc désactivé jusqu'au build de dev —
            même rendu que le web quand `speech.available` est faux. */}
        <Pressable
          disabled
          accessibilityLabel="Dicter le message"
          style={[styles.roundButton, styles.roundButtonDisabled]}
        >
          <Mic size={20} color={colors.icon} />
        </Pressable>

        {hasText ? (
          <Pressable
            testID="composer-send"
            onPress={submit}
            disabled={isSending}
            accessibilityLabel="Envoyer"
            style={styles.sendButton}
          >
            {isSending ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Send size={18} color={colors.white} />
            )}
          </Pressable>
        ) : null}
      </View>

      <Sheet open={attachOpen} onClose={() => setAttachOpen(false)} title="Joindre">
        <SheetOption icon={ImageIcon} label="Photos et vidéos" onPress={pickFromLibrary} />
        <SheetOption icon={Camera} label="Appareil photo" onPress={takePhoto} />
        <SheetOption icon={FileText} label="Document" onPress={pickDocument} />
        <SheetOption
          icon={Zap}
          label="Réponses rapides"
          hint="Insérables en tapant /raccourci"
          onPress={() => {
            setAttachOpen(false);
            onManageQuickReplies();
          }}
        />
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: colors.white,
    shadowColor: "#0b141a",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  roundButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  roundButtonPressed: { backgroundColor: "rgba(0,0,0,0.05)" },
  roundButtonDisabled: { opacity: 0.4 },
  inputWrap: { flex: 1, minWidth: 0, paddingHorizontal: 4, paddingVertical: 8 },
  input: {
    fontSize: 15,
    lineHeight: 21,
    color: colors.text,
    padding: 0,
    maxHeight: 112,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.greenSend,
    alignItems: "center",
    justifyContent: "center",
  },
  replyBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.bubbleIn,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  replyBody: {
    flex: 1,
    minWidth: 0,
    borderLeftWidth: 4,
    borderLeftColor: colors.teal,
    paddingLeft: 12,
  },
  replyText: { fontSize: 12, lineHeight: 16 },
  replyAuthor: { fontWeight: "700", color: colors.teal },
  replyContent: { color: colors.muted },
  notice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bubbleIn,
  },
  noticeText: { flex: 1, fontSize: 12, lineHeight: 16, color: colors.muted },
  noticeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.teal,
  },
  noticeButtonText: { color: colors.white, fontSize: 12, fontWeight: "500" },
});
