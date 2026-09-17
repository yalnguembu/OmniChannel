import { Play, User } from "lucide-react-native";
import { Image } from "expo-image";
import * as WebBrowser from "expo-web-browser";
import { memo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { mediaHeaders, mediaUrl } from "@/api/client";
import { AudioBubble } from "@/components/shared/AudioBubble";
import { MessageTicks } from "@/components/shared/Badges";
import type { MessageViewModel } from "@/hooks/useChatViewModel";
import type { Media } from "@/models/whatsapp.models";
import { colors, radius } from "@/theme";
import { RichText } from "./RichText";

/**
 * Bulle de message — portage 1:1 de `MessageBubble` du web : mêmes rayons
 * (7,5px), mêmes paddings (9 / 6 / 8), même typographie (14,2px sur 19),
 * mêmes queues SVG et même placement de la méta.
 */

/** Largeur maximale d'un média dans une bulle. */
const MEDIA_WIDTH = 240;

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

// ─── Queues de bulle ──────────────────────────────────────────────────────────
// Géométrie de WhatsApp Web (viewBox 8×13), pour que l'encoche tombe pile sur
// l'angle carré de la bulle.

function TailInbound() {
  return (
    <Svg style={styles.tailIn} width={8} height={13} viewBox="0 0 8 13">
      <Path opacity={0.13} d="M2.812,1H8v11.193l-6.467-8.625C0.474,2.156,1.042,1,2.812,1z" />
      <Path fill={colors.bubbleIn} d="M2.812,0H8v11.193l-6.467-8.625C0.474,1.156,1.042,0,2.812,0z" />
    </Svg>
  );
}

function TailOutbound() {
  return (
    <Svg style={styles.tailOut} width={8} height={13} viewBox="0 0 8 13">
      <Path opacity={0.13} d="M5.188,1H0v11.193l6.467-8.625C7.526,2.156,6.958,1,5.188,1z" />
      <Path fill={colors.bubbleOut} d="M5.188,0H0v11.193l6.467-8.625C7.526,1.156,6.958,0,5.188,0z" />
    </Svg>
  );
}

// ─── Rendus média ─────────────────────────────────────────────────────────────

function BubbleImage({ uri, alt, onPress }: { uri: string; alt: string; onPress: () => void }) {
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
        <Play size={26} color={colors.white} />
      </View>
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
          {name || "Fichier"}
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
            <User size={20} color={colors.white} />
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
  bleed,
  onOpenImage,
  onOpenVideo,
  highlight,
}: {
  media: Media;
  /** Le média touche le bord de la bulle quand il est tout le message. */
  bleed: boolean;
  onOpenImage: (url: string, caption?: string) => void;
  onOpenVideo: (url: string) => void;
  /** Terme de recherche à surligner dans les légendes. */
  highlight?: string;
}) {
  const mt = (media.mediaType || "").toUpperCase();
  const mime = media.mimeType || "";
  const url = mediaUrl(media.internalStorageUrl);
  const bleedStyle = bleed ? styles.bleed : undefined;

  if (mt === "IMAGE" || mt === "PHOTO" || mime.startsWith("image/")) {
    return (
      <View style={bleedStyle}>
        <BubbleImage
          uri={url}
          alt={media.fileName || "Photo"}
          onPress={() => onOpenImage(url, media.caption ?? undefined)}
        />
        {media.caption ? (
          <RichText
            text={media.caption}
            highlight={highlight}
            style={[styles.text, styles.caption]}
          />
        ) : null}
      </View>
    );
  }

  if (mt === "VIDEO" || mime.startsWith("video/")) {
    return (
      <View style={bleedStyle}>
        <VideoThumb onPress={() => onOpenVideo(url)} />
        {media.caption ? (
          <RichText
            text={media.caption}
            highlight={highlight}
            style={[styles.text, styles.caption]}
          />
        ) : null}
      </View>
    );
  }

  if (mt === "AUDIO" || mt === "VOICE" || mime.startsWith("audio/")) {
    return <AudioBubble uri={url} />;
  }

  return <DocumentCard url={url} name={media.fileName || "Fichier"} />;
}

// ─── Contenu de la bulle ──────────────────────────────────────────────────────

/**
 * Place réservée à la méta sur la dernière ligne, en espaces figures (U+2007,
 * largeur fixe) : un `<View>` intercalé passerait à la ligne sans réserver de
 * hauteur et l'heure viendrait chevaucher le texte. C'est l'équivalent RN de
 * l'espaceur `inline-block` du web.
 */
