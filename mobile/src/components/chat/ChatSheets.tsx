import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { RadioList } from "@/components/shared/RadioList";
import { Sheet, SheetOption, SheetSeparator } from "@/components/shared/Sheet";
import type { MessageViewModel } from "@/hooks/useChatViewModel";
import { useSendTemplateToClient, useTemplates } from "@/hooks/useWhatsapp";
import { toast } from "@/lib/toast";
import {
  fmtTimeFull,
  type Conversation,
  type ConversationStatus,
  type Message,
  type User,
} from "@/models/whatsapp.models";
import { colors, radius, STATUS_LABELS } from "@/theme";

// ─── Actions de la conversation ───────────────────────────────────────────────

interface ChatMenuSheetProps {
  open: boolean;
  onClose: () => void;
  onSearch: () => void;
  onStatus: () => void;
  onAssign: () => void;
  onDetails: () => void;
  onTemplate: () => void;
  onFlow: () => void;
  onContact: () => void;
  onChannelStatus: () => void;
  /** Un contact CRM existe déjà pour ce numéro → « éditer » plutôt qu'« ajouter ». */
  hasContact: boolean;
  contactLoading: boolean;
}

export function ChatMenuSheet({
  open,
  onClose,
  onSearch,
  onStatus,
  onAssign,
  onDetails,
  onTemplate,
  onFlow,
  onContact,
  onChannelStatus,
  hasContact,
  contactLoading,
}: ChatMenuSheetProps) {
  const run = (fn: () => void) => () => {
    onClose();
    fn();
  };
  return (
    <Sheet open={open} onClose={onClose} title="Discussion">
      <SheetOption icon="search-outline" label="Rechercher un message" onPress={run(onSearch)} />
      <SheetOption icon="flag-outline" label="Changer le statut" onPress={run(onStatus)} />
      <SheetOption icon="person-add-outline" label="Assigner à un agent" onPress={run(onAssign)} />
      <SheetOption
        icon={hasContact ? "create-outline" : "person-circle-outline"}
        label={hasContact ? "Éditer le contact" : "Ajouter aux contacts"}
        hint={contactLoading ? "Résolution du contact…" : undefined}
        disabled={contactLoading}
        onPress={run(onContact)}
      />
      <SheetOption
        icon="shield-checkmark-outline"
        label="Statut du canal"
        hint="Délivrabilité de ce numéro"
        onPress={run(onChannelStatus)}
      />
      <SheetSeparator />
      <SheetOption icon="document-text-outline" label="Envoyer un template" onPress={run(onTemplate)} />
      <SheetOption icon="flash-outline" label="Envoyer un flow" onPress={run(onFlow)} />
      <SheetSeparator />
      <SheetOption icon="information-circle-outline" label="Détails de la conversation" onPress={run(onDetails)} />
    </Sheet>
  );
}

const STATUSES: ConversationStatus[] = ["OPEN", "PENDING", "RESOLVED", "CLOSED"];

export function StatusSheet({
  open,
  current,
  onClose,
  onSelect,
}: {
  open: boolean;
  current: string;
  onClose: () => void;
  onSelect: (status: ConversationStatus) => void;
}) {
  return (
    <Sheet open={open} onClose={onClose} title="Statut de la conversation">
      {STATUSES.map((s) => (
        <SheetOption
          key={s}
          label={STATUS_LABELS[s]}
          selected={current === s}
          onPress={() => {
            onClose();
            if (current !== s) onSelect(s);
          }}
        />
      ))}
    </Sheet>
  );
}

/**
 * Statut de délivrabilité du canal — vocabulaire fourni par le backend
 * (`/api/ContactChannel/statuses`), donc affiché tel quel.
 */
export function ChannelStatusSheet({
  open,
  statuses,
  onClose,
  onSelect,
}: {
  open: boolean;
  statuses: string[];
  onClose: () => void;
  onSelect: (status: string) => void;
}) {
  return (
    <Sheet open={open} onClose={onClose} title="Statut du canal" scroll>
      {statuses.length === 0 ? (
        <Text style={styles.emptyHint}>Aucun statut disponible.</Text>
      ) : (
        statuses.map((s) => (
          <SheetOption
            key={s}
            label={s}
            onPress={() => {
              onClose();
              onSelect(s);
            }}
          />
        ))
      )}
    </Sheet>
  );
}

