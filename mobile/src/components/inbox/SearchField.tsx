import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { colors, radius } from "@/theme";

interface SearchFieldProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function SearchField({ value, onChange, placeholder = "Rechercher" }: SearchFieldProps) {
  return (
    <View style={styles.wrap}>
      <Ionicons name="search" size={17} color={colors.muted} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
      {value.length > 0 ? (
        <Pressable onPress={() => onChange("")} hitSlop={8}>
          <Ionicons name="close-circle" size={17} color={colors.muted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 12,
    marginBottom: 10,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.inputBg,
  },
  input: { flex: 1, fontSize: 14.5, color: colors.text, padding: 0 },
});
