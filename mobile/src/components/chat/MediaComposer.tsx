import { Eye, FileText, Music, Plus, Send, Video, X } from "lucide-react-native";
import * as DocumentPicker from "expo-document-picker";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { LocalFile } from "@/api/endpoints";
import { AudioBubble } from "@/components/shared/AudioBubble";
import type { PendingMedia } from "@/hooks/useWhatsapp";
import { colors, radius } from "@/theme";

/**
 * Compositeur de média façon WhatsApp — portage de `MediaPreview` du web.
 *
 * Plusieurs pièces jointes peuvent être mises en file et **chacune garde sa
 * propre légende**, exactement comme l'app native, où une sélection de
 * plusieurs photos part en un message par photo. La bande de vignettes bascule
 * entre elles ; le champ de légende édite toujours celle qui est sélectionnée.
 */

interface QueueItem {
  id: string;
  file: LocalFile;
  caption: string;
}

let seq = 0;
const nextId = () => `m${++seq}`;

function kindOf(file: LocalFile) {
  const mime = file.mimeType || "";
  return {
    isImage: mime.startsWith("image/"),
    isVideo: mime.startsWith("video/"),
    isAudio: mime.startsWith("audio/"),
    // Le sélecteur rend parfois un type MIME vide : on retombe sur l'extension
    // avant de renoncer à l'aperçu.
    isPdf: mime === "application/pdf" || /\.pdf$/i.test(file.name),
  };
}

interface MediaComposerProps {
  /** Fichiers choisis dans le menu de pièces jointes — la file initiale. */
  files: LocalFile[];
  /** Envoie toute la file, chaque pièce avec sa légende. */
  onSend: (items: PendingMedia[]) => void;
  /** Abandonne la file et ferme le compositeur. */
  onCancel: () => void;
  isSending: boolean;
}

