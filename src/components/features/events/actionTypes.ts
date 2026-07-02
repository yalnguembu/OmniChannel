import type { EntitySource } from "./EntitySelect";

export type ActionFieldType = "text" | "area" | "bool" | "select" | "entity";

export interface ActionFieldDef {
  key: string;
  label: string;
  type: ActionFieldType;
  placeholder?: string;
  required?: boolean;
  optional?: boolean;
  default?: unknown;
  options?: string[];
  /** For type "entity": which dropdown endpoint feeds the Select. */
  source?: EntitySource;
}

export interface ActionTypeDef {
  label: string;
  help?: string;
  fields: ActionFieldDef[];
}

/** Mirrors the backend's TriggerAction catalog (type → configJson shape). */
export const ACTION_TYPES: Record<string, ActionTypeDef> = {
  UpdateClientData: {
    label: "Mettre à jour le client",
    help: "Applique le payload comme client à plat (fusion partielle, clés inconnues ignorées).",
    fields: [
      { key: "validate", label: "Valider contre le schéma", type: "bool", default: true },
    ],
  },
  ChangeStatus: {
    label: "Changer le statut",
    fields: [
      { key: "status", label: "Nouveau statut", type: "text", placeholder: "OPTED_OUT", required: true },
    ],
  },
  SendText: {
    label: "Envoyer un texte",
    help: "Placeholders {{payload.x}} / {{capture.x}}.",
    fields: [
      { key: "text", label: "Texte", type: "area", placeholder: "Merci, c'est noté.", required: true },
    ],
  },
  SendTemplate: {
    label: "Envoyer un template",
    fields: [
      { key: "templateName", label: "Template", type: "entity", source: "template", required: true },
      { key: "senderId", label: "Sender (optionnel)", type: "entity", source: "sender", optional: true },
    ],
  },
  SendFlow: {
    label: "Envoyer un flow",
    fields: [
      { key: "flowId", label: "Flow (registre)", type: "entity", source: "flow", required: true },
      { key: "flowTokenFrom", label: "Token depuis", type: "text", placeholder: "capture.numdec", optional: true },
    ],
  },
  TransferToHuman: {
    label: "Transférer à un humain",
    fields: [
      { key: "assignStrategy", label: "Stratégie", type: "select", options: ["first_active", "specific"] },
      { key: "userId", label: "Utilisateur (si specific)", type: "entity", source: "user", optional: true },
      { key: "reason", label: "Raison", type: "text", optional: true },
    ],
  },
  AddTag: {
    label: "Ajouter un tag",
    fields: [{ key: "tag", label: "Tag", type: "text", placeholder: "reabo_relance", required: true }],
  },
  RemoveTag: {
    label: "Retirer un tag",
    fields: [{ key: "tag", label: "Tag", type: "text", required: true }],
  },
  AddToSegment: {
    label: "Ajouter à un segment",
    fields: [{ key: "segmentId", label: "Segment", type: "entity", source: "segment", required: true }],
  },
  RemoveFromSegment: {
    label: "Retirer d'un segment",
    fields: [{ key: "segmentId", label: "Segment", type: "entity", source: "segment", required: true }],
  },
  AskAi: {
    label: "Réponse IA (dernier recours)",
    help: "Lit la SenderReplyConfig (toggle IA + prompt). Soumis aux gardes d'annulation.",
    fields: [],
  },
  MarkAsRead: {
    label: "Marquer comme lu (interne)",
    help: "Remet Conversation.UnreadCount à 0 de notre côté. Aucune réponse ni accusé de lecture WhatsApp. (événement interne)",
    fields: [],
  },
};

export function actionTypeLabel(type?: string | null): string {
  if (!type) return "—";
  return ACTION_TYPES[type]?.label ?? type;
}

export function defaultConfigFor(type: string): Record<string, unknown> {
  const cfg: Record<string, unknown> = {};
  ACTION_TYPES[type]?.fields.forEach((f) => {
    if (f.default !== undefined) cfg[f.key] = f.default;
    // Seed select fields with their first option so the value actually saved
    // matches what the <select> displays by default (a native select shows
    // its first option even when the bound value is empty).
    else if (f.type === "select" && f.options?.length) cfg[f.key] = f.options[0];
  });
  return cfg;
}
