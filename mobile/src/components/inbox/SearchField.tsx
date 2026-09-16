import { Search, XCircle } from "lucide-react-native";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { colors, radius } from "@/theme";

interface SearchFieldProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

/**
 * Champ de recherche de la liste — portage de `SearchBar` du web : même
 * conteneur `px-3 py-3`, même pilule `bg-wa-input-bg` en `px-4 py-3`.
 */
export function SearchField({
  value,
  onChange,
  placeholder = "Rechercher ou démarrer une discussion",
}: SearchFieldProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.field}>
        <Search size={18} color={colors.muted} />
        <TextInput
          testID="search-conversations"
          accessibilityLabel="Rechercher une discussion"
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
            <XCircle size={18} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 12, paddingVertical: 12, backgroundColor: colors.sidebar },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.inputBg,
  },
  input: { flex: 1, fontSize: 15, color: colors.text, padding: 0 },
});