export function MediaComposer({ files, onSend, onCancel, isSending }: MediaComposerProps) {
  const insets = useSafeAreaInsets();

  const seed = (source: LocalFile[]) =>
    source.map((file) => ({ id: nextId(), file, caption: "" }));

  const [items, setItems] = useState<QueueItem[]>(() => seed(files));
  const [activeId, setActiveId] = useState<string | null>(null);

  // On ne réamorce que si le parent passe une **autre** sélection : la
  // première est déjà dans l'état, et la réamorcer jetterait les légendes.
  const seededRef = useRef(files);
  useEffect(() => {
    if (seededRef.current === files) return;
    seededRef.current = files;
    setItems(seed(files));
  }, [files]);

  const active = useMemo(
    () => items.find((i) => i.id === activeId) ?? items[0] ?? null,
    [items, activeId],
  );

  const setCaption = (caption: string) => {
    if (!active) return;
    setItems((list) => list.map((i) => (i.id === active.id ? { ...i, caption } : i)));
  };

  const removeItem = (id: string) => {
    setItems((list) => {
      const next = list.filter((i) => i.id !== id);
      if (next.length === 0) onCancel();
      return next;
    });
  };

  const addMore = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      quality: 0.85,
      allowsMultipleSelection: true,
    });
    if (!res.canceled && res.assets.length > 0) {
      setItems((list) => [
        ...list,
        ...res.assets.map((asset) => ({
          id: nextId(),
          file: {
            uri: asset.uri,
            name: asset.fileName || `piece-${nextId()}.jpg`,
            mimeType: asset.mimeType || (asset.type === "video" ? "video/mp4" : "image/jpeg"),
          },
          caption: "",
        })),
      ]);
      return;
    }
    // Rien de choisi côté galerie : on propose aussi les documents, comme le
    // bouton « + » du web qui accepte tous les types.
    const docs = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: true,
    });
    if (docs.canceled || docs.assets.length === 0) return;
    setItems((list) => [
      ...list,
      ...docs.assets.map((asset) => ({
        id: nextId(),
        file: {
          uri: asset.uri,
          name: asset.name || "fichier",
          mimeType: asset.mimeType || "application/octet-stream",
        },
        caption: "",
      })),
    ]);
  };

  if (!active) return null;

  const kind = kindOf(active.file);
  const captioned = items.filter((i) => i.caption.trim()).length;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
      <View style={styles.backdrop}>
        {/* Barre de titre : annuler, nom du fichier actif. */}
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <Pressable
            onPress={onCancel}
            disabled={isSending}
            hitSlop={8}
            accessibilityLabel="Annuler"
            style={styles.topButton}
          >
            <X size={24} color="rgba(255,255,255,0.9)" />
          </Pressable>
          <Text style={styles.fileName} numberOfLines={1}>
            {active.file.name}
          </Text>
        </View>

        {/* Scène : aperçu de la pièce sélectionnée. */}
        <View style={styles.stage}>
          {kind.isImage ? (
            <Image source={{ uri: active.file.uri }} style={styles.stageImage} contentFit="contain" />
          ) : kind.isVideo ? (
            <View style={styles.stageCard}>
              <Video size={64} color="rgba(255,255,255,0.85)" />
              <Text style={styles.stageName}>{active.file.name}</Text>
              <Text style={styles.stageHint}>La vidéo part en pièce jointe.</Text>
            </View>
          ) : kind.isAudio ? (
            <View style={styles.stageCard}>
              <View style={styles.audioCircle}>
                <Music size={32} color={colors.green} />
              </View>
              <View style={styles.audioPlayer}>
                <AudioBubble uri={active.file.uri} />
              </View>
            </View>
          ) : (
            <View style={styles.stageCard}>
              <View style={styles.fileBox}>
                <FileText size={44} color="rgba(255,255,255,0.8)" />
                {kind.isPdf ? <Text style={styles.pdfBadge}>PDF</Text> : null}
              </View>
              <Text style={styles.stageName}>{active.file.name}</Text>
              {/* Un PDF ne se rend pas dans React Native : on propose de
                  l'ouvrir dans la visionneuse du système pour le vérifier
                  avant envoi (le web l'affiche dans une iframe). */}
              <Pressable
                style={styles.openButton}
                onPress={() => {
                  WebBrowser.openBrowserAsync(active.file.uri).catch(() => {
                    /* aucune visionneuse disponible */
                  });
                }}
              >
                <Eye size={15} color={colors.white} />
                <Text style={styles.openLabel}>Ouvrir pour vérifier</Text>
              </Pressable>
            </View>
          )}
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
          {/* Légende de la pièce active + envoi de toute la file. */}
          <View style={styles.captionBar}>
            <View style={styles.captionField}>
              <TextInput
                value={active.caption}
                onChangeText={setCaption}
                placeholder={
                  items.length > 1 ? "Légende de ce fichier…" : "Ajouter une légende…"
                }
                placeholderTextColor={colors.muted}
                style={styles.captionInput}
                multiline
                maxLength={1024}
              />
            </View>
            <Pressable
              onPress={() =>
                onSend(
                  items.map((i) => ({
                    file: i.file,
                    caption: i.caption.trim() || undefined,
                  })),
                )
              }
              disabled={isSending}
              accessibilityLabel={
                items.length > 1 ? `Envoyer ${items.length} fichiers` : "Envoyer le fichier"
              }
              style={styles.sendButton}
            >
              {isSending ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Send size={22} color={colors.white} />
              )}
              {items.length > 1 && !isSending ? (
                <View style={styles.sendBadge}>
                  <Text style={styles.sendBadgeText}>{items.length}</Text>
                </View>
              ) : null}
            </Pressable>
          </View>

          {items.length > 1 ? (
            <Text style={styles.queueHint}>
              {items.length} fichiers — un message par fichier
              {captioned > 0 ? `, ${captioned} avec légende` : ""}
            </Text>
          ) : null}

          {/* Bande de vignettes : bascule, retire, ajoute. */}
          <View style={[styles.strip, { paddingBottom: insets.bottom + 10 }]}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              // Sans ça, avec le clavier ouvert — le cas normal quand on saisit
              // une légende — le premier appui sur une vignette est avalé pour
              // refermer le clavier et ne change pas de pièce.
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.stripContent}
            >
              {items.map((item) => {
                const k = kindOf(item.file);
                const isActive = item.id === active.id;
                return (
                  <View key={item.id} style={styles.thumbWrap}>
                    <Pressable
                      onPress={() => setActiveId(item.id)}
                      accessibilityLabel={`Sélectionner ${item.file.name}`}
                      style={[styles.thumb, isActive && styles.thumbActive]}
                    >
                      {k.isImage ? (
                        <Image source={{ uri: item.file.uri }} style={styles.thumbImage} contentFit="cover" />
                      ) : (
                        <View style={styles.thumbIcon}>
                          {k.isVideo ? (
                            <Video size={20} color="rgba(255,255,255,0.7)" />
                          ) : k.isAudio ? (
                            <Music size={20} color="rgba(255,255,255,0.7)" />
                          ) : (
                            <FileText size={20} color="rgba(255,255,255,0.7)" />
                          )}
                          {k.isPdf ? <Text style={styles.thumbPdf}>PDF</Text> : null}
                        </View>
                      )}
                      {isActive ? <View style={styles.thumbUnderline} /> : null}
                    </Pressable>
                    <Pressable
                      onPress={() => removeItem(item.id)}
                      disabled={isSending}
                      hitSlop={6}
                      accessibilityLabel={`Retirer ${item.file.name}`}
                      style={styles.thumbRemove}
                    >
                      <X size={12} color="rgba(255,255,255,0.9)" />
                    </Pressable>
                  </View>
                );
              })}

              <Pressable
                onPress={addMore}
                disabled={isSending}
                accessibilityLabel="Ajouter des fichiers"
                style={styles.addButton}
              >
                <Plus size={24} color="rgba(255,255,255,0.6)" />
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Opaque : le web pose un voile `#0b141a/95` sur son panneau de conversation,
  // mais au-dessus d'une vraie discussion la transparence rendait le fond
  // lisible et l'aperçu illisible.
  backdrop: { flex: 1, backgroundColor: "#0b141a" },
  topBar: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 12 },
  topButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  fileName: { flex: 1, fontSize: 14, color: "rgba(255,255,255,0.9)" },
  stage: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  stageImage: { width: "100%", height: "100%" },
  stageCard: { alignItems: "center", gap: 14 },
  stageName: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
  },
  stageHint: { fontSize: 12, color: "rgba(255,255,255,0.5)" },
  audioCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(37,211,102,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  audioPlayer: { width: 260, backgroundColor: colors.white, borderRadius: radius.md, paddingHorizontal: 10 },
  fileBox: {
    width: 96,
    height: 96,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  pdfBadge: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    color: "rgba(255,255,255,0.8)",
  },
  openButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  openLabel: { fontSize: 12.5, color: colors.white },
  captionBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 4,
  },
  captionField: {
    flex: 1,
    minWidth: 0,
    borderRadius: 16,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  captionInput: { fontSize: 14, lineHeight: 19, color: colors.text, padding: 0, maxHeight: 112 },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.greenSend,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  sendBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 4,
    borderRadius: 10,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBadgeText: { fontSize: 11, fontWeight: "600", color: colors.greenSend },
  queueHint: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 11,
    color: "rgba(255,255,255,0.45)",
  },
  strip: {
    marginTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.1)",
    paddingTop: 10,
  },
  stripContent: { alignItems: "center", gap: 8, paddingHorizontal: 12 },
  thumbWrap: { position: "relative" },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  thumbActive: { borderColor: colors.greenSend },
  thumbImage: { width: "100%", height: "100%" },
  thumbIcon: { flex: 1, alignItems: "center", justifyContent: "center", gap: 1 },
  thumbPdf: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.6,
    color: "rgba(255,255,255,0.8)",
  },
  thumbUnderline: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
    backgroundColor: colors.greenSend,
  },
  thumbRemove: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.75)",
    alignItems: "center",
    justifyContent: "center",
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
});
