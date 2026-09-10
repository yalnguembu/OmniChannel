import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { ClientBody, ClientSearchResult, Option } from "@/api/endpoints";
import { Sheet } from "@/components/shared/Sheet";
import { colors, radius } from "@/theme";

interface ContactSheetProps {
  open: boolean;
  onClose: () => void;
  /** Numéro de la discussion — clé de résolution du contact, non modifiable. */
  phone: string;
  /** Nom éventuellement remonté par WhatsApp, pour préremplir une création. */
  suggestedName?: string | null;
  existing: ClientSearchResult | null;
  products: Option[];
  statuses: string[];
  isSaving: boolean;
  onSave: (body: ClientBody) => Promise<boolean>;
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  editable = true,
}: {
  label: string;
  value: string;
  onChangeText?: (v: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "email-address" | "phone-pad";
  editable?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        style={[styles.input, !editable && styles.inputDisabled]}
        editable={editable}
        keyboardType={keyboardType ?? "default"}
        autoCapitalize={keyboardType === "email-address" ? "none" : "words"}
        autoCorrect={false}
      />
    </View>
  );
}

function ChipRow({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: { id: string; label: string }[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  if (options.length === 0) return null;
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {options.map((o) => (
          <Pressable
            key={o.id}
            onPress={() => onSelect(o.id)}
            style={[styles.chip, selected === o.id && styles.chipActive]}
          >
            <Text style={[styles.chipText, selected === o.id && styles.chipTextActive]}>
              {o.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

/**
 * Ajout / édition du contact CRM d'une discussion — équivalent mobile de
 * `ContactModal` du web, réduit aux champs utiles depuis une conversation
 * (les attributs personnalisés restent sur le portail web).
 *
 * À rendre conditionnellement : l'état du formulaire est initialisé au montage,
 * il ne doit pas survivre à un changement de contact.
 */
export function ContactSheet({
  open,
  onClose,
  phone,
  suggestedName,
  existing,
  products,
  statuses,
  isSaving,
  onSave,
}: ContactSheetProps) {
  const isEdit = !!existing;

  const [firstName, setFirstName] = useState(
    existing?.firstName ?? (suggestedName && suggestedName !== phone ? suggestedName : ""),
  );
  const [lastName, setLastName] = useState(existing?.lastName ?? "");
  const [email, setEmail] = useState(existing?.email ?? "");
  const [status, setStatus] = useState(existing?.status ?? "");
  // À la création, le produit de rattachement est obligatoire côté backend ;
  // à l'édition il est verrouillé (le hook rejoue celui déjà en base).
  const [productId, setProductId] = useState(existing?.productId ?? "");

  const canSubmit =
    !isSaving && (isEdit || !!productId) && (!!firstName.trim() || !!lastName.trim());

  const submit = async () => {
    if (!canSubmit) return;
    // Chaînes envoyées telles quelles (y compris vides) : côté mise à jour, une
    // chaîne vide vaut suppression du champ, une clé absente vaut « inchangé ».
    const ok = await onSave({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone,
      status,
      productId: isEdit ? undefined : productId,
    });
    if (ok) onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={isEdit ? "Éditer le contact" : "Ajouter aux contacts"}
      scroll
    >
      <View style={styles.form}>
        <Field label="Téléphone" value={phone} editable={false} />
        <Field label="Prénom" value={firstName} onChangeText={setFirstName} placeholder="Prénom" />
        <Field label="Nom" value={lastName} onChangeText={setLastName} placeholder="Nom" />
        <Field
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          placeholder="adresse@exemple.com"
          keyboardType="email-address"
        />

        {!isEdit ? (
          <ChipRow
            label="Produit"
            options={products.map((p) => ({ id: p.id, label: p.name || p.id }))}
            selected={productId}
            onSelect={setProductId}
          />
        ) : null}

        <ChipRow
          label="Statut"
          options={statuses.map((s) => ({ id: s, label: s }))}
          selected={status}
          onSelect={(s) => setStatus((current) => (current === s ? "" : s))}
        />

        <Pressable
          onPress={submit}
          disabled={!canSubmit}
          style={[styles.button, !canSubmit && styles.buttonDisabled]}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>{isEdit ? "Enregistrer" : "Ajouter"}</Text>
          )}
        </Pressable>

        {!isEdit && products.length === 0 ? (
          <Text style={styles.hint}>
            Aucun produit disponible : un contact doit être rattaché à un produit.
          </Text>
        ) : null}
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  form: { paddingHorizontal: 18, paddingTop: 4, paddingBottom: 8, gap: 12 },
  field: { gap: 5 },
  label: { fontSize: 12.5, fontWeight: "500", color: colors.text },
  input: {
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    fontSize: 15,
    color: colors.text,
  },
  inputDisabled: { backgroundColor: colors.inputBg, color: colors.muted },
  chips: { gap: 8, paddingVertical: 2 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: "#d9f8c4", borderColor: "#b7efaa" },
  chipText: { fontSize: 13, color: colors.text },
  chipTextActive: { fontWeight: "600" },
  button: {
    height: 48,
    marginTop: 4,
    borderRadius: radius.md,
    backgroundColor: colors.greenSend,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: { opacity: 0.45 },
  buttonText: { color: colors.white, fontSize: 15, fontWeight: "600" },
  hint: { fontSize: 12, color: colors.muted, lineHeight: 17 },
});
