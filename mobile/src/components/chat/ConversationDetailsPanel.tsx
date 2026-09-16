import { Ban, Check, CheckCircle2, ChevronDown, ChevronRight, ChevronUp, Images, LayoutTemplate, Link2, Pencil, Search, ShieldCheck, UserCheck, UserCog, UserPlus, Zap, type LucideIcon } from "lucide-react-native";
import * as Clipboard from "expo-clipboard";
import { useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import type { ClientBody, ClientSearchResult, Option } from "@/api/endpoints";
import { Avatar } from "@/components/shared/Avatar";
import { StatusPill } from "@/components/shared/Badges";
import { Sheet } from "@/components/shared/Sheet";
import type { GalleryItem } from "@/hooks/useChatViewModel";
import { toast } from "@/lib/toast";
import {
  fmtTimeFull,
  type Conversation,
  type ConversationStatus,
  type User,
} from "@/models/whatsapp.models";
import { statusLabel } from "@/lib/labels";
import { colors, radius, STATUS_LABELS } from "@/theme";
import { ContactEditView, type ContactEditHandle } from "./ContactEditView";
import { MediaGalleryView } from "./MediaGalleryView";

/**
 * La surface « Infos du contact » de WhatsApp — tiroir sur desktop, feuille en
 * bas sur mobile. Portage de `ConversationDetailsPanel` du web, avec ses trois
 * vues : infos, galerie, édition du contact.
 *
 * Les réglages se changent **sur place** (la ligne se déplie sous elle-même)
 * plutôt que d'ouvrir une seconde modale par-dessus la feuille.
 */

type PanelView = "info" | "gallery" | "contact";

const STATUS_ORDER: ConversationStatus[] = ["OPEN", "PENDING", "RESOLVED", "CLOSED"];

/** `plan_tarifaire` → `Plan tarifaire`, pour les clés d'attribut sans libellé. */
function humanise(key: string): string {
  const words = key
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** `customData` arrive en chaîne JSON ; une chaîne malformée ne doit pas lever. */
function parseCustomData(raw: unknown): [string, string][] {
  if (!raw) return [];
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!parsed || typeof parsed !== "object") return [];
    return Object.entries(parsed as Record<string, unknown>)
      .map(([k, v]) => [k, v == null ? "" : String(v)] as [string, string])
      .filter(([, v]) => v.trim() !== "");
  } catch {
    return [];
  }
}

// ─── Briques ──────────────────────────────────────────────────────────────────

function Band() {
  return <View style={styles.band} />;
}

function Fact({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <View style={styles.fact}>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factValue}>{value || "—"}</Text>
    </View>
  );
}

function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

/** Raccourci circulaire sous l'identité — la rangée Voix / Vidéo de WhatsApp. */
function QuickAction({
  icon: Icon,
  label,
  onPress,
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.quickAction} onPress={onPress} accessibilityLabel={label}>
      <View style={styles.quickIcon}>
        <Icon size={20} color={colors.teal} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
    </Pressable>
  );
}

/** Réglage changé sur place : la ligne se déplie sous elle-même. */
function SelectRow({
  icon: Icon,
  label,
  display,
  options,
  value,
  onChange,
}: {
  icon: LucideIcon;
  label: string;
  display: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View>
      <Pressable
        accessibilityLabel={`Changer : ${label}`}
        style={styles.selectRow}
        onPress={() => setOpen((v) => !v)}
      >
        <Icon size={17} color={colors.icon} />
        <View style={styles.selectLabels}>
          <Text style={styles.selectLabel}>{label}</Text>
          <Text style={styles.selectValue} numberOfLines={1}>
            {display}
          </Text>
        </View>
        {open ? (
          <ChevronUp size={16} color={colors.icon} />
        ) : (
          <ChevronDown size={16} color={colors.icon} />
        )}
      </Pressable>
      {open ? (
        <View style={styles.selectOptions}>
          {options.length === 0 ? (
            <Text style={styles.selectEmpty}>Aucune valeur disponible.</Text>
          ) : (
            options.map((o) => (
              <Pressable
                key={o.value}
                style={styles.selectOption}
                onPress={() => {
                  setOpen(false);
                  if (o.value !== value) onChange(o.value);
                }}
              >
                <Text style={styles.selectOptionText}>{o.label}</Text>
                {o.value === value ? <Check size={15} color={colors.teal} /> : null}
              </Pressable>
            ))
          )}
        </View>
      ) : null}
    </View>
  );
}

