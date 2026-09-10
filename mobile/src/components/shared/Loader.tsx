import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme";

/** Écran de chargement plein écran (réhydratation de session, garde de route…). */
export function FullScreenLoader({ label }: { label?: string }) {
  return (
    <View style={styles.wrap}>
      <ActivityIndicator size="large" color={colors.teal} />
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: colors.white,
  },
  label: { fontSize: 13, color: colors.muted },
});
