import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme";

/**
 * Pastille d'initiales — portage de `AvatarInitials` du web, tailles incluses
 * (`sm` 32 / `md` 40 / `lg` 48 / `xl` 112, avec la taille de texte qui va avec).
 */
const SIZES = {
  sm: { box: 32, font: 14 },
  md: { box: 40, font: 16 },
  lg: { box: 48, font: 18 },
  /** `size-28 text-3xl` — l'identité en tête du panneau de détails. */
  xl: { box: 112, font: 30 },
} as const;

interface AvatarProps {
  initials: string;
  background: string;
  size?: keyof typeof SIZES;
}

export function Avatar({ initials, background, size = "md" }: AvatarProps) {
  const { box, font } = SIZES[size];
  return (
    <View
      style={[
        styles.avatar,
        { width: box, height: box, borderRadius: box / 2, backgroundColor: background },
      ]}
    >
      <Text style={[styles.initials, { fontSize: font }]}>{initials.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { alignItems: "center", justifyContent: "center" },
  initials: {
    color: colors.white,
    fontWeight: "600",
    // `tracking-tight` du web.
    letterSpacing: -0.4,
  },
});
