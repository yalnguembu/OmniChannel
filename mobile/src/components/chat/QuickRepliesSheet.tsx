import { Download, Trash2, Upload } from "lucide-react-native";
import * as DocumentPicker from "expo-document-picker";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Sheet } from "@/components/shared/Sheet";
import { normaliseShortcut, type QuickReply, type QuickReplyFile } from "@/lib/quickReplies";
import { toast } from "@/lib/toast";
import { useQuickReplyStore } from "@/store/quickReplyStore";
import { colors, radius } from "@/theme";

/**
 * Gestion des réponses rapides — portage de `QuickRepliesModal` du web :
 * liste, édition, suppression, et import / export JSON au même format
 * (`{ version: 1, quickReplies: [...] }`), pour que les deux clients puissent
 * s'échanger un jeu de réponses.
 */

const EXPORT_NAME = "reponses-rapides.json";

interface QuickRepliesSheetProps {
  open: boolean;
  onClose: () => void;
}

export function QuickRepliesSheet({ open, onClose }: QuickRepliesSheetProps) {
  const replies = useQuickReplyStore((s) => s.replies);
  const error = useQuickReplyStore((s) => s.error);
  const hydrate = useQuickReplyStore((s) => s.hydrate);
  const save = useQuickReplyStore((s) => s.save);
  const remove = useQuickReplyStore((s) => s.remove);
  const importMany = useQuickReplyStore((s) => s.importMany);

  const [editing, setEditing] = useState<QuickReply | null>(null);
  const [shortcut, setShortcut] = useState("");
  const [label, setLabel] = useState("");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) hydrate();
  }, [open, hydrate]);

  const resetForm = () => {
    setEditing(null);
    setShortcut("");
    setLabel("");
    setContent("");
  };

  const startEdit = (reply: QuickReply) => {
    setEditing(reply);
    setShortcut(reply.shortcut);
    setLabel(reply.label ?? "");
    setContent(reply.content);
  };

  const canSave = normaliseShortcut(shortcut).length > 0 && content.trim().length > 0;

  const submit = async () => {
    if (!canSave) return;
    const saved = await save({ shortcut, label, content }, editing ?? undefined);
    if (!saved) {
      toast.error("Enregistrement impossible");
      return;
    }
    toast.success(editing ? "Réponse rapide mise à jour" : "Réponse rapide ajoutée", 1600);
    resetForm();
  };

  const exportAll = async () => {
    if (replies.length === 0) {
      toast.info("Aucune réponse rapide à exporter");
      return;
    }
    setBusy(true);
    try {
      const payload: QuickReplyFile = {
        version: 1,
        exportedAt: new Date().toISOString(),
        quickReplies: replies.map((r) => ({
          shortcut: r.shortcut,
          content: r.content,
          ...(r.label ? { label: r.label } : {}),
        })),
      };
      // Le fichier part dans le cache : c'est un export jetable, que le
      // système effacera de lui-même si la place manque.
      const file = new File(Paths.cache, EXPORT_NAME);
      if (file.exists) file.delete();
      file.create();
      file.write(JSON.stringify(payload, null, 2));

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: "application/json",
          dialogTitle: "Exporter les réponses rapides",
        });
      } else {
        toast.info(`Fichier écrit : ${file.uri}`);
      }
    } catch {
      toast.error("Export impossible");
    } finally {
      setBusy(false);
    }
  };

  const importFile = async () => {
    setBusy(true);
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
      });
      const asset = res.canceled ? null : res.assets[0];
      if (!asset) return;

      const raw = await new File(asset.uri).text();
      const parsed = JSON.parse(raw) as QuickReplyFile;
      const entries = Array.isArray(parsed?.quickReplies) ? parsed.quickReplies : [];
      const valid = entries.filter(
        (e) => typeof e?.shortcut === "string" && typeof e?.content === "string",
      );
      if (valid.length === 0) {
        toast.error("Fichier sans réponse rapide exploitable");
        return;
      }
      const count = await importMany(valid);
      toast.success(`${count} réponse${count > 1 ? "s" : ""} importée${count > 1 ? "s" : ""}`);
    } catch {
      toast.error("Import impossible (fichier illisible)");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title="Réponses rapides" tall scroll>
      <View style={styles.body}>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.hint}>
          Tapez « / » suivi du raccourci dans le composeur pour insérer le texte.
          Les réponses restent sur cet appareil.
        </Text>

        {/* Formulaire — création ou édition. */}
        <View style={styles.form}>
          <View style={styles.formRow}>
            <View style={styles.shortcutField}>
              <Text style={styles.fieldLabel}>Raccourci</Text>
              <View style={styles.shortcutInputWrap}>
                <Text style={styles.slash}>/</Text>
                <TextInput
                  value={shortcut}
                  onChangeText={setShortcut}
                  placeholder="reabo"
                  placeholderTextColor={colors.muted}
                  style={styles.shortcutInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>
            <View style={styles.labelField}>
              <Text style={styles.fieldLabel}>Titre (optionnel)</Text>
              <TextInput
                value={label}
                onChangeText={setLabel}
                placeholder="Relance réabonnement"
                placeholderTextColor={colors.muted}
                style={styles.input}
              />
            </View>
          </View>

          <Text style={styles.fieldLabel}>Texte inséré</Text>
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="Bonjour, votre abonnement…"
            placeholderTextColor={colors.muted}
            style={[styles.input, styles.textarea]}
            multiline
          />

          <View style={styles.formActions}>
            {editing ? (
              <Pressable style={styles.secondaryButton} onPress={resetForm}>
                <Text style={styles.secondaryLabel}>Annuler</Text>
              </Pressable>
            ) : null}
            <Pressable
              style={[styles.primaryButton, !canSave && styles.primaryButtonDisabled]}
              disabled={!canSave}
              onPress={submit}
            >
              <Text style={styles.primaryLabel}>{editing ? "Enregistrer" : "Ajouter"}</Text>
            </Pressable>
          </View>
        </View>

        {/* Import / export, au même format que le web. */}
        <View style={styles.ioRow}>
          <Pressable style={styles.ioButton} onPress={importFile} disabled={busy}>
            <Download size={15} color={colors.teal} />
            <Text style={styles.ioLabel}>Importer</Text>
          </Pressable>
          <Pressable style={styles.ioButton} onPress={exportAll} disabled={busy}>
            <Upload size={15} color={colors.teal} />
            <Text style={styles.ioLabel}>Exporter</Text>
          </Pressable>
        </View>

        {/* Liste. */}
        <Text style={styles.sectionTitle}>
          {replies.length} réponse{replies.length > 1 ? "s" : ""}
        </Text>
        {replies.length === 0 ? (
          <Text style={styles.empty}>Aucune réponse rapide pour l'instant.</Text>
        ) : (
          replies.map((reply) => (
            <View key={reply.id} style={styles.row}>
              <Pressable style={styles.rowBody} onPress={() => startEdit(reply)}>
                <View style={styles.rowTop}>
                  <Text style={styles.rowShortcut}>/{reply.shortcut}</Text>
                  {reply.label ? (
                    <Text style={styles.rowLabel} numberOfLines={1}>
                      {reply.label}
                    </Text>
                  ) : null}
                </View>
                <Text style={styles.rowContent} numberOfLines={2}>
                  {reply.content}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => remove(reply.id)}
                hitSlop={8}
                accessibilityLabel={`Supprimer /${reply.shortcut}`}
                style={styles.deleteButton}
              >
                <Trash2 size={18} color={colors.danger} />
              </Pressable>
            </View>
          ))
        )}
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
  error: {
    marginBottom: 10,
    padding: 10,
    borderRadius: radius.md,
    backgroundColor: "#fef3c7",
    fontSize: 12.5,
    color: "#92400e",
  },
  hint: { fontSize: 12, lineHeight: 17, color: colors.muted },
  form: { marginTop: 14, gap: 6 },
  formRow: { flexDirection: "row", gap: 10 },
  shortcutField: { width: 128, gap: 5 },
  labelField: { flex: 1, gap: 5 },
  fieldLabel: { fontSize: 11.5, fontWeight: "500", color: colors.text },
  shortcutInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    height: 42,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    gap: 2,
  },
  slash: { fontSize: 15, color: colors.teal, fontWeight: "600" },
  shortcutInput: { flex: 1, fontSize: 15, color: colors.text, padding: 0 },
  input: {
    minHeight: 42,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
  },
  textarea: { minHeight: 88, textAlignVertical: "top" },
  formActions: { flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 4 },
  secondaryButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryLabel: { fontSize: 13, color: colors.text },
  primaryButton: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: radius.md,
    backgroundColor: colors.greenSend,
  },
  primaryButtonDisabled: { opacity: 0.45 },
  primaryLabel: { fontSize: 13, fontWeight: "600", color: colors.white },
  ioRow: { flexDirection: "row", gap: 8, marginTop: 16 },
  ioButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ioLabel: { fontSize: 12.5, color: colors.text },
  sectionTitle: {
    marginTop: 18,
    marginBottom: 4,
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: colors.muted,
  },
  empty: { paddingVertical: 12, fontSize: 13, color: colors.muted },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  rowBody: { flex: 1, minWidth: 0 },
  rowTop: { flexDirection: "row", alignItems: "baseline", gap: 8 },
  rowShortcut: { fontSize: 13.5, fontWeight: "500", color: colors.teal },
  rowLabel: { flex: 1, minWidth: 0, fontSize: 12.5, color: colors.text },
  rowContent: { marginTop: 2, fontSize: 12.5, color: colors.muted },
  deleteButton: { padding: 4 },
});