function metaSpacer(isOutbound: boolean): string {
  // ~7px par espace figure à 14,2px : 62px sortant (heure + coches), 42 entrant.
  return " ".repeat(isOutbound ? 9 : 6);
}

interface BubbleBodyProps {
  vm: MessageViewModel;
  metaMode: MetaMode;
  /** Réserve la place de la méta sur la dernière ligne de texte. */
  spacer: string;
  onOpenImage: (url: string, caption?: string) => void;
  onOpenVideo: (url: string) => void;
  highlight?: string;
}

function BubbleBody({
  vm,
  metaMode,
  spacer,
  onOpenImage,
  onOpenVideo,
  highlight,
}: BubbleBodyProps) {
  const inlineSpacer = metaMode === "inline" ? spacer : "";

  if (vm.medias && vm.medias.length > 0) {
    const bleed = metaMode === "overlay";
    return (
      <View style={styles.stack}>
        {vm.medias.map((m, i) => (
          <MediaContent
            key={m.id ?? i}
            media={m}
            bleed={bleed}
            onOpenImage={onOpenImage}
            onOpenVideo={onOpenVideo}
            highlight={highlight}
          />
        ))}
        {vm.content ? (
          <RichText
            text={`${vm.content}${inlineSpacer}`}
            highlight={highlight}
            style={styles.text}
          />
        ) : metaMode === "inline" ? (
          <Text style={styles.text}>{inlineSpacer}</Text>
        ) : null}
      </View>
    );
  }

  switch (resolveMessageType(vm)) {
    case "IMAGE":
    case "PHOTO":
      return (
        <View style={styles.bleed}>
          <BubbleImage
            uri={mediaUrl(vm.content)}
            alt="Photo"
            onPress={() => onOpenImage(mediaUrl(vm.content))}
          />
        </View>
      );
    case "VIDEO":
      return (
        <View style={styles.bleed}>
          <VideoThumb onPress={() => onOpenVideo(mediaUrl(vm.content))} />
        </View>
      );
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
        <RichText
          text={`${vm.content || ""}${inlineSpacer}`}
          highlight={highlight}
          style={styles.text}
        />
      );
  }
}

// ─── Bulle ────────────────────────────────────────────────────────────────────

interface MessageBubbleProps {
  vm: MessageViewModel;
  /** Premier d'une série de messages du même auteur — porte la queue. */
  isFirstOfGroup?: boolean;
  /** Résultat de recherche mis en évidence (le web surligne au lieu de filtrer). */
  /** Terme cherché, surligné dans le texte du message. */
  highlightTerm?: string;
  /** Résultat actuellement visé par la navigation précédent / suivant. */
  isActiveMatch?: boolean;
  onLongPress: (vm: MessageViewModel) => void;
  onOpenImage: (url: string, caption?: string) => void;
  onOpenVideo: (url: string) => void;
}