function ActionRow({
  icon: Icon,
  label,
  onPress,
  destructive,
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <Pressable style={styles.actionRow} onPress={onPress}>
      <Icon size={19} color={destructive ? colors.danger : colors.icon} />
      <Text style={[styles.actionLabel, destructive && { color: colors.danger }]}>{label}</Text>
    </Pressable>
  );
}

// ─── Panneau ──────────────────────────────────────────────────────────────────

interface ConversationDetailsPanelProps {
  open: boolean;
  onClose: () => void;
  /** Vue d'entrée — le menu de discussion ouvre directement l'édition contact. */
  initialView?: "info" | "gallery" | "contact";
  conv: Conversation;
  initials: string;
  avatarBg: string;
  /** Contact CRM résolu depuis le numéro. */
  client: ClientSearchResult | null;
  clientLoading: boolean;
  clientStatuses: string[];
  channelStatuses: string[];
  products: Option[];
  isSavingContact: boolean;
  users: User[];
  galleryItems: GalleryItem[];
  hasOlder: boolean;
  isLoadingOlder: boolean;
  onLoadOlder: () => void;
  onOpenMedia: (type: "image" | "video", url: string, caption?: string) => void;
  onStatusChange: (status: ConversationStatus) => void;
  onAssign: (userId: string) => void;
  onClientStatusChange: (status: string) => void;
  onChannelStatusChange: (status: string) => void;
  onSaveContact: (body: ClientBody) => Promise<boolean>;
  onSearch: () => void;
  onSendTemplate: () => void;
  onSendFlow: () => void;
}

