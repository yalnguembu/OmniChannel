import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useVideoPlayer, VideoView } from "expo-video";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { mediaHeaders } from "@/api/client";
import { colors } from "@/theme";

export interface LightboxState {
  type: "image" | "video" | null;
  uri: string;
  caption?: string;
}

/** Lecteur vidéo plein écran — monté seulement à l'ouverture (le player est un hook). */
function VideoStage({ uri }: { uri: string }) {
  const player = useVideoPlayer({ uri, headers: mediaHeaders() }, (p) => {
    p.loop = false;
    p.play();
  });
  return <VideoView player={player} style={styles.stage} contentFit="contain" nativeControls />;
}

interface MediaLightboxProps {
  state: LightboxState;
  onClose: () => void;
}

/** Visionneuse plein écran — équivalent de `LightboxModal` du web. */
export function MediaLightbox({ state, onClose }: MediaLightboxProps) {
  const insets = useSafeAreaInsets();
  const open = !!state.type && !!state.uri;

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.backdrop}>
        <Pressable
          style={[styles.close, { top: insets.top + 10 }]}
          onPress={onClose}
          hitSlop={12}
          accessibilityLabel="Fermer"
        >
          <Ionicons name="close" size={26} color={colors.white} />
        </Pressable>

        {state.type === "image" ? (
          <Image
            source={{ uri: state.uri, headers: mediaHeaders() }}
            style={styles.stage}
            contentFit="contain"
          />
        ) : null}
        {state.type === "video" ? <VideoStage uri={state.uri} /> : null}

        {state.caption ? (
          <Text style={[styles.caption, { paddingBottom: insets.bottom + 16 }]}>
            {state.caption}
          </Text>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.95)", justifyContent: "center" },
  close: { position: "absolute", right: 16, zIndex: 2, padding: 6 },
  stage: { width: "100%", height: "78%" },
  caption: {
    color: colors.white,
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 24,
    paddingTop: 14,
  },
});
