import { AlertCircle, ExternalLink, Pause, Play } from "lucide-react-native";
import Slider from "@react-native-community/slider";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { mediaHeaders } from "@/api/client";
import { colors, radius } from "@/theme";

/**
 * Lecteur de note vocale façon WhatsApp — portage de `AudioPlayer` du web.
 *
 * Commandes maison plutôt que le lecteur natif, pour les mêmes raisons que le
 * web : le widget système ne dit rien quand le média ne charge pas (une barre
 * grise morte — le symptôme « impossible d'ouvrir l'audio »), et les notes
 * vocales sont souvent servies sans métadonnée de durée, ce qui laisse sa
 * timeline bloquée à 0:00.
 */

/** Vitesses proposées, comme le web. */
const RATES = [1, 1.5, 2] as const;

/**
 * Au-delà de ce délai sans chargement, on considère le fichier introuvable.
 *
 * Le web lit le code de `MediaError` pour distinguer un codec non supporté
 * d'un 404 ; `expo-audio` n'expose aucun champ d'erreur, seulement `isLoaded`
 * et `isBuffering` — le diagnostic se fait donc au temps écoulé.
 */
const LOAD_TIMEOUT_MS = 8000;

function fmt(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${`${s}`.padStart(2, "0")}`;
}

export function AudioBubble({ uri }: { uri: string }) {
  const player = useAudioPlayer({ uri, headers: mediaHeaders() });
  const status = useAudioPlayerStatus(player);
  const [rate, setRate] = useState<number>(1);
  const [timedOut, setTimedOut] = useState(false);
  /** Position tenue pendant un glissement, pour que la poignée ne saute pas. */
  const [scrubbing, setScrubbing] = useState<number | null>(null);

  const duration = status.duration ?? 0;
  const position = scrubbing ?? status.currentTime ?? 0;
  const loaded = status.isLoaded;

  // Remise à zéro quand le clip change (les bulles sont recyclées au défilement).
  useEffect(() => {
    setRate(1);
    setTimedOut(false);
    setScrubbing(null);
  }, [uri]);

  useEffect(() => {
    if (loaded) {
      setTimedOut(false);
      return;
    }
    const timer = setTimeout(() => setTimedOut(true), LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [loaded, uri]);

  if (timedOut && !loaded) {
    return (
      <View style={styles.failure}>
        <AlertCircle size={18} color={colors.status.PENDING} />
        <Text style={styles.failureText}>Fichier audio introuvable</Text>
        <Pressable
          style={styles.openPill}
          onPress={() => {
            WebBrowser.openBrowserAsync(uri).catch(() => {
              /* aucune app pour ouvrir ce fichier */
            });
          }}
        >
          <ExternalLink size={13} color={colors.teal} />
          <Text style={styles.openLabel}>Ouvrir</Text>
        </Pressable>
      </View>
    );
  }

  const toggle = () => {
    if (status.playing) {
      player.pause();
      return;
    }
    // Relancer depuis la fin ne produit aucun son : on rembobine d'abord.
    if (duration > 0 && position >= duration - 0.2) player.seekTo(0);
    player.play();
  };

  const cycleRate = () => {
    const next = RATES[(RATES.indexOf(rate as (typeof RATES)[number]) + 1) % RATES.length];
    setRate(next);
    // `setPlaybackRate`, pas l'affectation : les types d'`expo-audio` déclarent
    // `playbackRate` comme accessible en écriture (et ses exemples l'écrivent),
    // mais le module natif n'expose qu'un getter — l'affectation lève
    // « Cannot assign to property 'playbackRate' which has only a getter ».
    player.setPlaybackRate(next);
  };

  return (
    <View style={styles.row}>
      <Pressable
        onPress={toggle}
        hitSlop={6}
        accessibilityLabel={status.playing ? "Pause" : "Lire"}
        style={styles.playButton}
      >
        {status.playing ? (
          <Pause size={17} color={colors.icon} />
        ) : (
          <Play size={17} color={colors.icon} style={styles.playIcon} />
        )}
      </Pressable>

      <View style={styles.track}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={duration > 0 ? duration : 1}
          value={position}
          minimumTrackTintColor={colors.teal}
          maximumTrackTintColor="rgba(0,0,0,0.15)"
          thumbTintColor={colors.teal}
          disabled={duration <= 0}
          onValueChange={setScrubbing}
          onSlidingComplete={(v) => {
            player.seekTo(v);
            setScrubbing(null);
          }}
          accessibilityLabel="Position de lecture"
        />
        <View style={styles.times}>
          <Text style={styles.time}>{fmt(position)}</Text>
          <Text style={styles.time}>{duration > 0 ? fmt(duration) : "--:--"}</Text>
        </View>
      </View>

      <Pressable
        onPress={cycleRate}
        hitSlop={6}
        accessibilityLabel="Vitesse de lecture"
        style={[styles.rateButton, rate !== 1 && styles.rateButtonActive]}
      >
        <Text style={[styles.rateLabel, rate !== 1 && styles.rateLabelActive]}>{rate}x</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  // `w-full min-w-48 max-w-72` côté web.
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minWidth: 192,
    maxWidth: 288,
    paddingVertical: 2,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  playIcon: { marginLeft: 2 },
  track: { flex: 1, minWidth: 0 },
  // La hauteur native du curseur est plus grande que la barre du web : on la
  // borne pour garder la bulle compacte.
  slider: { width: "100%", height: 24, marginVertical: -4 },
  times: { flexDirection: "row", justifyContent: "space-between", marginTop: 2 },
  time: { fontSize: 11, color: colors.muted },
  rateButton: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  rateButtonActive: { backgroundColor: "rgba(18,140,126,0.12)" },
  rateLabel: { fontSize: 11, color: colors.muted },
  rateLabelActive: { color: colors.teal, fontWeight: "600" },
  failure: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minWidth: 208,
    paddingVertical: 4,
  },
  failureText: { flex: 1, fontSize: 12, color: colors.muted },
  openPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
  },
  openLabel: { fontSize: 12, color: colors.teal },
});