export function ConversationDetailsPanel({
  open,
  onClose,
  initialView = "info",
  conv,
  initials,
  avatarBg,
  client,
  clientLoading,
  clientStatuses,
  channelStatuses,
  products,
  isSavingContact,
  users,
  galleryItems,
  hasOlder,
  isLoadingOlder,
  onLoadOlder,
  onOpenMedia,
  onStatusChange,
  onAssign,
  onClientStatusChange,
  onChannelStatusChange,
  onSaveContact,
  onSearch,
  onSendTemplate,
  onSendFlow,
}: ConversationDetailsPanelProps) {
  const [view, setView] = useState<PanelView>(initialView);
  const [copied, setCopied] = useState(false);
  const contactHandle = useRef<ContactEditHandle | null>(null);
  const [canSaveContact, setCanSaveContact] = useState(false);

  const phone = conv.contactAddress ?? "";
  const status = (conv.status || "OPEN").toUpperCase();
  const hasContact = !!client;
  const clientName = client
    ? `${client.firstName ?? ""} ${client.lastName ?? ""}`.trim()
    : "";
  const title =
    view === "gallery"
      ? "Médias et documents"
      : view === "contact"
        ? hasContact
          ? "Éditer le contact"
          : "Ajouter aux contacts"
        : clientName || phone || "Infos";

  const assignedName = conv.assignedToUserFirstName
    ? `${conv.assignedToUserFirstName} ${conv.assignedToUserLastName || ""}`.trim()
    : "Non assignée";

  const copyLink = async () => {
    // Le web copie son URL courante avec `?c=<id>`. Une app mobile n'a pas
    // d'URL : on reconstruit celle du portail quand son origine est connue,
    // sinon on copie l'identifiant, qui reste exploitable en support.
    const webUrl = (process.env.EXPO_PUBLIC_WEB_URL ?? "").replace(/\/+$/, "");
    const link = webUrl ? `${webUrl}/wa?c=${conv.id}` : conv.id;
    await Clipboard.setStringAsync(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
    toast.success(webUrl ? "Lien de la discussion copié" : "Identifiant de la discussion copié");
  };

  const closeSubView = () => setView("info");

  return (
    <Sheet
      open={open}
      onClose={() => {
        setView("info");
        onClose();
      }}
      title={title}
      tall
      scroll
      onBack={view === "info" ? undefined : closeSubView}
      headerAction={
        <Pressable
          accessibilityLabel={hasContact ? "Éditer le contact" : "Ajouter aux contacts"}
          disabled={clientLoading}
          onPress={() => setView("contact")}
          style={[styles.headerAction, clientLoading && styles.headerActionDisabled]}
        >
          {hasContact ? (
            <Pencil size={19} color={colors.icon} />
          ) : (
            <UserPlus size={19} color={colors.icon} />
          )}
        </Pressable>
      }
      footer={
        view === "contact" ? (
          <View style={styles.footer}>
            <Pressable
              accessibilityLabel="Enregistrer le contact"
              disabled={!canSaveContact || isSavingContact}
              onPress={() => contactHandle.current?.submit()}
              style={[
                styles.saveButton,
                (!canSaveContact || isSavingContact) && styles.saveButtonDisabled,
              ]}
            >
              {isSavingContact ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Check size={22} color={colors.white} />
              )}
            </Pressable>
          </View>
        ) : undefined
      }
    >
      {view === "gallery" ? (
        <MediaGalleryView
          items={galleryItems}
          hasOlder={hasOlder}
          isLoadingOlder={isLoadingOlder}
          onLoadOlder={onLoadOlder}
          onOpen={onOpenMedia}
        />
      ) : view === "contact" ? (
        <ContactEditView
          phone={phone}
          suggestedName={conv.contactName}
          existing={client}
          products={products}
          statuses={clientStatuses}
          onSave={onSaveContact}
          onSaved={closeSubView}
          onHandle={(h) => {
            contactHandle.current = h;
            setCanSaveContact(h.canSubmit);
          }}
        />
      ) : (
        <>
          {/* Identité */}
          <View style={styles.hero}>
            <Avatar initials={initials} background={avatarBg} size="xl" />
            <Text style={styles.heroName}>{clientName || phone}</Text>
            {clientName && phone ? <Text style={styles.heroPhone}>{phone}</Text> : null}
            <StatusPill status={status} />
          </View>

          {/* Raccourcis */}
          <View style={styles.quickActions}>
            <QuickAction icon={Search} label="Rechercher" onPress={onSearch} />
            <QuickAction icon={LayoutTemplate} label="Template" onPress={onSendTemplate} />
            <QuickAction icon={Zap} label="Flow" onPress={onSendFlow} />
            <QuickAction
              icon={hasContact ? Pencil : UserPlus}
              label={hasContact ? "Éditer" : "Ajouter"}
              onPress={() => setView("contact")}
            />
          </View>

          <Band />

          <Pressable style={styles.mediaRow} onPress={() => setView("gallery")}>
            <Images size={19} color={colors.icon} />
            <Text style={styles.mediaLabel}>Médias et documents</Text>
            <Text style={styles.mediaCount}>{galleryItems.length || ""}</Text>
            <ChevronRight size={17} color={colors.icon} />
          </Pressable>

          <Band />

          {/* Réglages */}
          <View style={styles.selectGroup}>
            <SelectRow
              icon={CheckCircle2}
              label="Statut de la conversation"
              display={STATUS_LABELS[status] ?? status}
              value={status}
              options={STATUS_ORDER.map((s) => ({ value: s, label: STATUS_LABELS[s] }))}
              onChange={(v) => onStatusChange(v as ConversationStatus)}
            />
            <SelectRow
              icon={UserCheck}
              label="Assignée à"
              display={assignedName}
              value={conv.assignedToUserId ?? ""}
              options={users.map((u) => ({
                value: u.id,
                label: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email || u.id,
              }))}
              onChange={onAssign}
            />
            {hasContact ? (
              <SelectRow
                icon={UserCog}
                label="Statut du client"
                display={client?.status ? statusLabel(client.status.toLowerCase()) : "Aucun"}
                value={client?.status ?? ""}
                options={clientStatuses.map((s) => ({
                  value: s,
                  label: statusLabel(s.toLowerCase()),
                }))}
                onChange={onClientStatusChange}
              />
            ) : null}
            <SelectRow
              icon={ShieldCheck}
              label="Statut du numéro"
              display="Délivrabilité"
              value=""
              options={channelStatuses.map((s) => ({
                value: s,
                label: statusLabel(s.toLowerCase()),
              }))}
              onChange={onChannelStatusChange}
            />
          </View>

          <Band />

          {/* Actions */}
          <View style={styles.actionGroup}>
            <ActionRow
              icon={copied ? Check : Link2}
              label={copied ? "Lien copié" : "Copier le lien de la discussion"}
              onPress={copyLink}
            />
            {status !== "CLOSED" ? (
              <ActionRow
                icon={Ban}
                label="Fermer la discussion"
                destructive
                onPress={() => onStatusChange("CLOSED")}
              />
            ) : null}
          </View>

          <Band />

          {/* Fiche CRM */}
          {hasContact ? (
            <View style={styles.section}>
              <SectionTitle>Contact</SectionTitle>
              <View style={styles.factList}>
                <Fact label="Prénom" value={client?.firstName} />
                <Fact label="Nom" value={client?.lastName} />
                <Fact label="E-mail" value={client?.email} />
                <Fact label="Téléphone" value={client?.phone ?? phone} />
                <Fact
                  label="Statut"
                  value={client?.status ? statusLabel(client.status.toLowerCase()) : null}
                />
                <Fact label="Ville" value={client?.city} />
                <Fact label="Pays" value={client?.country} />
                <Fact label="Langue" value={client?.language} />
              </View>

              {parseCustomData(client?.customData).length > 0 ? (
                <>
                  <SectionTitle>Attributs</SectionTitle>
                  <View style={styles.factList}>
                    {parseCustomData(client?.customData).map(([key, value]) => (
                      <Fact key={key} label={humanise(key)} value={value} />
                    ))}
                  </View>
                </>
              ) : null}
            </View>
          ) : (
            <View style={styles.section}>
              <Text style={styles.noContact}>
                {clientLoading
                  ? "Résolution du contact…"
                  : "Ce numéro n'est lié à aucun contact CRM."}
              </Text>
            </View>
          )}

          <Band />

          {/* Conversation */}
          <View style={styles.section}>
            <SectionTitle>Discussion</SectionTitle>
            <View style={styles.factList}>
              <Fact
                label="Canal"
                value={`${conv.channelName || ""} ${conv.channelCode ? `(${conv.channelCode})` : ""}`.trim()}
              />
              <Fact
                label="Expéditeur"
                value={`${conv.senderName || ""} ${conv.senderAddress ? `(${conv.senderAddress})` : ""}`.trim()}
              />
              <Fact label="Créée le" value={fmtTimeFull(conv.createdAt)} />
              <Fact label="Dernière activité" value={fmtTimeFull(conv.lastMessageAt)} />
              <Fact label="Identifiant" value={conv.id} />
            </View>
          </View>
        </>
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  band: { height: 8, backgroundColor: colors.hover },
  headerAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerActionDisabled: { opacity: 0.5 },
  hero: {
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: colors.white,
  },
  heroName: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: "500",
    color: colors.text,
    textAlign: "center",
  },
  heroPhone: { fontSize: 14, color: colors.muted },
  quickActions: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 20,
    backgroundColor: colors.white,
  },
  quickAction: {
    minWidth: 64,
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
    borderRadius: radius.md,
  },
  quickIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.inputBg,
    alignItems: "center",
    justifyContent: "center",
  },
  quickLabel: { fontSize: 11, color: colors.muted },
  mediaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.white,
  },
  mediaLabel: { flex: 1, fontSize: 14, color: colors.text },
  mediaCount: { fontSize: 14, color: colors.muted },
  selectGroup: { paddingVertical: 4, backgroundColor: colors.white },
  selectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  selectLabels: { flex: 1, minWidth: 0 },
  selectLabel: { fontSize: 11, color: colors.muted },
  selectValue: { fontSize: 14, color: colors.text },
  selectOptions: { paddingBottom: 4, backgroundColor: colors.hover },
  selectOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 48,
    paddingVertical: 11,
  },
  selectOptionText: { fontSize: 14, color: colors.text },
  selectEmpty: { paddingHorizontal: 48, paddingVertical: 11, fontSize: 13, color: colors.muted },
  actionGroup: { backgroundColor: colors.white },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  actionLabel: { flex: 1, fontSize: 14, color: colors.text },
  section: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: colors.white },
  sectionTitle: {
    paddingTop: 8,
    paddingBottom: 4,
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: colors.muted,
  },
  factList: { paddingBottom: 8 },
  fact: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  factLabel: { fontSize: 12, color: colors.muted },
  factValue: { flex: 1, fontSize: 14, color: colors.text, textAlign: "right" },
  noContact: { paddingVertical: 12, fontSize: 13, color: colors.muted },
  footer: { alignItems: "center" },
  saveButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.greenSend,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  saveButtonDisabled: { opacity: 0.6 },
});
