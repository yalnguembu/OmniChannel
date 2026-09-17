import { useMemo } from "react";
import { Linking, StyleSheet, Text, type StyleProp, type TextStyle } from "react-native";
import { tokenizeRichText } from "@/lib/richText";
import { colors } from "@/theme";

/**
 * Corps de message avec liens, e-mails et téléphones cliquables, et le terme de
 * recherche surligné à l'intérieur — portage du rendu de `RichText` du web.
 */

/** Découpe `text` autour de `term` pour en surligner chaque occurrence. */
function highlightParts(text: string, term?: string): { text: string; hit: boolean }[] {
  const needle = term?.trim() ?? "";
  if (!needle) return [{ text, hit: false }];

  const parts: { text: string; hit: boolean }[] = [];
  const haystack = text.toLowerCase();
  const lower = needle.toLowerCase();
  let cursor = 0;

  for (;;) {
    const at = haystack.indexOf(lower, cursor);
    if (at === -1) {
      if (cursor < text.length) parts.push({ text: text.slice(cursor), hit: false });
      break;
    }
    if (at > cursor) parts.push({ text: text.slice(cursor, at), hit: false });
    parts.push({ text: text.slice(at, at + needle.length), hit: true });
    cursor = at + needle.length;
  }
  return parts;
}

function Highlighted({ text, term }: { text: string; term?: string }) {
  const parts = useMemo(() => highlightParts(text, term), [text, term]);
  if (parts.length === 1 && !parts[0].hit) return <>{parts[0].text}</>;
  return (
    <>
      {parts.map((part, i) =>
        part.hit ? (
          <Text key={i} style={styles.mark}>
            {part.text}
          </Text>
        ) : (
          part.text
        ),
      )}
    </>
  );
}

interface RichTextProps {
  text: string;
  /** Terme de la recherche interne, surligné dans le texte comme dans les liens. */
  highlight?: string;
  style?: StyleProp<TextStyle>;
}

export function RichText({ text, highlight, style }: RichTextProps) {
  const tokens = useMemo(() => tokenizeRichText(text), [text]);

  return (
    <Text style={style}>
      {tokens.map((token, i) => {
        if (token.kind === "text") {
          return <Highlighted key={i} text={token.text} term={highlight} />;
        }
        return (
          <Text
            key={i}
            style={styles.link}
            // La bulle a son propre appui long (menu d'actions) : ouvrir un lien
            // ne doit pas le déclencher, d'où le `onPress` sur le seul segment.
            onPress={() => {
              if (token.href) {
                Linking.openURL(token.href).catch(() => {
                  /* aucune app pour ce schéma (tel:, mailto:) */
                });
              }
            }}
          >
            <Highlighted text={token.text} term={highlight} />
          </Text>
        );
      })}
    </Text>
  );
}

const styles = StyleSheet.create({
  link: { color: "#027eb5", textDecorationLine: "underline" },
  mark: { backgroundColor: "#fbe9a1" },
});
