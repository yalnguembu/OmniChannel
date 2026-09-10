import { Ionicons } from "@expo/vector-icons";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { mediaHeaders } from "@/api/client";
import { colors, radius } from "@/theme";

function fmt(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Lecteur audio compact — équivalent de `AudioPlayer` du web (note vocale). */
export function AudioBubble({ uri }: { uri: string }) {
  const player = useAudioPlayer({ uri, headers: mediaHeaders() });
  const status = useAudioPlayerStatus(player);

  const duration = status.duration ?? 0;
  const position = status.currentTime ?? 0;
  const progress = duration > 0 ? Math.min(position / duration, 1) : 0;

  const toggle = () => {
    if (status.playing) {
      player.pause();
      return;
    }
    // Relancer depuis la fin ne produit aucun son : on rembobine d'abord.
    if (duration > 0 && position >= duration - 0.2) player.seekTo(0);
    player.play();
  };

  return (
    <View style={styles.row}>
      <Pressable onPress={toggle} hitSlop={8} style={styles.button}>
        <Ionicons name={status.playing ? "pause" : "play"} size={18} color={colors.white} />
      </Pressable>
      <View style={styles.track}>
        <View style={styles.trackBg} />
        <View style={[styles.trackFill, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.time}>{fmt(status.playing || position > 0 ? position : duration)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10, minWidth: 190, paddingVertical: 4 },
  button: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.teal,
    alignItems: "center",
    justifyContent: "center",
  },
  track: { flex: 1, height: 4, justifyContent: "center" },
  trackBg: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: "rgba(0,0,0,0.12)",
  },
  trackFill: { height: 4, borderRadius: radius.pill, backgroundColor: colors.teal },
  time: { fontSize: 11, color: colors.muted, minWidth: 34, textAlign: "right" },
});
