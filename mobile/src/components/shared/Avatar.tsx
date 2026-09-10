import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme";

interface AvatarProps {
  initials: string;
  background: string;
  size?: number;
}

/** Pastille d'initiales colorée — équivalent de `AvatarInitials` du web. */
export function Avatar({ initials, background, size = 50 }: AvatarProps) {
  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: background,
        },
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.38 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { alignItems: "center", justifyContent: "center" },
  initials: { color: colors.white, fontWeight: "600" },
});
