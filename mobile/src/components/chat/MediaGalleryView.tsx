import { Download, FileText, Music, Play } from "lucide-react-native";
import { Image } from "expo-image";
import * as WebBrowser from "expo-web-browser";
import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { mediaHeaders, mediaUrl } from "@/api/client";
import type { GalleryItem } from "@/hooks/useChatViewModel";
import { fmtTimeFull, toUtcDate } from "@/models/whatsapp.models";
import { colors, radius } from "@/theme";

/**
 * Liste « Médias, liens et documents » de WhatsApp, rendue comme sous-vue du
 * panneau d'infos plutôt que comme sa propre boîte de dialogue — la même
 * navigation que l'app native. Portage de `MediaGalleryView` du web.
 *
 * Elle ne connaît que les messages déjà chargés : la fin de liste propose donc
 * d'en tirer davantage au lieu de se prétendre exhaustive.
 */

type Tab = "media" | "docs";

function monthLabel(ts: string | null): string {
  if (!ts) return "Sans date";
  const d = toUtcDate(ts);
  const s = d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const DOC_TINT: Record<GalleryItem["kind"], string> = {
  document: colors.danger,
  audio: colors.teal,
  image: colors.teal,
  video: colors.teal,
};

interface MediaGalleryViewProps {
  items: GalleryItem[];
  /** De l'historique plus ancien porte des médias encore non chargés. */
  hasOlder: boolean;
  isLoadingOlder: boolean;
  onLoadOlder: () => void;
  /** Ouvre une photo / vidéo dans la visionneuse plein écran. */
  onOpen: (type: "image" | "video", url: string, caption?: string) => void;
}

export function MediaGalleryView({
  items,
  hasOlder,
  isLoadingOlder,
  onLoadOlder,
  onOpen,
}: MediaGalleryViewProps) {
  const [tab, setTab] = useState<Tab>("media");

  const visual = useMemo(
    () => items.filter((i) => i.kind === "image" || i.kind === "video"),
    [items],
  );
  const docs = useMemo(
    () => items.filter((i) => i.kind === "document" || i.kind === "audio"),
    [items],
  );

  // Regroupement par mois, en conservant l'ordre du plus récent au plus ancien
  // produit par le ViewModel.
  const groups = useMemo(() => {
    const source = tab === "media" ? visual : docs;
    const out: { label: string; entries: GalleryItem[] }[] = [];
    for (const item of source) {
      const label = monthLabel(item.timestamp);
      const last = out[out.length - 1];
      if (last && last.label === label) last.entries.push(item);
      else out.push({ label, entries: [item] });
    }
    return out;
  }, [tab, visual, docs]);

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        {(
          [
            ["media", `Médias${visual.length ? ` (${visual.length})` : ""}`],
            ["docs", `Documents${docs.length ? ` (${docs.length})` : ""}`],
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <Pressable
            key={key}
            onPress={() => setTab(key)}
            style={[styles.tab, tab === key && styles.tabActive]}
          >
            <Text style={[styles.tabLabel, tab === key && styles.tabLabelActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      {groups.length === 0 ? (
        <Text style={styles.empty}>
          Aucun média dans les messages chargés.
        </Text>
      ) : (
        <View style={styles.body}>
          {groups.map((group) => (
            <View key={group.label} style={styles.group}>
              <Text style={styles.groupLabel}>{group.label}</Text>

              {tab === "media" ? (
                <View style={styles.grid}>
                  {group.entries.map((item) => {
                    const url = mediaUrl(item.url);
                    return (
                      <Pressable
                        key={item.key}
                        style={styles.cell}
                        onPress={() =>
                          onOpen(
                            item.kind === "video" ? "video" : "image",
                            url,
                            item.caption ?? undefined,
                          )
                        }
                      >
                        {item.kind === "video" ? (
                          <View style={styles.videoCell}>
                            <Play size={22} color={colors.white} />
                          </View>
                        ) : (
                          <Image
                            source={{ uri: url, headers: mediaHeaders() }}
                            style={styles.cellImage}
                            contentFit="cover"
                            transition={100}
                          />
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              ) : (
                <View>
                  {group.entries.map((item) => {
                    const url = mediaUrl(item.url);
                    return (
                      <Pressable
                        key={item.key}
                        style={styles.docRow}
                        onPress={() => {
                          WebBrowser.openBrowserAsync(url).catch(() => {
                            /* le navigateur système a refusé l'URL */
                          });
                        }}
                      >
                        <View style={[styles.docBadge, { backgroundColor: DOC_TINT[item.kind] }]}>
                          {item.kind === "audio" ? (
                            <Music size={17} color={colors.white} />
                          ) : (
                            <FileText size={17} color={colors.white} />
                          )}
                        </View>
                        <View style={styles.docLabels}>
                          <Text numberOfLines={1} style={styles.docName}>
                            {item.fileName || (item.kind === "audio" ? "Audio" : "Document")}
                          </Text>
                          <Text numberOfLines={1} style={styles.docMeta}>
                            {fmtTimeFull(item.timestamp)}
                          </Text>
                        </View>
                        <Download size={16} color={colors.icon} />
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {hasOlder ? (
        <View style={styles.olderWrap}>
          <Text style={styles.olderHint}>
            Seuls les messages chargés sont listés.
          </Text>
          <Pressable style={styles.olderButton} onPress={onLoadOlder} disabled={isLoadingOlder}>
            {isLoadingOlder ? <ActivityIndicator size="small" color={colors.white} /> : null}
            <Text style={styles.olderButtonText}>Charger plus d'historique</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.white },
  tabs: {
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  tab: { paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabActive: { borderBottomColor: colors.teal },
  tabLabel: { fontSize: 13, color: colors.muted },
  tabLabelActive: { color: colors.teal, fontWeight: "600" },
  empty: { paddingHorizontal: 24, paddingVertical: 40, textAlign: "center", fontSize: 14, color: colors.muted },
  body: { paddingHorizontal: 12, paddingTop: 8 },
  group: { marginBottom: 16 },
  groupLabel: {
    paddingVertical: 6,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: colors.muted,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  cell: {
    width: "32%",
    aspectRatio: 1,
    borderRadius: radius.sm,
    overflow: "hidden",
    backgroundColor: colors.inputBg,
  },
  cellImage: { width: "100%", height: "100%" },
  videoCell: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  docRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 4,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  docBadge: {
    width: 34,
    height: 34,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  docLabels: { flex: 1, minWidth: 0 },
  docName: { fontSize: 14, color: colors.text },
  docMeta: { fontSize: 12, color: colors.muted },
  olderWrap: {
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  olderHint: { fontSize: 12, color: colors.muted, textAlign: "center" },
  olderButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.teal,
  },
  olderButtonText: { fontSize: 12, fontWeight: "500", color: colors.white },
});
