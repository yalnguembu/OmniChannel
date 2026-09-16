import { Search } from "lucide-react-native";
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { deburr, EMOJI_GROUPS } from "@/lib/emoji";
import { colors, radius } from "@/theme";

/**
 * Sélecteur d'émojis du composeur — pendant du panneau `emoji-picker-react` du
 * web : même jeu d'émojis, même ordre de groupes, un champ de recherche puis une
 * grille. Dimensions du web (280 × 340) élargies à la laisse du composeur,
 * l'écran étant plus étroit.
 *
 * Les émojis sont insérés au curseur, comme sur le web, pas ajoutés en fin de
 * champ.
 */

/** Assez large pour un doigt, assez serré pour tenir 8 colonnes en 360 dp. */
const COLUMNS = 8;

/**
 * Index sans accents, construit à la première recherche et gardé ensuite : le
 * panneau se monte et se démonte à chaque ouverture, et rien ne justifie de
 * déaccentuer 1 800 chaînes à chaque fois — ni de le faire pour quelqu'un qui
 * ne cherche jamais.
 */
let searchIndex: [string, string][] | null = null;

function getSearchIndex(): [string, string][] {
  searchIndex ??= EMOJI_GROUPS.flatMap((g) =>
    g.emojis.map(([char, names]) => [char, deburr(names)] as [string, string]),
  );
  return searchIndex;
}

export function EmojiPicker({ onSelect }: { onSelect: (emoji: string) => void }) {
  const [groupIndex, setGroupIndex] = useState(0);
  const [query, setQuery] = useState("");

  const shown = useMemo(() => {
    const term = deburr(query.trim());
    if (!term) return EMOJI_GROUPS[groupIndex].emojis;
    // La recherche balaie tous les groupes : sur le web aussi elle ignore
    // l'onglet actif.
    return getSearchIndex().filter(([, names]) => names.includes(term));
  }, [groupIndex, query]);

  return (
    <View style={styles.panel}>
      <View style={styles.search}>
        <Search size={15} color={colors.muted} />
        <TextInput
          accessibilityLabel="Chercher un émoji"
          value={query}
          onChangeText={setQuery}
          placeholder="Chercher..."
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.tabs}>
        {EMOJI_GROUPS.map((g, i) => (
          <Pressable
            key={g.id}
            onPress={() => {
              setQuery("");
              setGroupIndex(i);
            }}
            accessibilityLabel={g.label}
            style={[styles.tab, i === groupIndex && !query ? styles.tabActive : null]}
          >
            <Text style={styles.tabIcon}>{g.icon}</Text>
          </Pressable>
        ))}
      </View>

      {shown.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Aucun émoji pour « {query.trim()} ».</Text>
        </View>
      ) : (
        <FlatList
          // La clé doit rester unique : un même glyphe peut apparaître dans
          // deux groupes, et la recherche les concatène.
          data={shown}
          keyExtractor={([char], i) => `${char}-${i}`}
          numColumns={COLUMNS}
          // Sans ça, le premier appui ne sert qu'à refermer le clavier.
          keyboardShouldPersistTaps="always"
          style={styles.grid}
          contentContainerStyle={styles.gridContent}
          renderItem={({ item: [char, names] }) => (
            <Pressable
              onPress={() => onSelect(char)}
              accessibilityLabel={names || char}
              style={({ pressed }) => [styles.cell, pressed && styles.cellPressed]}
            >
              <Text style={styles.emoji}>{char}</Text>
            </Pressable>
          )}
          initialNumToRender={64}
          windowSize={5}
          removeClippedSubviews
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    marginHorizontal: 16,
    marginBottom: 8,
    height: 340,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    overflow: "hidden",
    shadowColor: "#0b141a",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 10,
    marginTop: 10,
    paddingHorizontal: 12,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: colors.inputBg,
  },
  searchInput: { flex: 1, fontSize: 13.5, color: colors.text, padding: 0 },
  tabs: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: { borderBottomColor: colors.greenSend },
  tabIcon: { fontSize: 17 },
  grid: { flex: 1 },
  gridContent: { paddingHorizontal: 4, paddingVertical: 4 },
  cell: {
    flex: 1 / COLUMNS,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
  },
  cellPressed: { backgroundColor: colors.hover },
  emoji: { fontSize: 24 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  emptyText: { fontSize: 12.5, color: colors.muted, textAlign: "center" },
});
