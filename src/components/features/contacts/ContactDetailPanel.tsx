import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Edit2, Trash2, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { avatarColor, getInitials, statusLabel } from "@/lib/utils";
import type { ClientModel } from "@/models/client.model";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getApiClientFlatDetailedByIdOptions,
  postApiClientChannelPreferenceSearchOptions,
  postApiClientSegmentMemberSearchOptions,
  postApiMessageSearchOptions,
  postApiClientSegmentSearchOptions,
  postApiClientSegmentMemberMutation,
  deleteApiClientSegmentMemberByIdMutation,
  postApiChannelSearchOptions,
  postApiClientChannelPreferenceMutation,
  putApiClientChannelPreferenceMutation,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import type { ClientAttributeDetail } from "@/shared/api/generated/types.gen";
import { formatRelative } from "@/lib/date";
import { MessageSquare, Mail, Smartphone, Bell, Users } from "lucide-react";
import { toast } from "sonner";
import {
  useContactChannelStatuses,
  useChangeContactChannelStatus,
} from "@/hooks/useContactChannel";

interface ContactDetailPanelProps {
  contact: ClientModel | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onClose: () => void;
  onEdit: (contact: ClientModel) => void;
  onDelete: (id: string) => void;
  /** Backend client-status vocabulary (GET /api/Client/statuses). */
  statusOptions?: string[];
  /** Change a client's status (PATCH /api/Client/status/{id}). */
  onChangeStatus?: (id: string, status: string) => void;
}

