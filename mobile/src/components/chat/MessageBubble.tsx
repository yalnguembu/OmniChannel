import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as WebBrowser from "expo-web-browser";
import { memo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { mediaHeaders, mediaUrl } from "@/api/client";
import { AudioBubble } from "@/components/shared/AudioBubble";
import { MessageTicks } from "@/components/shared/Badges";
import type { MessageViewModel } from "@/hooks/useChatViewModel";
import type { Media } from "@/models/whatsapp.models";
import { colors, radius } from "@/theme";

/** Largeur maximale d'un média dans une bulle. */
const MEDIA_WIDTH = 244;

// ─── Résolution du type de message ────────────────────────────────────────────
// Le backend relaie un `messageType` libre ; pour un payload TEXT qui est en
// réalité une URL de média (ou une carte de visite sérialisée) on renifle le
// contenu. Partagé par le rendu et le placement de la méta, pour qu'ils soient
// toujours d'accord.

export function resolveMessageType(vm: MessageViewModel): string {
  let t = vm.messageType;
  if (vm.content && t === "TEXT") {
    const lower = vm.content.toLowerCase();
    if (/\.(jpeg|jpg|gif|png|webp|bmp)$/i.test(lower)) t = "IMAGE";
    else if (/\.(mp4|webm|mov|avi)$/i.test(lower)) t = "VIDEO";
    else if (/\.(mp3|wav|ogg|m4a|aac)$/i.test(lower)) t = "AUDIO";
    else if (/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv)$/i.test(lower)) t = "DOCUMENT";
    // Filet : carte de visite WhatsApp sérialisée en JSON (au cas où le
    // `messageType` du backend ne corresponde pas à nos variantes).
    else if (/^\s*\[?\s*\{\s*"name"\s*:/.test(vm.content)) t = "CONTACT";
  }
  return t;
}

function isVisualMedia(media: Media) {
  const mt = (media.mediaType || "").toUpperCase();
  const mime = media.mimeType || "";
  return (
    mt === "IMAGE" ||
    mt === "PHOTO" ||
    mt === "VIDEO" ||
    mime.startsWith("image/") ||
    mime.startsWith("video/")
  );
}

/**
 * Placement de l'heure et des coches, façon WhatsApp :
 *  - `overlay` — photo / vidéo sans légende : pilule flottante sur le média ;
 *  - `inline`  — texte (ou média légendé) : la méta suit la dernière ligne ;
 *  - `block`   — audio / document / contact : sa propre ligne alignée à droite.
 */
type MetaMode = "overlay" | "inline" | "block";

function getMetaMode(vm: MessageViewModel): MetaMode {
  const medias = vm.medias ?? [];
  if (medias.length > 0) {
    const captioned = !!vm.content || medias.some((m) => m.caption);
    if (captioned) return "inline";
    return medias.every(isVisualMedia) ? "overlay" : "block";
  }
  const t = resolveMessageType(vm);
  if (t === "IMAGE" || t === "PHOTO" || t === "VIDEO") return "overlay";
  if (
    t === "AUDIO" ||
    t === "VOICE" ||
    t === "DOCUMENT" ||
    t === "PDF" ||
    t === "FILE" ||
    t === "CONTACT" ||
    t === "CONTACTS"
  ) {
    return "block";
  }
  return "inline";
}

// ─── Rendus média ─────────────────────────────────────────────────────────────

function BubbleImage({
  uri,
  alt,
  onPress,
}: {
  uri: string;
  alt: string;
  onPress: () => void;
}) {
  // L'aspect réel n'est connu qu'au chargement : on part carré puis on ajuste,
  // ce qui évite les sauts de mise en page dans la liste.
  const [ratio, setRatio] = useState(1);
  return (
    <Pressable onPress={onPress}>
      <Image
        source={{ uri, headers: mediaHeaders() }}
        style={[styles.media, { aspectRatio: ratio }]}
        contentFit="cover"
        transition={120}
        accessibilityLabel={alt}
        onLoad={(e) => {
          const { width, height } = e.source ?? {};
          if (width && height) setRatio(Math.max(0.6, Math.min(width / height, 1.9)));
        }}
      />
    </Pressable>
  );
}

function VideoThumb({ onPress }: { onPress: () => void }) {
  // Une vidéo par bulle jouée en ligne rendrait la liste très lourde : on
  // affiche une vignette cliquable qui ouvre le lecteur plein écran.
  return (
    <Pressable onPress={onPress} style={styles.videoThumb}>
      <View style={styles.playCircle}>
        <Ionicons name="play" size={26} color={colors.white} />
      </View>
      <Text style={styles.videoLabel}>Vidéo</Text>
    </Pressable>
  );
}

function DocumentCard({ url, name }: { url: string; name: string }) {
  const ext = (name.split(".").pop() || "FILE").toUpperCase().slice(0, 5);
  return (
    <Pressable
      style={styles.docCard}
      onPress={() => {
        WebBrowser.openBrowserAsync(url).catch(() => {
          /* rien à faire : le navigateur système a refusé l'URL */
        });
      }}
    >
      <View style={styles.docBadge}>
        <Text style={styles.docExt}>{ext}</Text>
      </View>
      <View style={styles.docLabels}>
        <Text style={styles.docName} numberOfLines={1}>
          {name || "Document"}
        </Text>
        <Text style={styles.docHint}>Appuyer pour ouvrir</Text>
      </View>
    </Pressable>
  );
}

function ContactCards({ content }: { content: string | null }) {
  // WhatsApp (API Cloud de Meta) envoie un tableau de cartes, ex. :
  // [{"name":{"first_name":"Raissa","formatted_name":"Raissa"},
  //   "phones":[{"phone":"+237…","wa_id":"…","type":"MOBILE"}]}]
  let contacts: { name: string; phone: string }[] = [];
  try {
    const parsed = JSON.parse(content || "[]");
    const list = Array.isArray(parsed) ? parsed : [parsed];
    contacts = list.map((o: any) => ({
      name: o?.name?.formatted_name || o?.name?.first_name || o?.name || "Contact",
      phone: o?.phones?.[0]?.phone || o?.phone || o?.phoneNumber || "",
    }));
  } catch {
    contacts = [{ name: "Contact", phone: "" }];
  }

  return (
    <View style={styles.stack}>
      {contacts.map((c, i) => (
        <View key={i} style={styles.contactCard}>
          <View style={styles.contactAvatar}>
            <Ionicons name="person" size={18} color={colors.white} />
          </View>
          <View style={styles.docLabels}>
            <Text style={styles.contactName}>{c.name}</Text>
            {c.phone ? <Text style={styles.docHint}>{c.phone}</Text> : null}
          </View>
        </View>
      ))}
    </View>
  );
}

function MediaContent({
  media,
  onOpenImage,
  onOpenVideo,
}: {
  media: Media;
  onOpenImage: (url: string, caption?: string) => void;
  onOpenVideo: (url: string) => void;
}) {
  const mt = (media.mediaType || "").toUpperCase();
  const mime = media.mimeType || "";
  const url = mediaUrl(media.internalStorageUrl);

  if (mt === "IMAGE" || mt === "PHOTO" || mime.startsWith("image/")) {
    return (
      <View style={styles.stack}>
        <BubbleImage
          uri={url}
          alt={media.fileName || "Photo"}
          onPress={() => onOpenImage(url, media.caption ?? undefined)}
        />
        {media.caption ? <Text style={styles.text}>{media.caption}</Text> : null}
      </View>
    );
  }

  if (mt === "VIDEO" || mime.startsWith("video/")) {
    return (
      <View style={styles.stack}>
        <VideoThumb onPress={() => onOpenVideo(url)} />
        {media.caption ? <Text style={styles.text}>{media.caption}</Text> : null}
      </View>
    );
  }

  if (mt === "AUDIO" || mt === "VOICE" || mime.startsWith("audio/")) {
    return <AudioBubble uri={url} />;
  }

  return <DocumentCard url={url} name={media.fileName || "Document"} />;
}

// ─── Contenu de la bulle ──────────────────────────────────────────────────────

interface BubbleBodyProps {
  vm: MessageViewModel;
  metaMode: MetaMode;
  meta: React.ReactNode;
  onOpenImage: (url: string, caption?: string) => void;
  onOpenVideo: (url: string) => void;
}

function BubbleBody({ vm, metaMode, meta, onOpenImage, onOpenVideo }: BubbleBodyProps) {
  const inlineMeta = metaMode === "inline" ? meta : null;

  if (vm.medias && vm.medias.length > 0) {
    return (
      <View style={styles.stack}>
        {vm.medias.map((m, i) => (
          <MediaContent
            key={m.id ?? i}
            media={m}
            onOpenImage={onOpenImage}
            onOpenVideo={onOpenVideo}
          />
        ))}
        {vm.content ? (
          <View style={styles.inlineRow}>
            <Text style={styles.text}>{vm.content}</Text>
            {inlineMeta}
          </View>
        ) : (
          inlineMeta
        )}
      </View>
    );
  }

  switch (resolveMessageType(vm)) {
    case "IMAGE":
    case "PHOTO":
      return (
        <BubbleImage
          uri={mediaUrl(vm.content)}
          alt="Photo"
          onPress={() => onOpenImage(mediaUrl(vm.content))}
        />
      );
    case "VIDEO":
      return <VideoThumb onPress={() => onOpenVideo(mediaUrl(vm.content))} />;
    case "AUDIO":
    case "VOICE":
      return <AudioBubble uri={mediaUrl(vm.content)} />;
    case "DOCUMENT":
    case "PDF":
    case "FILE":
      return (
        <DocumentCard
          url={mediaUrl(vm.content)}
          name={vm.content?.split("/").pop() || "Document"}
        />
      );
    case "CONTACT":
    case "CONTACTS":
      return <ContactCards content={vm.content} />;
    default:
      return (
        <View style={styles.inlineRow}>
          <Text style={styles.text}>{vm.content || ""}</Text>
          {inlineMeta}
        </View>
      );
  }
}

// ─── Bulle ────────────────────────────────────────────────────────────────────

interface MessageBubbleProps {
  vm: MessageViewModel;
  /** Premier d'une série de messages du même auteur — porte l'angle coupé. */
  isFirstOfGroup?: boolean;
  onLongPress: (vm: MessageViewModel) => void;
  onOpenImage: (url: string, caption?: string) => void;
  onOpenVideo: (url: string) => void;
}

export const MessageBubble = memo(function MessageBubble({
  vm,
  isFirstOfGroup = true,
  onLongPress,
  onOpenImage,
  onOpenVideo,
}: MessageBubbleProps) {
  const metaMode = getMetaMode(vm);

  const meta = (
    <View style={[styles.meta, metaMode === "overlay" && styles.metaOverlay]}>
      <Text style={[styles.metaTime, metaMode === "overlay" && styles.metaTimeOverlay]}>
        {vm.timeStr}
      </Text>
      {vm.isOutbound ? (
        <MessageTicks status={vm.status} light={metaMode === "overlay"} />
      ) : null}
    </View>
  );

  return (
    <View
      style={[
        styles.row,
        vm.isOutbound ? styles.rowOut : styles.rowIn,
        // Espacement WhatsApp : 2px au sein d'une série, 12px entre deux séries.
        isFirstOfGroup ? styles.rowSpaced : styles.rowTight,
      ]}
    >
      <Pressable
        onLongPress={() => onLongPress(vm)}
        delayLongPress={220}
        style={[
          styles.bubble,
          vm.isOutbound ? styles.bubbleOut : styles.bubbleIn,
          isFirstOfGroup && (vm.isOutbound ? styles.cornerOut : styles.cornerIn),
        ]}
      >
        {vm.senderName && isFirstOfGroup ? (
          <Text style={styles.senderName}>{vm.senderName}</Text>
        ) : null}

        {vm.replyToContent ? (
          <View style={styles.quote}>
            <Text style={styles.quoteAuthor} numberOfLines={1}>
              {vm.replyToAuthor}
            </Text>
            <Text style={styles.quoteContent} numberOfLines={2}>
              {vm.replyToContent}
            </Text>
          </View>
        ) : null}

        <BubbleBody
          vm={vm}
          metaMode={metaMode}
          meta={meta}
          onOpenImage={onOpenImage}
          onOpenVideo={onOpenVideo}
        />

        {metaMode === "block" ? <View style={styles.metaBlock}>{meta}</View> : null}
        {metaMode === "overlay" ? <View style={styles.metaFloating}>{meta}</View> : null}
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  row: { flexDirection: "row", paddingHorizontal: 10 },
  rowIn: { justifyContent: "flex-start" },
  rowOut: { justifyContent: "flex-end" },
  rowSpaced: { marginTop: 12 },
  rowTight: { marginTop: 2 },
  bubble: {
    maxWidth: "86%",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingTop: 6,
    paddingBottom: 7,
    position: "relative",
    shadowColor: "#0b141a",
    shadowOpacity: 0.08,
    shadowRadius: 1,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  bubbleIn: { backgroundColor: colors.bubbleIn },
  bubbleOut: { backgroundColor: colors.bubbleOut },
  cornerIn: { borderTopLeftRadius: 0 },
  cornerOut: { borderTopRightRadius: 0 },
  senderName: { fontSize: 12.5, fontWeight: "600", color: colors.teal, marginBottom: 2 },
  quote: {
    borderLeftWidth: 3,
    borderLeftColor: colors.teal,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginBottom: 4,
  },
  quoteAuthor: { fontSize: 12, fontWeight: "600", color: colors.teal },
  quoteContent: { fontSize: 12, color: colors.muted },
  stack: { gap: 4 },
  inlineRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "flex-end" },
  text: { fontSize: 14.5, lineHeight: 19, color: colors.text },
  meta: { flexDirection: "row", alignItems: "center", gap: 3, marginLeft: 8, paddingBottom: 1 },
  metaOverlay: { marginLeft: 0 },
  metaTime: { fontSize: 11, color: colors.muted },
  metaTimeOverlay: { color: colors.white },
  metaBlock: { alignSelf: "flex-end" },
  metaFloating: {
    position: "absolute",
    right: 12,
    bottom: 12,
    backgroundColor: "rgba(0,0,0,0.38)",
    borderRadius: radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  media: {
    width: MEDIA_WIDTH,
    borderRadius: 6,
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  videoThumb: {
    width: MEDIA_WIDTH,
    height: 150,
    borderRadius: 6,
    backgroundColor: "#0b141a",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  playCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  videoLabel: { color: colors.white, fontSize: 12 },
  docCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: 180,
  },
  docBadge: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  docExt: { color: colors.white, fontSize: 11, fontWeight: "700" },
  docLabels: { flex: 1, minWidth: 0 },
  docName: { fontSize: 13, fontWeight: "500", color: colors.text },
  docHint: { fontSize: 11, color: colors.muted },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: 190,
  },
  contactAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.icon,
    alignItems: "center",
    justifyContent: "center",
  },
  contactName: { fontSize: 14, fontWeight: "500", color: colors.text },
});