export const MessageBubble = memo(function MessageBubble({
  vm,
  isFirstOfGroup = true,
  highlightTerm,
  isActiveMatch = false,
  onLongPress,
  onOpenImage,
  onOpenVideo,
}: MessageBubbleProps) {
  const metaMode = getMetaMode(vm);

  const meta = (
    <View style={styles.meta}>
      <Text style={[styles.metaTime, metaMode === "overlay" && styles.metaTimeOverlay]}>
        {vm.timeStr}
      </Text>
      {vm.isOutbound ? (
        <MessageTicks status={vm.status} light={metaMode === "overlay"} />
      ) : null}
    </View>
  );

  // Réserve exactement la place dont la méta a besoin sur la dernière ligne —
  // l'astuce de WhatsApp qui garde heure et coches collées en bas à droite.
  const spacer = metaSpacer(vm.isOutbound);

  return (
    <View
      style={[
        styles.row,
        vm.isOutbound ? styles.rowOut : styles.rowIn,
        // Espacement WhatsApp : 2px au sein d'une série, 12px entre deux séries.
        isFirstOfGroup ? styles.rowSpaced : styles.rowTight,
      ]}
    >
      {/* Enveloppe non rognée : la queue est une sœur de la bulle, sinon
          l'`overflow: hidden` de celle-ci la découperait. */}
      <View style={styles.wrapper}>
        {isFirstOfGroup ? (vm.isOutbound ? <TailOutbound /> : <TailInbound />) : null}

        <Pressable
          onLongPress={() => onLongPress(vm)}
          delayLongPress={220}
          style={[
            styles.bubble,
            vm.isOutbound ? styles.bubbleOut : styles.bubbleIn,
            isFirstOfGroup && (vm.isOutbound ? styles.cornerOut : styles.cornerIn),
            isActiveMatch && styles.bubbleActiveMatch,
          ]}
        >
          {vm.senderName && isFirstOfGroup ? (
            <Text style={styles.senderName}>{vm.senderName}</Text>
          ) : null}

          {/* Citation de réponse : auteur et contenu s'enchaînent comme un seul
              paragraphe, qui passe à la ligne au lieu de forcer une ligne unique. */}
          {vm.replyToContent ? (
            <View style={styles.quote}>
              <Text numberOfLines={3} style={styles.quoteText}>
                <Text style={styles.quoteAuthor}>{vm.replyToAuthor}</Text>{" "}
                <Text style={styles.quoteContent}>{vm.replyToContent}</Text>
              </Text>
            </View>
          ) : null}

          <BubbleBody
            vm={vm}
            metaMode={metaMode}
            spacer={spacer}
            onOpenImage={onOpenImage}
            onOpenVideo={onOpenVideo}
            highlight={highlightTerm}
          />

          {/* Méta : heure + coches — le placement dépend du type de contenu. */}
          {metaMode === "inline" ? <View style={styles.metaInline}>{meta}</View> : null}
          {metaMode === "overlay" ? <View style={styles.metaOverlay}>{meta}</View> : null}
          {metaMode === "block" ? <View style={styles.metaBlock}>{meta}</View> : null}
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  row: { flexDirection: "row" },
  rowIn: { justifyContent: "flex-start" },
  rowOut: { justifyContent: "flex-end" },
  rowSpaced: { marginTop: 12 },
  rowTight: { marginTop: 2 },
  wrapper: { position: "relative", maxWidth: "78%", minWidth: 0 },
  bubble: {
    borderRadius: 7.5,
    paddingHorizontal: 9,
    paddingTop: 6,
    paddingBottom: 8,
    overflow: "hidden",
    shadowColor: "#0b141a",
    shadowOpacity: 0.13,
    shadowRadius: 0.5,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  bubbleIn: { backgroundColor: colors.bubbleIn },
  bubbleOut: { backgroundColor: colors.bubbleOut },
  bubbleActiveMatch: { borderWidth: 2, borderColor: colors.teal },
  cornerIn: { borderTopLeftRadius: 0 },
  cornerOut: { borderTopRightRadius: 0 },
  tailIn: { position: "absolute", left: -8, top: 0, zIndex: 1 },
  tailOut: { position: "absolute", right: -8, top: 0, zIndex: 1 },
  senderName: { fontSize: 12.8, fontWeight: "500", color: colors.teal, marginBottom: 2 },
  quote: {
    borderLeftWidth: 4,
    borderLeftColor: colors.teal,
    backgroundColor: "rgba(0,0,0,0.06)",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 4,
    maxHeight: 64,
    overflow: "hidden",
  },
  quoteText: { fontSize: 12, lineHeight: 16 },
  quoteAuthor: { fontWeight: "500", color: colors.teal },
  quoteContent: { color: colors.muted },
  stack: { gap: 4 },
  text: { fontSize: 14.2, lineHeight: 19, color: colors.text },
  caption: { marginTop: 4, paddingHorizontal: 6 },
  meta: { flexDirection: "row", alignItems: "center", gap: 2 },
  metaTime: { fontSize: 11, color: colors.muted },
  metaTimeOverlay: { color: colors.white },
  metaInline: { position: "absolute", right: 9, bottom: 6 },
  metaOverlay: {
    position: "absolute",
    right: 8,
    bottom: 8,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  metaBlock: { alignSelf: "flex-end", marginTop: 2 },
  bleed: { marginHorizontal: -6, marginTop: -3 },
  media: { width: MEDIA_WIDTH, maxHeight: 330, borderRadius: 6, backgroundColor: "rgba(0,0,0,0.06)" },
  videoThumb: {
    width: MEDIA_WIDTH,
    height: 150,
    borderRadius: 6,
    backgroundColor: "#0b141a",
    alignItems: "center",
    justifyContent: "center",
  },
  playCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  docCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 176,
  },
  docBadge: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  docExt: { color: colors.white, fontSize: 13, fontWeight: "700" },
  docLabels: { flex: 1, minWidth: 0 },
  docName: { fontSize: 12, fontWeight: "500", color: colors.text },
  docHint: { fontSize: 11, color: colors.muted },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 192,
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.icon,
    alignItems: "center",
    justifyContent: "center",
  },
  contactName: { fontSize: 14, fontWeight: "500", color: colors.text },
});
