import { Globe, X } from "lucide-react-native";
import { Image } from "expo-image";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { describeUrl } from "@/lib/richText";
import { colors, radius } from "@/theme";

/**
 * Carte d'aperçu affichée au-dessus du composeur dès qu'un lien est tapé, comme
 * WhatsApp prévisualise l'URL qu'on est en train d'envoyer. Portage de
 * `LinkPreview` du web.
 *
 * Elle montre la destination — favicon, domaine, URL complète — mais ni titre
 * ni vignette : ceux-là vivent dans les balises OpenGraph de la page cible, et
 * un aperçu riche demanderait un endpoint qui déplie l'URL côté serveur.
 * L'API n'en a pas aujourd'hui.
 */

interface LinkPreviewProps {
  /** URL absolue détectée dans le composeur. */
  url: string;
  onDismiss: () => void;
}

export function LinkPreview({ url, onDismiss }: LinkPreviewProps) {
  const [iconFailed, setIconFailed] = useState(false);
  const parsed = useMemo(() => describeUrl(url), [url]);

  if (!parsed) return null;

  return (
    <View style={styles.card}>
      <View style={styles.iconBox}>
        {iconFailed ? (
          <Globe size={18} color={colors.icon} />
        ) : (
          <Image
            source={{ uri: parsed.icon }}
            style={styles.icon}
            contentFit="contain"
            onError={() => setIconFailed(true)}
          />
        )}
      </View>

      <View style={styles.labels}>
        <Text style={styles.host} numberOfLines={1}>
          {parsed.host}
        </Text>
        <Text style={styles.pretty} numberOfLines={1}>
          {parsed.pretty}
        </Text>
      </View>

      <Pressable
        onPress={onDismiss}
        hitSlop={8}
        accessibilityLabel="Masquer l'aperçu du lien"
        style={styles.dismiss}
      >
        <X size={16} color={colors.icon} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.teal,
    backgroundColor: colors.bubbleIn,
    shadowColor: "#0b141a",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.inputBg,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  icon: { width: 20, height: 20 },
  labels: { flex: 1, minWidth: 0 },
  host: { fontSize: 13, fontWeight: "500", color: colors.text },
  pretty: { fontSize: 12, color: colors.muted },
  dismiss: { padding: 4 },
});
