import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { LocalFile } from "@/api/endpoints";
import { colors, radius } from "@/theme";

interface MediaComposerProps {
  file: LocalFile | null;
  isSending: boolean;
  onSend: (caption: string) => void;
  onCancel: () => void;
}

/**
 * Compositeur de média — aperçu + légende avant envoi, comme WhatsApp
 * (équivalent de `MediaPreview` du web).
 */
export function MediaComposer({ file, isSending, onSend, onCancel }: MediaComposerProps) {
  const [caption, setCaption] = useState("");
  const insets = useSafeAreaInsets();

  if (!file) return null;

  const isImage = file.mimeType.startsWith("image/");
  const isVideo = file.mimeType.startsWith("video/");

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <Pressable onPress={onCancel} hitSlop={10}>
            <Ionicons name="close" size={26} color={colors.white} />
          </Pressable>
          <Text style={styles.fileName} numberOfLines={1}>
            {file.name}
          </Text>
        </View>

        <View style={styles.preview}>
          {isImage ? (
            <Image source={{ uri: file.uri }} style={styles.image} contentFit="contain" />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons
                name={isVideo ? "videocam" : "document-text"}
                size={64}
                color={colors.white}
              />
              <Text style={styles.placeholderText}>{file.name}</Text>
              <Text style={styles.placeholderHint}>
                {isVideo
                  ? "La vidéo sera envoyée en pièce jointe."
                  : "Le fichier sera envoyé en document."}
              </Text>
            </View>
          )}
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 10 }]}>
            <TextInput
              value={caption}
              onChangeText={setCaption}
              placeholder="Ajouter une légende"
              placeholderTextColor="rgba(255,255,255,0.6)"
              style={styles.captionInput}
              multiline
              maxLength={1024}
            />
            <Pressable
              style={styles.sendButton}
              onPress={() => onSend(caption.trim())}
              disabled={isSending}
              accessibilityLabel="Envoyer le fichier"
            >
              {isSending ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Ionicons name="send" size={19} color={colors.white} />
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "#0b141a" },
  topBar: { flexDirection: "row", alignItems: "center", gap: 16, paddingHorizontal: 16, paddingBottom: 8 },
  fileName: { flex: 1, color: colors.white, fontSize: 14 },
  preview: { flex: 1, alignItems: "center", justifyContent: "center" },
  image: { width: "100%", height: "100%" },
  placeholder: { alignItems: "center", gap: 10, paddingHorizontal: 32 },
  placeholderText: { color: colors.white, fontSize: 15, textAlign: "center" },
  placeholderHint: { color: "rgba(255,255,255,0.6)", fontSize: 12.5, textAlign: "center" },
  bottomBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 12,
    paddingTop: 10,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  captionInput: {
    flex: 1,
    maxHeight: 110,
    minHeight: 42,
    borderRadius: radius.lg,
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.white,
    fontSize: 15,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.greenSend,
    alignItems: "center",
    justifyContent: "center",
  },
});