export function ContactDetailPanel({
  contact,
  activeTab,
  onTabChange,
  onClose,
  onEdit,
  onDelete,
  statusOptions = [],
  onChangeStatus,
}: ContactDetailPanelProps) {
  // Client-status inline editor (PATCH /api/Client/status/{id}).
  const [editingStatus, setEditingStatus] = React.useState(false);

  // Contact-channel deliverability status (keyed by phone number).
  const { statuses: channelStatuses } = useContactChannelStatuses();
  const { changeStatus: changeChannelStatus, isPending: isChannelStatusPending } =
    useChangeContactChannelStatus();

  // Fetch Channels
  const channelsQuery = useQuery({
    ...postApiClientChannelPreferenceSearchOptions({
      body: { clientId: contact?.id || "", pageSize: 50, pageNumber: 1 },
    }),
    enabled: !!contact?.id,
    select: (res) => res?.data?.items || [],
  });

  // Fetch Segments
  const segmentsQuery = useQuery({
    ...postApiClientSegmentMemberSearchOptions({
      body: { clientId: contact?.id || "", pageSize: 50, pageNumber: 1 },
    }),
    enabled: !!contact?.id,
    select: (res) => res?.data?.items || [],
  });

  // Fetch Messages
  const messagesQuery = useQuery({
    ...postApiMessageSearchOptions({
      body: { clientId: contact?.id || "", pageSize: 20, pageNumber: 1 },
    }),
    enabled: !!contact?.id,
    select: (res) => res?.data?.items || [],
  });

  // Flat detailed view → product-specific custom attributes (shown in Profil).
  const flatDetailQuery = useQuery({
    ...getApiClientFlatDetailedByIdOptions({ path: { id: contact?.id || "" } }),
    enabled: !!contact?.id && activeTab === "profile",
    select: (res) => (res?.data?.attributes ?? []) as ClientAttributeDetail[],
  });
  const customAttributes = flatDetailQuery.data ?? [];

  const channels = channelsQuery.data || [];
  const segments = segmentsQuery.data || [];
  const messages = messagesQuery.data || [];

  // Fetch All Segments
  const allSegmentsQuery = useQuery({
    ...postApiClientSegmentSearchOptions({
      body: { pageSize: 100, pageNumber: 1 },
    }),
    enabled: !!contact?.id && activeTab === "segments",
    select: (res) => res?.data?.items || [],
  });
  const allSegments = allSegmentsQuery.data || [];

  // Mutations
  const addSegmentMutation = useMutation({
    ...postApiClientSegmentMemberMutation(),
    onSuccess: () => {
      segmentsQuery.refetch();
      toast.success("Segment ajouté");
    },
  });

  const removeSegmentMutation = useMutation({
    ...deleteApiClientSegmentMemberByIdMutation(),
    onSuccess: () => {
      segmentsQuery.refetch();
      toast.success("Segment retiré");
    },
  });

  const handleToggleSegment = (segmentId: string) => {
    if (!contact?.id) return;
    const existing = segments.find((s: any) => s.segmentId === segmentId);
    if (existing && existing.id) {
      removeSegmentMutation.mutate({ path: { id: existing.id } });
    } else if (!existing) {
      addSegmentMutation.mutate({
        body: { clientId: contact.id, segmentId },
      });
    }
  };

  // Fetch All Channels
  const allChannelsQuery = useQuery({
    ...postApiChannelSearchOptions({
      body: { pageSize: 100, pageNumber: 1 },
    }),
    enabled: activeTab === "channels",
    select: (res) => res?.data?.items || [],
  });
  const allChannels = allChannelsQuery.data || [];

  // Channel Mutations
  const createChannelPrefMutation = useMutation({
    ...postApiClientChannelPreferenceMutation(),
    onSuccess: () => {
      channelsQuery.refetch();
      toast.success("Préférence mise à jour");
    },
  });

  const updateChannelPrefMutation = useMutation({
    ...putApiClientChannelPreferenceMutation(),
    onSuccess: () => {
      channelsQuery.refetch();
      toast.success("Préférence mise à jour");
    },
  });

  const handleToggleChannel = (channelId: string) => {
    if (!contact?.id) return;
    const existing = channels.find((ch: any) => ch.channelId === channelId);
    if (existing) {
      updateChannelPrefMutation.mutate({
        body: {
          id: existing.id,
          clientId: contact.id,
          channelId,
          isOptedIn: !existing.isOptedIn,
        },
      });
    } else {
      createChannelPrefMutation.mutate({
        body: {
          clientId: contact.id,
          channelId,
          isOptedIn: true,
        },
      });
    }
  };

  const getChannelIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("sms")) return <Smartphone size={16} className="text-[#2E8FAD]" />;
    if (n.includes("email") || n.includes("mail")) return <Mail size={16} className="text-[#1B5E82]" />;
    if (n.includes("whatsapp")) return <MessageSquare size={16} className="text-[#25D366]" />;
    if (n.includes("push")) return <Bell size={16} className="text-[#E8541A]" />;
    return <MessageSquare size={16} className="text-[#8BAFC0]" />;
  };

  const getChannelColor = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("sms")) return "bg-[#E8F4F8]";
    if (n.includes("email") || n.includes("mail")) return "bg-[#E8F4F8]";
    if (n.includes("whatsapp")) return "bg-[#DCFCE7]";
    if (n.includes("push")) return "bg-[#FFF2EB]";
    return "bg-[#F0F2F4]";
  };

  if (!contact) return null;

  const tabs = [
    { id: "profile", label: "Profil" },
    { id: "channels", label: "Canaux" },
    { id: "messages", label: "Messages" },
    { id: "segments", label: "Segments" },
  ];

  const col = avatarColor(contact.firstName || "U");

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 bottom-0 w-[460px] bg-white border-l border-[#E5E7EB] shadow-[-8px_0_32px_rgba(13,33,55,0.08)] z-[150] flex flex-col"
      >
        <div className="p-5 pb-4 border-b border-[#E5E7EB] flex items-center gap-3.5 shrink-0">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-[14px] font-semibold shrink-0"
            style={{ background: `${col}22`, color: col }}
          >
            {getInitials(contact.firstName, contact.lastName)}
          </div>
          <div className="flex-1">
            <div className="text-[16px] font-semibold text-[#0D2137] tracking-tight">
              {contact.firstName || "Sans"} {contact.lastName || "Nom"}
            </div>
            <div className="text-[12px] text-[#8BAFC0] mt-0.5">
              {contact.email || "Pas d'email"} ·{" "}
              {contact.phone || "Pas de numéro"}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-[6px] border border-[#E5E7EB] flex items-center justify-center text-[#8BAFC0] hover:bg-[#F0F2F4] hover:text-[#0D2137] transition-all shrink-0 ml-auto"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex border-b border-[#E5E7EB] shrink-0 px-2 overflow-x-auto no-scrollbar">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => onTabChange(t.id)}
              className={`text-[13px] px-4 py-2.5 cursor-pointer border-b-2 transition-all whitespace-nowrap ${
                activeTab === t.id
                  ? "text-[#1B5E82] font-medium border-[#2E8FAD]"
                  : "text-[#4A7A94] border-transparent hover:text-[#0D2137]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5 pb-20 custom-scrollbar">
          {activeTab === "profile" && (
            <div className="space-y-0">
              <DetailRow label="Prénom" value={contact.firstName || "—"} />
              <DetailRow label="Nom" value={contact.lastName || "—"} />
              <DetailRow label="Email" value={contact.email || "—"} isLink />
              <DetailRow label="Téléphone" value={contact.phone || "—"} />
              <DetailRow
                label="Genre"
                value={
                  contact.gender === "M"
                    ? "Homme"
                    : contact.gender === "F"
                      ? "Femme"
                      : "—"
                }
              />
              <DetailRow label="Ville" value={contact.city || "—"} />
              <DetailRow label="Pays" value={contact.country || "—"} />
              <DetailRow
                label="Statut"
                value={
                  onChangeStatus && (editingStatus || statusOptions.length > 0) ? (
                    editingStatus ? (
                      <select
                        autoFocus
                        defaultValue={
                          statusOptions.find(
                            (s) =>
                              s.toLowerCase() === contact.status.toLowerCase(),
                          ) ?? contact.status
                        }
                        onBlur={() => setEditingStatus(false)}
                        onChange={(e) => {
                          const next = e.target.value;
                          setEditingStatus(false);
                          if (
                            next &&
                            next.toLowerCase() !== contact.status.toLowerCase()
                          ) {
                            onChangeStatus(contact.id, next);
                          }
                        }}
                        className="text-[13px] px-2 py-1 border border-[#E5E7EB] rounded-lg bg-white text-[#0D2137] outline-none focus:border-[#2E8FAD]"
                      >
                        {(statusOptions.length > 0
                          ? statusOptions
                          : [contact.status]
                        ).map((s) => (
                          <option key={s} value={s}>
                            {statusLabel(s.toLowerCase())}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setEditingStatus(true)}
                        title="Modifier le statut"
                        className="cursor-pointer"
                      >
                        <Badge
                          variant={
                            contact.status === "active"
                              ? "success"
                              : contact.status === "inactive"
                                ? "neutral"
                                : "error"
                          }
                          className="scale-90 origin-right hover:opacity-80 transition-opacity"
                        >
                          {statusLabel(contact.status)}
                        </Badge>
                      </button>
                    )
                  ) : (
                    <Badge
                      variant={
                        contact.status === "active"
                          ? "success"
                          : contact.status === "inactive"
                            ? "neutral"
                            : "error"
                      }
                      className="scale-90 origin-right"
                    >
                      {statusLabel(contact.status)}
                    </Badge>
                  )
                }
              />

              {/* Product-specific custom attributes (flat detailed endpoint) */}
              {flatDetailQuery.isLoading ? (
                <p className="pt-3 text-[12px] text-[#8BAFC0]">
                  Chargement des attributs…
                </p>
              ) : customAttributes.length > 0 ? (
                <div className="pt-4">
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8BAFC0]">
                    Attributs personnalisés
                  </p>
                  {customAttributes.map((a, i) => (
                    <DetailRow
                      key={a.key ?? `attr-${i}`}
                      label={`${a.label || a.key || "—"}${
                        a.isDerived ? " · calculé" : ""
                      }`}
                      value={formatAttrValue(a.value)}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          )}

          {activeTab === "channels" && (
            <div className="space-y-0">
              {/* Contact-channel deliverability status (keyed by phone number).
                  PATCH /api/ContactChannel/status — sets consent/deliverability
                  for this contact's phone across messaging channels. */}
              {contact.phone && channelStatuses.length > 0 && (
                <div className="mb-4 rounded-xl border border-[#E5E7EB] bg-[#F7F8F9] p-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[12.5px] font-semibold text-[#0D2137]">
                        Statut du numéro
                      </div>
                      <div className="text-[11.5px] text-[#8BAFC0] truncate">
                        {contact.phone}
                      </div>
                    </div>
                    <select
                      defaultValue=""
                      disabled={isChannelStatusPending}
                      onChange={(e) => {
                        const next = e.target.value;
                        if (next && contact.phone) {
                          changeChannelStatus(contact.phone, next);
                          e.target.value = "";
                        }
                      }}
                      className="text-[12.5px] px-2.5 py-1.5 border border-[#E5E7EB] rounded-lg bg-white text-[#0D2137] outline-none focus:border-[#2E8FAD] disabled:opacity-50 shrink-0"
                    >
                      <option value="" disabled>
                        {isChannelStatusPending ? "Mise à jour…" : "Changer…"}
                      </option>
                      {channelStatuses.map((s) => (
                        <option key={s} value={s}>
                          {statusLabel(s.toLowerCase())}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              {channelsQuery.isLoading || allChannelsQuery.isLoading ? (
                <div className="text-[13px] text-[#8BAFC0] text-center py-10">
                  Chargement...
                </div>
              ) : allChannels.length === 0 ? (
                <div className="text-[13px] text-[#8BAFC0] text-center py-10">
                  Aucun canal disponible
                </div>
              ) : (
                allChannels.map((ch: any) => {
                  const pref = channels.find((p: any) => p.channelId === ch.id);
                  const isOptIn = pref ? pref.isOptedIn : false;
                  const isLoading = (createChannelPrefMutation.isPending && createChannelPrefMutation.variables?.body?.channelId === ch.id) ||
                                  (updateChannelPrefMutation.isPending && updateChannelPrefMutation.variables?.body?.channelId === ch.id);

                  return (
                    <div
                      key={ch.id}
                      className="flex items-center gap-4 py-4 border-b border-[#E5E7EB] last:border-0"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getChannelColor(ch.name)}`}>
                        {getChannelIcon(ch.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-semibold text-[#0D2137] truncate">
                          {ch.name}
                        </div>
                        <div className="text-[12px] text-[#8BAFC0] truncate">
                          {isOptIn ? "Opt-in actif" : "Non inscrit"} {pref?.optedInAt ? `· depuis ${new Date(pref.optedInAt).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}` : ""}
                        </div>
                      </div>
                      <button
                        onClick={() => !isLoading && handleToggleChannel(ch.id)}
                        disabled={isLoading}
                        className={`w-[44px] h-[24px] rounded-full relative transition-all duration-300 ${isOptIn ? "bg-[#2E8FAD]" : "bg-[#E5E7EB]"} ${isLoading ? "opacity-50" : "cursor-pointer"}`}
                      >
                        <div className={`absolute top-[2px] w-[20px] h-[20px] rounded-full bg-white transition-all duration-300 shadow-sm ${isOptIn ? "left-[22px]" : "left-[2px]"}`}>
                          {isLoading && <div className="w-full h-full border-2 border-[#E5E7EB] border-t-[#2E8FAD] rounded-full animate-spin" />}
                        </div>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === "messages" && (
            <div className="space-y-0">
              {messagesQuery.isLoading ? (
                <div className="text-[13px] text-[#8BAFC0] text-center py-10">
                  Chargement...
                </div>
              ) : messages.length === 0 ? (
                <div className="text-[13px] text-[#8BAFC0] text-center py-10">
                  Aucun message récent
                </div>
              ) : (
                messages.map((m: any) => (
                  <div
                    key={m.id}
                    className="flex items-start gap-3 py-3 border-b border-[#E5E7EB] last:border-0"
                  >
                    <div className="w-7 h-7 rounded-[7px] bg-[#F0F2F4] flex items-center justify-center shrink-0 mt-0.5">
                      <Send size={12} className="text-[#8BAFC0]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12.5px] font-medium text-[#0D2137] truncate">
                        {m.campaignName || "Message direct"}
                      </div>
                      <div className="text-[11.5px] text-[#8BAFC0] truncate">
                        {m.channelName || "Canal inconnu"} ·{" "}
                        {statusLabel(m.status)}
                      </div>
                    </div>
                    <span className="text-[11px] text-[#8BAFC0] shrink-0 pt-[1px]">
                      {m.createdAt ? formatRelative(m.createdAt) : ""}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "segments" && (
            <div className="space-y-0">
              {segmentsQuery.isLoading || allSegmentsQuery.isLoading ? (
                <div className="text-[13px] text-[#8BAFC0] text-center py-10">
                  Chargement...
                </div>
              ) : allSegments.length === 0 ? (
                <div className="text-[13px] text-[#8BAFC0] text-center py-10">
                  Aucun segment disponible
                </div>
              ) : (
                allSegments.map((s: any) => {
                  const isMember = segments.some((m: any) => m.segmentId === s.id);
                  const isLoading = (addSegmentMutation.isPending && addSegmentMutation.variables?.body?.segmentId === s.id) ||
                                  (removeSegmentMutation.isPending && segments.find((m: any) => m.segmentId === s.id)?.id === removeSegmentMutation.variables?.path?.id);

                  return (
                    <div 
                      key={s.id} 
                      className="flex items-center gap-4 py-4 border-b border-[#E5E7EB] last:border-0 hover:bg-[#F7F8F9] cursor-pointer group transition-colors px-2 -mx-2 rounded-xl"
                      onClick={() => !isLoading && handleToggleSegment(s.id)}
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-[#F0F2F4]">
                        <Users size={16} className="text-[#8BAFC0]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-[14px] font-semibold truncate ${isMember ? 'text-[#0D2137]' : 'text-[#4A7A94]'}`}>
                          {s.name}
                        </div>
                        <div className="text-[12px] text-[#8BAFC0] truncate">
                          {isMember ? "Contact inclus" : "Non membre"}
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${isMember ? 'bg-[#2E8FAD] border-[#2E8FAD]' : 'border-[#E5E7EB] bg-white group-hover:border-[#2E8FAD]'}`}>
                        {isMember && !isLoading && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />}
                        {isLoading && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        <div className="p-3.5 px-5 border-t border-[#E5E7EB] bg-[#F7F8F9] flex gap-2 shrink-0">
          <Button
            variant="primary"
            size="sm"
            onClick={() => onEdit(contact)}
            className="px-4"
          >
            <Edit2 size={12} className="mr-1.5" /> Modifier
          </Button>
          <Button variant="secondary" size="sm" className="px-4 bg-white">
            <Send size={12} className="mr-1.5" /> Message
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(contact.id)}
            className="ml-auto text-[#DC2626] hover:bg-[#FEE2E2] hover:text-[#DC2626]"
          >
            <Trash2 size={12} className="mr-1.5" /> Supprimer
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function DetailRow({
  label,
  value,
  isLink,
}: {
  label: string;
  value: React.ReactNode;
  isLink?: boolean;
}) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-[#E5E7EB] last:border-0">
      <span className="text-[12px] text-[#8BAFC0] shrink-0 mr-3 pt-px">
        {label}
      </span>
      <span
        className={`text-[13px] text-right ${isLink ? "text-[#2E8FAD] cursor-pointer hover:underline" : "text-[#0D2137]"}`}
      >
        {value}
      </span>
    </div>
  );
}

/** Renders a custom-attribute value (string / number / boolean / array / object) for display. */
function formatAttrValue(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (Array.isArray(v)) return v.map((x) => String(x)).join(", ");
  if (typeof v === "boolean") return v ? "Oui" : "Non";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}