export function AssignSheet({
  open,
  users,
  currentUserId,
  onClose,
  onSelect,
}: {
  open: boolean;
  users: User[];
  currentUserId: string;
  onClose: () => void;
  onSelect: (userId: string) => void;
}) {
  return (
    <Sheet open={open} onClose={onClose} title="Assigner à" scroll>
      {users.length === 0 ? (
        <Text style={styles.emptyHint}>Aucun agent disponible.</Text>
      ) : (
        users.map((u) => (
          <SheetOption
            key={u.id}
            icon="person-circle-outline"
            label={`${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email || u.id}
            hint={u.email ?? undefined}
            selected={currentUserId === u.id}
            onPress={() => {
              onClose();
              onSelect(u.id);
            }}
          />
        ))
      )}
    </Sheet>
  );
}

// ─── Détails ──────────────────────────────────────────────────────────────────

function DetailRows({ rows }: { rows: [string, string | null | undefined][] }) {
  return (
    <View style={styles.details}>
      {rows.map(([label, value]) => (
        <View key={label} style={styles.detailRow}>
          <Text style={styles.detailLabel}>{label}</Text>
          <Text style={styles.detailValue}>{value || "N/A"}</Text>
        </View>
      ))}
    </View>
  );
}

export function ConversationDetailsSheet({
  open,
  conv,
  onClose,
}: {
  open: boolean;
  conv: Conversation | null;
  onClose: () => void;
}) {
  return (
    <Sheet open={open} onClose={onClose} title="Détails de la conversation" scroll>
      {conv ? (
        <DetailRows
          rows={[
            ["ID", conv.id],
            ["Contact", conv.contactAddress],
            ["Statut", conv.status],
            ["Canal", `${conv.channelName || ""} (${conv.channelCode || ""})`],
            ["Expéditeur", `${conv.senderName || ""} (${conv.senderAddress || ""})`],
            ["Créée le", fmtTimeFull(conv.createdAt || conv.lastMessageAt)],
            [
              "Assignée à",
              conv.assignedToUserFirstName
                ? `${conv.assignedToUserFirstName} ${conv.assignedToUserLastName || ""}`.trim()
                : "Non assignée",
            ],
          ]}
        />
      ) : null}
    </Sheet>
  );
}

export function MessageDetailsSheet({
  open,
  msg,
  onClose,
}: {
  open: boolean;
  msg: Message | null;
  onClose: () => void;
}) {
  return (
    <Sheet open={open} onClose={onClose} title="Détails du message" scroll>
      {msg ? (
        <DetailRows
          rows={[
            ["ID externe", msg.externalMessageId],
            ["Statut", msg.status],
            ["Direction", msg.direction],
            ["Type", msg.messageType],
            ["Création", fmtTimeFull(msg.createdAt)],
            ["Envoi", fmtTimeFull(msg.sentAt)],
            ["Distribution", fmtTimeFull(msg.deliveredAt)],
            ["Lecture", fmtTimeFull(msg.readAt)],
            ["Envoyé par", msg.sentByName || "Système"],
          ]}
        />
      ) : null}
    </Sheet>
  );
}

// ─── Actions sur un message (appui long) ──────────────────────────────────────

export function MessageActionsSheet({
  vm,
  onClose,
  onReply,
  onDetails,
}: {
  vm: MessageViewModel | null;
  onClose: () => void;
  onReply: (vm: MessageViewModel) => void;
  onDetails: (id: string) => void;
}) {
  return (
    <Sheet open={!!vm} onClose={onClose} title="Message">
      <SheetOption
        icon="arrow-undo-outline"
        label="Répondre"
        onPress={() => {
          if (!vm) return;
          onClose();
          onReply(vm);
        }}
      />
      <SheetOption
        icon="copy-outline"
        label="Copier le texte"
        disabled={!vm?.content}
        onPress={async () => {
          if (!vm?.content) return;
          onClose();
          await Clipboard.setStringAsync(vm.content);
          toast.success("Texte copié", 1400);
        }}
      />
      <SheetOption
        icon="information-circle-outline"
        label="Détails"
        onPress={() => {
          if (!vm) return;
          const id = vm.id;
          onClose();
          onDetails(id);
        }}
      />
    </Sheet>
  );
}

// ─── Envoi d'un template ──────────────────────────────────────────────────────

interface TemplateSheetProps {
  open: boolean;
  onClose: () => void;
  /** Contact CRM résolu depuis le numéro de la conversation. */
  clientId: string | null;
  clientLoading: boolean;
  contactAddress: string;
  /** Ouvre le formulaire de contact quand le numéro n'est lié à aucun client. */
  onCreateContact: () => void;
}

/**
 * Envoi d'un template approuvé au contact de la discussion
 * (POST /api/WhatsApp/send/template/client). L'endpoint adresse un **client**
 * CRM : sans contact résolu pour ce numéro, l'envoi est impossible.
 */
export function TemplateSheet({
  open,
  onClose,
  clientId,
  clientLoading,
  contactAddress,
  onCreateContact,
}: TemplateSheetProps) {
  const [templateId, setTemplateId] = useState("");
  const templatesQ = useTemplates(open);
  const sendTemplate = useSendTemplateToClient();

  const templates = (templatesQ.data ?? []).filter((t) => !!t.id);

  const submit = () => {
    if (!templateId || !clientId) return;
    sendTemplate.mutate(
      { templateId, clientId },
      {
        onSuccess: () => {
          setTemplateId("");
          onClose();
        },
      },
    );
  };

  return (
    <Sheet open={open} onClose={onClose} title="Envoyer un template">
      <View style={styles.form}>
        <Text style={styles.formHint}>Destinataire : {contactAddress || "—"}</Text>

        {clientLoading ? (
          <ActivityIndicator color={colors.teal} style={styles.loader} />
        ) : !clientId ? (
          <View style={styles.warning}>
            <Ionicons name="alert-circle-outline" size={18} color="#d97706" />
            <View style={styles.warningBody}>
              <Text style={styles.warningText}>
                Aucun contact CRM lié à ce numéro. L'envoi de template adresse un client :
                ajoutez-le d'abord.
              </Text>
              <Pressable
                onPress={() => {
                  onClose();
                  onCreateContact();
                }}
              >
                <Text style={styles.warningAction}>Ajouter aux contacts</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        <RadioList
          items={templates.map((t) => ({
            id: t.id!,
            label: t.name || t.id!,
            hint: t.status,
          }))}
          selected={templateId}
          onSelect={setTemplateId}
          isLoading={templatesQ.isLoading}
          emptyLabel="Aucun template disponible."
        />

        <Pressable
          onPress={submit}
          disabled={!templateId || !clientId || sendTemplate.isPending}
          style={[
            styles.primaryButton,
            (!templateId || !clientId || sendTemplate.isPending) && styles.primaryButtonDisabled,
          ]}
        >
          {sendTemplate.isPending ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.primaryButtonText}>Envoyer</Text>
          )}
        </Pressable>
      </View>
    </Sheet>
  );
}

// ─── Envoi d'un flow ──────────────────────────────────────────────────────────

export function FlowSheet({
  open,
  onClose,
  onSubmit,
  isSending,
  contactAddress,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (flowToken: string) => void;
  isSending: boolean;
  contactAddress: string;
}) {
  const [token, setToken] = useState("");

  return (
    <Sheet open={open} onClose={onClose} title="Envoyer un flow">
      <View style={styles.form}>
        <Text style={styles.formHint}>Destinataire : {contactAddress || "—"}</Text>
        <TextInput
          value={token}
          onChangeText={setToken}
          placeholder="Token du flow"
          placeholderTextColor={colors.muted}
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Pressable
          onPress={() => {
            const value = token.trim();
            if (!value) return;
            setToken("");
            onSubmit(value);
          }}
          disabled={!token.trim() || isSending}
          style={[
            styles.primaryButton,
            (!token.trim() || isSending) && styles.primaryButtonDisabled,
          ]}
        >
          {isSending ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.primaryButtonText}>Envoyer</Text>
          )}
        </Pressable>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  details: { paddingHorizontal: 18, paddingBottom: 8, gap: 10 },
  detailRow: { flexDirection: "row", gap: 10 },
  detailLabel: { width: 118, fontSize: 13, fontWeight: "600", color: colors.text },
  detailValue: { flex: 1, fontSize: 13, color: colors.muted },
  emptyHint: { paddingHorizontal: 18, paddingVertical: 14, fontSize: 13, color: colors.muted },
  form: { paddingHorizontal: 18, paddingTop: 4, gap: 12 },
  formHint: { fontSize: 12.5, color: colors.muted },
  loader: { marginVertical: 12 },
  warning: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#fef3c7",
    borderRadius: radius.md,
    padding: 10,
  },
  warningBody: { flex: 1, gap: 6 },
  warningText: { fontSize: 12.5, color: "#92400e", lineHeight: 17 },
  warningAction: { fontSize: 13, fontWeight: "700", color: "#92400e" },
  input: {
    height: 46,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    fontSize: 15,
    color: colors.text,
  },
  primaryButton: {
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.greenSend,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonDisabled: { opacity: 0.45 },
  primaryButtonText: { color: colors.white, fontSize: 15, fontWeight: "600" },
});
