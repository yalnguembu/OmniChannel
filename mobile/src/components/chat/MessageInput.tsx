import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { LocalFile } from "@/api/endpoints";
import { Sheet, SheetOption } from "@/components/shared/Sheet";
import { toast } from "@/lib/toast";
import type { ReplyTo } from "@/store/whatsappStore";
import { colors, radius } from "@/theme";

interface MessageInputProps {
  replyTo: ReplyTo | null;
  onCancelReply: () => void;
  onSend: (text: string) => Promise<void>;
  /** Un fichier a été choisi — le parent ouvre le compositeur de média. */
  onPickMedia: (file: LocalFile) => void;
  onOpenTemplate: () => void;
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
  disabled = false,
  isSending,
}: MessageInputProps) {
  const [text, setText] = useState("");
  const [attachOpen, setAttachOpen] = useState(false);

  const hasText = text.trim().length > 0;

  const submit = async () => {
    const value = text.trim();
    if (!value || isSending) return;
    // On vide tout de suite : l'envoi peut prendre une seconde sur mobile et
    // laisser le texte dans le champ invite un double envoi.
    setText("");
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
    });
    const asset = res.canceled ? null : res.assets[0];
    if (!asset) return;
    const isVideo = asset.type === "video";
    onPickMedia({
      uri: asset.uri,
      name: asset.fileName || fileNameFrom(asset.uri, isVideo ? "mp4" : "jpg"),
      mimeType: asset.mimeType || (isVideo ? "video/mp4" : "image/jpeg"),
    });
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
    onPickMedia({
      uri: asset.uri,
      name: asset.fileName || fileNameFrom(asset.uri, "jpg"),
      mimeType: asset.mimeType || "image/jpeg",
    });
  };

  const pickDocument = async () => {
    setAttachOpen(false);
    const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
    const asset = res.canceled ? null : res.assets[0];
    if (!asset) return;
    onPickMedia({
      uri: asset.uri,
      name: asset.name || fileNameFrom(asset.uri, "bin"),
      mimeType: asset.mimeType || "application/octet-stream",
    });
  };

  // Fenêtre de 24h fermée : WhatsApp n'autorise plus que les templates.
  if (disabled) {
    return (
      <View style={styles.closedBar}>
        <Ionicons name="time-outline" size={18} color={colors.muted} />
        <Text style={styles.closedText}>
          Fenêtre de 24h fermée — seul un template peut être envoyé.
        </Text>
        <Pressable style={styles.closedButton} onPress={onOpenTemplate}>
          <Text style={styles.closedButtonText}>Template</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View>
      {replyTo ? (
        <View style={styles.replyBar}>
          <View style={styles.replyBody}>
            <Text style={styles.replyAuthor} numberOfLines={1}>
              {replyTo.author}
            </Text>
            <Text style={styles.replyContent} numberOfLines={1}>
              {replyTo.content}
            </Text>
          </View>
          <Pressable onPress={onCancelReply} hitSlop={10}>
            <Ionicons name="close" size={20} color={colors.icon} />
          </Pressable>
        </View>
      ) : null}

      <View style={styles.bar}>
        <Pressable onPress={() => setAttachOpen(true)} hitSlop={8} style={styles.iconButton}>
          <Ionicons name="add" size={26} color={colors.icon} />
        </Pressable>

        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Message"
          placeholderTextColor={colors.muted}
          style={styles.input}
          multiline
          maxLength={4096}
        />

        <Pressable
          onPress={hasText ? submit : onOpenTemplate}
          disabled={isSending}
          style={[styles.sendButton, !hasText && styles.sendButtonAlt]}
          accessibilityLabel={hasText ? "Envoyer" : "Envoyer un template"}
        >
          {isSending ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Ionicons
              name={hasText ? "send" : "document-text-outline"}
              size={hasText ? 19 : 21}
              color={colors.white}
            />
          )}
        </Pressable>
      </View>

      <Sheet open={attachOpen} onClose={() => setAttachOpen(false)} title="Joindre">
        <SheetOption icon="image-outline" label="Photos et vidéos" onPress={pickFromLibrary} />
        <SheetOption icon="camera-outline" label="Appareil photo" onPress={takePhoto} />
        <SheetOption icon="document-outline" label="Document" onPress={pickDocument} />
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 7,
    backgroundColor: colors.header,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  iconButton: { padding: 6 },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderRadius: 20,
    backgroundColor: colors.inputBg,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15.5,
    color: colors.text,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.greenSend,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonAlt: { backgroundColor: colors.teal },
  replyBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.header,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  replyBody: {
    flex: 1,
    borderLeftWidth: 3,
    borderLeftColor: colors.teal,
    paddingLeft: 8,
  },
  replyAuthor: { fontSize: 12.5, fontWeight: "600", color: colors.teal },
  replyContent: { fontSize: 12.5, color: colors.muted },
  closedBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: colors.header,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  closedText: { flex: 1, fontSize: 12.5, color: colors.muted, lineHeight: 17 },
  closedButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.teal,
  },
  closedButtonText: { color: colors.white, fontSize: 13, fontWeight: "600" },
});
