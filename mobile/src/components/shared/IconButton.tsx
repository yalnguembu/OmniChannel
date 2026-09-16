import { type LucideIcon } from "lucide-react-native";
import { Pressable, StyleSheet } from "react-native";
import { colors } from "@/theme";

interface IconButtonProps {
  icon: LucideIcon;
  label: string;
  size?: number;
  active?: boolean;
  onPress: () => void;
  testID?: string;
}

/**
 * Bouton d'icône rond — portage de `IconButton` du web (`size-10 rounded-full`,
 * teinte `wa-icon`, fond `wa-active` quand actif).
 */
export function IconButton({
  icon: Icon,
  label,
  size = 20,
  active,
  onPress,
  testID,
}: IconButtonProps) {
  return (
    <Pressable
      testID={testID}
      accessibilityLabel={label}
      onPress={onPress}
      android_ripple={{ color: colors.active, borderless: true, radius: 20 }}
      style={({ pressed }) => [
        styles.button,
        (active || pressed) && styles.buttonActive,
      ]}
    >
      <Icon size={size} color={active ? colors.teal : colors.icon} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonActive: { backgroundColor: colors.active },
});
