import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { LocalFile } from "@/api/endpoints";
import { RadioList } from "@/components/shared/RadioList";
import { Sheet } from "@/components/shared/Sheet";
import {
  useProducts,
  useSegments,
  useSendTemplateFile,
  useSendTemplateToSegment,
  useTemplates,
} from "@/hooks/useWhatsapp";
import { colors, radius } from "@/theme";

type Mode = "segment" | "file";

/**
 * Diffusion d'un template approuvé — vers un segment
 * (POST /api/WhatsApp/send/template/segment) ou via un fichier de destinataires
 * (POST /api/WhatsApp/send/template/file). Portage de `TemplateBroadcastModal`
 * du web, moins le mode « client » qui vit dans la discussion elle-même.
 *
 * À rendre conditionnellement : l'état est initialisé au montage, il ne doit pas
 * survivre à une fermeture.
 */
export function BroadcastSheet({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<Mode>("segment");
  const [templateId, setTemplateId] = useState("");
  const [segmentId, setSegmentId] = useState("");
  const [productId, setProductId] = useState("");
  const [mappingOverride, setMappingOverride] = useState("");
  const [file, setFile] = useState<LocalFile | null>(null);

  const templatesQ = useTemplates();
  const segmentsQ = useSegments(mode === "segment");
  const productsQ = useProducts(mode === "file");

  const sendSegment = useSendTemplateToSegment();
  const sendFile = useSendTemplateFile();
  const isSending = sendSegment.isPending || sendFile.isPending;

  const templates = (templatesQ.data ?? []).filter((t) => !!t.id);
  const canSubmit = !!templateId && (mode === "segment" ? !!segmentId : !!file) && !isSending;

  const pickFile = async () => {
    const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
    const asset = res.canceled ? null : res.assets[0];
    if (!asset) return;
    setFile({
      uri: asset.uri,
      name: asset.name || "destinataires.csv",
      mimeType: asset.mimeType || "text/csv",
    });
  };

  const submit = () => {
    if (!canSubmit) return;
    if (mode === "segment") {
      sendSegment.mutate({ templateId, segmentId }, { onSuccess: onClose });
      return;
    }
    sendFile.mutate(
      {
        templateId,
        file: file!,
        productId: productId || undefined,
        mappingOverride: mappingOverride.trim() || undefined,
      },
      { onSuccess: onClose },
    );
  };

  return (
    <Sheet open onClose={onClose} title="Diffusion d'un template" scroll>
      <View style={styles.form}>
        <View style={styles.tabs}>
          {(["segment", "file"] as Mode[]).map((m) => (
            <Pressable
              key={m}
              onPress={() => setMode(m)}
              style={[styles.tab, mode === m && styles.tabActive]}
            >
              <Text style={[styles.tabText, mode === m && styles.tabTextActive]}>
                {m === "segment" ? "Segment" : "Fichier"}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Template</Text>
        <RadioList
          items={templates.map((t) => ({ id: t.id!, label: t.name || t.id!, hint: t.status }))}
          selected={templateId}
          onSelect={setTemplateId}
          isLoading={templatesQ.isLoading}
          emptyLabel="Aucun template disponible."
          maxHeight={200}
        />

        {mode === "segment" ? (
          <>
            <Text style={styles.label}>Segment</Text>
            <RadioList
              items={(segmentsQ.data ?? []).map((s) => ({ id: s.id, label: s.name || s.id }))}
              selected={segmentId}
              onSelect={setSegmentId}
              isLoading={segmentsQ.isLoading}
              emptyLabel="Aucun segment disponible."
              maxHeight={200}
            />
          </>
        ) : (
          <>
            <Text style={styles.label}>Fichier de destinataires</Text>
            <Pressable style={styles.filePicker} onPress={pickFile}>
              <Ionicons
                name={file ? "document-text" : "cloud-upload-outline"}
                size={20}
                color={colors.teal}
              />
              <Text style={styles.fileName} numberOfLines={1}>
                {file?.name ?? "Choisir un fichier (CSV, XLSX…)"}
              </Text>
            </Pressable>

            <Text style={styles.label}>Produit (optionnel)</Text>
            <RadioList
              items={(productsQ.data ?? []).map((p) => ({ id: p.id, label: p.name || p.id }))}
              selected={productId}
              onSelect={(id) => setProductId((current) => (current === id ? "" : id))}
              isLoading={productsQ.isLoading}
              emptyLabel="Aucun produit disponible."
              maxHeight={160}
            />

            <Text style={styles.label}>Mapping (optionnel)</Text>
            <TextInput
              value={mappingOverride}
              onChangeText={setMappingOverride}
              placeholder='Ex. {"1":"firstName"}'
              placeholderTextColor={colors.muted}
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </>
        )}

        <Pressable
          onPress={submit}
          disabled={!canSubmit}
          style={[styles.button, !canSubmit && styles.buttonDisabled]}
        >
          {isSending ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>Lancer la diffusion</Text>
          )}
        </Pressable>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  form: { paddingHorizontal: 18, paddingTop: 4, paddingBottom: 8, gap: 8 },
  tabs: { flexDirection: "row", gap: 8, marginBottom: 4 },
  tab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  tabActive: { backgroundColor: "#d9f8c4", borderColor: "#b7efaa" },
  tabText: { fontSize: 13.5, color: colors.text },
  tabTextActive: { fontWeight: "600" },
  label: { fontSize: 12.5, fontWeight: "600", color: colors.text, marginTop: 6 },
  filePicker: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 48,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
  },
  fileName: { flex: 1, fontSize: 13.5, color: colors.text },
  input: {
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    fontSize: 14,
    color: colors.text,
  },
  button: {
    height: 48,
    marginTop: 12,
    borderRadius: radius.md,
    backgroundColor: colors.greenSend,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: { opacity: 0.45 },
  buttonText: { color: colors.white, fontSize: 15, fontWeight: "600" },
});
