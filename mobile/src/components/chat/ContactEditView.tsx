import {
  Check,
  ChevronDown,
  type LucideIcon,
  Mail,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { ClientBody, ClientSearchResult, Option } from "@/api/endpoints";
import { statusLabel } from "@/lib/labels";
import { colors, radius } from "@/theme";

/**
 * Formulaire de contact CRM — sous-vue du panneau de détails, portage de
 * `ContactEditView` du web : une gouttière d'icônes à gauche, un champ souligné
 * par ligne, et l'enregistrement dans le pied du panneau.
 *
 * Seule différence assumée : le téléphone n'est pas modifiable, c'est la clé de
 * résolution du contact depuis la discussion. Les attributs personnalisés
 * restent gérés sur le portail web.
 *
 * À monter à l'ouverture : l'état est initialisé une fois, il ne doit pas
 * survivre à un changement de contact.
 */

export interface ContactEditHandle {
  submit: () => void;
  canSubmit: boolean;
}

interface ContactEditViewProps {
  /** Numéro de la discussion — clé de résolution du contact, non modifiable. */
  phone: string;
  /** Nom éventuellement remonté par WhatsApp, pour préremplir une création. */
  suggestedName?: string | null;
  existing: ClientSearchResult | null;
  products: Option[];
  statuses: string[];
  onSave: (body: ClientBody) => Promise<boolean>;
  onSaved: () => void;
  /** Reçoit le déclencheur d'enregistrement, posé dans le pied du panneau. */
  onHandle: (handle: ContactEditHandle) => void;
}

/** Une ligne de champs précédée de la gouttière d'icône. */
function Group({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <View style={styles.gutter}>
        <Icon size={20} color={colors.icon} />
      </View>
      <View style={styles.groupFields}>{children}</View>
    </View>
  );
}

/** Un champ : libellé au-dessus d'un champ souligné. */
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
    <View>
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

/** Le pendant du `Dropdown` du web : déclencheur au style du champ, puis liste. */
function SelectField({
  label,
  placeholder,
  options,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityLabel={`Choisir : ${label}`}
        style={[styles.input, styles.select]}
        onPress={() => setOpen((v) => !v)}
      >
        <Text style={[styles.selectText, !current && styles.selectPlaceholder]} numberOfLines={1}>
          {current?.label ?? placeholder}
        </Text>
        <ChevronDown size={16} color={colors.icon} />
      </Pressable>
      {open ? (
        <View style={styles.menu}>
          {options.length === 0 ? (
            <Text style={styles.menuEmpty}>Aucune valeur disponible.</Text>
          ) : (
            options.map((o) => (
              <Pressable
                key={o.value}
                style={styles.menuRow}
                onPress={() => {
                  setOpen(false);
                  if (o.value !== value) onChange(o.value);
                }}
              >
                <Text
                  style={[styles.menuText, o.value === value && styles.menuTextActive]}
                  numberOfLines={1}
                >
                  {o.label}
                </Text>
                {o.value === value ? <Check size={15} color={colors.teal} /> : null}
              </Pressable>
            ))
          )}
        </View>
      ) : null}
    </View>
  );
}

export function ContactEditView({
  phone,
  suggestedName,
  existing,
  products,
  statuses,
  onSave,
  onSaved,
  onHandle,
}: ContactEditViewProps) {
  const isEdit = !!existing;

  const [firstName, setFirstName] = useState(
    existing?.firstName ?? (suggestedName && suggestedName !== phone ? suggestedName : ""),
  );
  const [lastName, setLastName] = useState(existing?.lastName ?? "");
  const [email, setEmail] = useState(existing?.email ?? "");
  const [city, setCity] = useState(existing?.city ?? "");
  const [country, setCountry] = useState(existing?.country ?? "");
  const [status, setStatus] = useState(existing?.status ?? "");
  // À la création, le produit de rattachement est obligatoire côté backend ;
  // à l'édition il est verrouillé (le hook rejoue celui déjà en base).
  const [productId, setProductId] = useState(existing?.productId ?? "");

  const canSubmit = (isEdit || !!productId) && (!!firstName.trim() || !!lastName.trim());

  const submit = async () => {
    if (!canSubmit) return;
    // Chaînes envoyées telles quelles (y compris vides) : côté mise à jour, une
    // chaîne vide vaut suppression du champ, une clé absente vaut « inchangé ».
    const ok = await onSave({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone,
      city: city.trim(),
      country: country.trim(),
      status,
      productId: isEdit ? undefined : productId,
    });
    if (ok) onSaved();
  };

  // Le pied du panneau porte le bouton d'enregistrement : on lui remonte le
  // déclencheur après rendu, pour qu'il suive l'état du formulaire (le faire
  // pendant le rendu serait un effet de bord au mauvais moment).
  useEffect(() => {
    onHandle({ submit, canSubmit });
    // `submit` se referme sur l'état courant : la dépendance est donc l'état,
    // pas la fonction, qui change à chaque rendu.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canSubmit, firstName, lastName, email, city, country, status, productId]);

  // Un contact peut déjà porter un statut hors de la liste de référence : on le
  // garde comme option pour ne pas l'effacer à l'enregistrement.
  const statusOptions = (
    status && !statuses.includes(status) ? [...statuses, status] : statuses
  ).map((s) => ({ value: s, label: statusLabel(s) }));

  return (
    <View style={styles.form}>
      {!isEdit ? (
        <Group icon={Package}>
          <SelectField
            label="Produit *"
            placeholder="Choisir un produit…"
            options={products.map((p) => ({ value: p.id, label: p.name || p.id }))}
            value={productId}
            onChange={setProductId}
          />
        </Group>
      ) : null}

      <Group icon={User}>
        <Field
          label="Prénom *"
          value={firstName}
          onChangeText={setFirstName}
          placeholder="ex: Jean"
        />
        <Field label="Nom *" value={lastName} onChangeText={setLastName} placeholder="ex: Dupont" />
      </Group>

      <Group icon={Phone}>
        <Field label="Téléphone *" value={phone} editable={false} keyboardType="phone-pad" />
      </Group>

      <Group icon={Mail}>
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="jean.dupont@email.com"
          keyboardType="email-address"
        />
      </Group>

      <Group icon={MapPin}>
        <Field label="Ville" value={city} onChangeText={setCity} placeholder="Douala" />
        <Field label="Pays" value={country} onChangeText={setCountry} placeholder="Cameroun" />
      </Group>

      <Group icon={ShieldCheck}>
        <SelectField
          label="Statut du compte"
          placeholder="Non renseigné"
          options={statusOptions}
          value={status}
          onChange={(s) => setStatus((current) => (current === s ? "" : s))}
        />
      </Group>

      {!isEdit && products.length === 0 ? (
        <Text style={styles.hint}>
          Aucun produit disponible : un contact doit être rattaché à un produit.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  form: { backgroundColor: colors.white, paddingBottom: 16 },
  // `flex gap-4 px-4 py-3` côté web.
  group: { flexDirection: "row", gap: 16, paddingHorizontal: 16, paddingVertical: 12 },
  // `mt-6` : l'icône s'aligne sur le champ, pas sur son libellé.
  gutter: { marginTop: 24 },
  groupFields: { flex: 1, minWidth: 0, gap: 20 },
  label: { fontSize: 11, color: colors.muted },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 6,
    fontSize: 15,
    color: colors.text,
  },
  inputDisabled: { color: colors.muted },
  select: { flexDirection: "row", alignItems: "center", gap: 8 },
  selectText: { flex: 1, fontSize: 15, color: colors.text },
  selectPlaceholder: { color: colors.muted },
  menu: {
    marginTop: 6,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingVertical: 4,
  },
  menuEmpty: { paddingHorizontal: 12, paddingVertical: 8, fontSize: 13, color: colors.muted },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  menuText: { flex: 1, fontSize: 14, color: colors.text },
  menuTextActive: { fontWeight: "500" },
  hint: { paddingHorizontal: 16, fontSize: 12, color: colors.muted, lineHeight: 17 },
});
