import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Edit, MessageSquare, Tag, Radio } from "lucide-react";
import { toast } from "sonner";
import {
  getApiClientDetailByIdOptions,
  getApiClientDetailByIdQueryKey,
  postApiClientSearchQueryKey,
  postApiMessageSearchOptions,
  postApiClientChannelPreferenceSearchOptions,
  postApiClientSegmentMemberSearchOptions,
  putApiClientMutation,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";
import { DataTable, type Column } from "@/components/data-table/DataTable";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { PageLoader } from "@/components/feedback/PageLoader";
import { formatDate, formatRelative } from "@/lib/date";
import { formatCurrency } from "@/lib/currency";
import {
  getInitials,
  avatarColor,
  statusLabel,
  statusBadgeClass,
  cn,
} from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientSchema } from "@/lib/validators";
import type {
  ClientDto,
  MessageDto,
  ClientChannelPreferenceDto,
} from "@/shared/api/types";
import type { z } from "zod";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations";

type ClientForm = z.infer<typeof clientSchema>;

const tabs = [
  { id: "profile", label: "Profil" },
  { id: "messages", label: "Messages" },
  { id: "channels", label: "Canaux" },
  { id: "segments", label: "Segments" },
];

export function ContactDetailPage({ contactId }: { contactId: string }) {
  const router = useRouter();
  const qc = useQueryClient();
  const [tab, setTab] = useState("profile");
  const [editOpen, setEditOpen] = useState(false);

  const { data, isLoading } = useQuery({
    ...getApiClientDetailByIdOptions({ path: { id: contactId } }),
  });

  const { data: messagesData } = useQuery({
    ...postApiMessageSearchOptions({
      body: { clientId: contactId, pageNumber: 1, pageSize: 20 },
    }),
    enabled: tab === "messages",
  });

  const { data: prefsData } = useQuery({
    ...postApiClientChannelPreferenceSearchOptions({
      body: { clientId: contactId, pageNumber: 1, pageSize: 20 },
    }),
    enabled: tab === "channels",
  });

  const { data: segmentsData } = useQuery({
    ...postApiClientSegmentMemberSearchOptions({
      body: { clientId: contactId, pageNumber: 1, pageSize: 20 },
    }),
    enabled: tab === "segments",
  });

  const contact: ClientDto = (data as any)?.data;
  const messages: MessageDto[] = (messagesData as any)?.data?.items ?? [];
  const prefs: ClientChannelPreferenceDto[] =
    (prefsData as any)?.data?.items ?? [];
  const segments = (segmentsData as any)?.data?.items ?? [];

  const updateMutation = useMutation({
    ...putApiClientMutation(),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: getApiClientDetailByIdQueryKey({ path: { id: contactId } }),
      });
      qc.invalidateQueries({ queryKey: postApiClientSearchQueryKey() });
      setEditOpen(false);
      toast.success("Contact modifié");
    },
    onError: () => toast.error("Erreur"),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientForm>({
    resolver: zodResolver(clientSchema),
  });

  const openEdit = () => {
    if (!contact) return;
    reset({
      firstName: contact.firstName ?? "",
      lastName: contact.lastName ?? "",
      email: contact.email ?? "",
      phone: contact.phone ?? "",
      city: contact.city ?? "",
      country: contact.country ?? "",
      status: contact.status,
    });
    setEditOpen(true);
  };

  const onSubmit = (d: ClientForm) => {
    if (!contact) return;
    // Explicit pick — don't spread the full DTO (avoids sending audit/read-only fields)
    updateMutation.mutate({
      body: {
        id: contact.id,
        productId: (contact as any).productId ?? undefined,
        externalId: (contact as any).externalId ?? undefined,
        firstName: d.firstName ?? contact.firstName ?? undefined,
        lastName: d.lastName ?? contact.lastName ?? undefined,
        email: d.email ?? contact.email ?? undefined,
        phone: d.phone ?? contact.phone ?? undefined,
        gender: contact.gender ?? undefined,
        birthDate: (contact as any).birthDate ?? undefined,
        language: (contact as any).language ?? undefined,
        timezone: (contact as any).timezone ?? undefined,
        address: (contact as any).address ?? undefined,
        city: d.city ?? contact.city ?? undefined,
        postalCode: (contact as any).postalCode ?? undefined,
        country: d.country ?? contact.country ?? undefined,
        status: d.status ?? contact.status ?? undefined,
        customData: contact.customData ?? undefined,
      } as any,
    });
  };

  if (isLoading) return <PageLoader />;
  if (!contact)
    return (
      <div className="p-7">
        <p className="text-[13px] text-[#8BAFC0]">Contact introuvable</p>
      </div>
    );

  const msgColumns: Column<MessageDto>[] = [
    {
      key: "content",
      label: "Message",
      render: (m) => (
        <span className="text-[12.5px] truncate">
          {m.content ? m.content?.slice(0, 60) + "…" : "—"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Statut",
      width: "110px",
      render: (m) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${statusBadgeClass(m.status)}`}
        >
          {statusLabel(m.status)}
        </span>
      ),
    },
    {
      key: "sentAt",
      label: "Envoyé",
      width: "130px",
      render: (m) => (
        <span className="text-[#8BAFC0] text-[12px]">
          {m.sentAt ? formatRelative(m.sentAt) : "—"}
        </span>
      ),
    },
    {
      key: "cost",
      label: "Coût",
      width: "100px",
      render: (m) => (
        <span className="font-mono text-[11.5px] text-[#4A7A94]">
          {m.cost != null ? formatCurrency(m.cost) : "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="p-7">
      <button
        onClick={() => router.history.back()}
        className="flex items-center gap-2 text-[12.5px] text-[#8BAFC0] hover:text-[#0D2137] mb-5 transition-colors cursor-pointer"
      >
        <ArrowLeft size={13} />
        Retour
      </button>

      <motion.div {...fadeInUp}>
        {/* Header */}
        <div className="bg-white border border-[#E5E7EB] rounded-[20px] p-6 mb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-[16px] font-semibold text-white shrink-0"
                style={{ background: avatarColor(contact.firstName ?? "U") }}
              >
                {getInitials(contact.firstName, contact.lastName)}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-[20px] font-semibold text-[#0D2137] tracking-tight">
                    {contact.firstName} {contact.lastName}
                  </h1>
                  <Badge
                    variant={
                      contact.status === "active"
                        ? "success"
                        : contact.status === "blocked"
                          ? "error"
                          : "neutral"
                    }
                    dot
                  >
                    {statusLabel(contact.status)}
                  </Badge>
                </div>
                <p className="text-[12.5px] text-[#8BAFC0] mt-1">
                  {contact.email ?? "—"} · {contact.phone ?? "—"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm">
                <MessageSquare size={13} />
                Envoyer un message
              </Button>
              <Button variant="primary" size="sm" onClick={openEdit}>
                <Edit size={13} />
                Modifier
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-white border border-[#E5E7EB] rounded-[14px] overflow-hidden mb-4">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "px-4 py-3 text-[13px] border-b-2 transition-all cursor-pointer whitespace-nowrap",
                tab === t.id
                  ? "text-[#1B5E82] font-medium border-[#2E8FAD] bg-[#E8F4F8]"
                  : "text-[#4A7A94] border-transparent hover:text-[#0D2137] hover:bg-[#F7F8F9]",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {tab === "profile" && (
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader
                  title="Informations personnelles"
                  action={<span onClick={openEdit}>Modifier →</span>}
                />
                <CardBody className="p-0">
                  {[
                    { k: "Prénom", v: contact.firstName ?? "—" },
                    { k: "Nom", v: contact.lastName ?? "—" },
                    { k: "Email", v: contact.email ?? "—" },
                    { k: "Téléphone", v: contact.phone ?? "—" },
                    {
                      k: "Genre",
                      v:
                        contact.gender === "M"
                          ? "Homme"
                          : contact.gender === "F"
                            ? "Femme"
                            : "—",
                    },
                    { k: "Ville", v: contact.city ?? "—" },
                    { k: "Pays", v: contact.country ?? "—" },
                    { k: "Statut", v: statusLabel(contact.status) },
                    { k: "Créé le", v: formatDate(contact.createdAt) },
                    {
                      k: "Modifié le",
                      v: formatRelative(contact.updatedAt ?? contact.createdAt),
                    },
                  ].map((row) => (
                    <div
                      key={row.k}
                      className="flex items-start justify-between px-5 py-2.5 border-b border-[#E5E7EB] last:border-b-0"
                    >
                      <span className="text-[12px] text-[#8BAFC0] shrink-0">
                        {row.k}
                      </span>
                      <span className="text-[13px] text-[#0D2137] text-right ml-4">
                        {row.v}
                      </span>
                    </div>
                  ))}
                </CardBody>
              </Card>
              <Card>
                <CardHeader title="Données personnalisées" />
                <CardBody>
                  {contact.customData ? (
                    <pre className="text-[11.5px] font-mono text-[#4A7A94] bg-[#F7F8F9] p-3 rounded-[8px] overflow-auto">
                      {JSON.stringify(contact.customData, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-[12.5px] text-[#8BAFC0] italic">
                      Aucune donnée personnalisée
                    </p>
                  )}
                </CardBody>
              </Card>
            </div>
          )}

          {tab === "messages" && (
            <Card>
              <CardHeader title={`Messages (${messages.length})`} />
              <CardBody className="p-0">
                <DataTable
                  columns={msgColumns}
                  data={messages}
                  getRowId={(m) => m.id}
                  emptyTitle="Aucun message"
                  emptyDescription="Ce contact n'a pas encore reçu de messages"
                />
              </CardBody>
            </Card>
          )}

          {tab === "channels" && (
            <Card>
              <CardHeader title="Préférences de canaux" />
              <CardBody className="p-0">
                {prefs.length === 0 ? (
                  <div className="flex items-center justify-center py-10 text-[13px] text-[#8BAFC0]">
                    <Radio size={24} className="mr-3 opacity-30" />
                    Aucune préférence configurée
                  </div>
                ) : (
                  prefs.map((pref) => (
                    <div
                      key={pref.id}
                      className="flex items-center justify-between px-5 py-3.5 border-b border-[#E5E7EB] last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-[8px] bg-[#E8F4F8] flex items-center justify-center">
                          <Radio size={14} className="text-[#2E8FAD]" />
                        </div>
                        <div>
                          <p className="text-[13px] font-medium text-[#0D2137]">
                            Canal {pref.channelId.slice(0, 8)}
                          </p>
                          <p className="text-[11.5px] text-[#8BAFC0]">
                            {pref.isOptedIn
                              ? `Opt-in depuis ${pref.optedInAt ? formatDate(pref.optedInAt) : "—"}`
                              : "Opt-out"}
                          </p>
                        </div>
                      </div>
                      <Toggle checked={pref.isOptedIn} onChange={() => {}} />
                    </div>
                  ))
                )}
              </CardBody>
            </Card>
          )}

          {tab === "segments" && (
            <Card>
              <CardHeader title={`Segments (${segments.length})`} />
              <CardBody className="p-0">
                {segments.length === 0 ? (
                  <div className="flex items-center justify-center py-10 text-[13px] text-[#8BAFC0]">
                    <Tag size={24} className="mr-3 opacity-30" />
                    Contact dans aucun segment
                  </div>
                ) : (
                  segments.map(
                    (s: {
                      id: string;
                      segmentId: string;
                      addedAt?: string;
                    }) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between px-5 py-3 border-b border-[#E5E7EB] last:border-b-0"
                      >
                        <p className="text-[13px] font-medium text-[#0D2137]">
                          Segment {s.segmentId.slice(0, 8)}
                        </p>
                        <span className="text-[11.5px] text-[#8BAFC0]">
                          Ajouté {s.addedAt ? formatRelative(s.addedAt) : "—"}
                        </span>
                      </div>
                    ),
                  )
                )}
              </CardBody>
            </Card>
          )}
        </motion.div>
      </motion.div>

      {/* Edit Modal */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Modifier le contact"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit(onSubmit)}
              loading={updateMutation.isPending}
            >
              Enregistrer
            </Button>
          </>
        }
      >
        <form className="grid grid-cols-2 gap-4">
          <Input
            label="Prénom *"
            error={errors.firstName?.message}
            {...register("firstName")}
          />
          <Input
            label="Nom *"
            error={errors.lastName?.message}
            {...register("lastName")}
          />
          <Input
            label="Email"
            type="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Téléphone *"
            error={errors.phone?.message}
            {...register("phone")}
          />
          <Input label="Ville" {...register("city")} />
          <Input label="Pays" {...register("country")} />
          <Select
            label="Statut"
            options={[
              { value: "active", label: "Actif" },
              { value: "inactive", label: "Inactif" },
              { value: "blocked", label: "Bloqué" },
            ]}
            {...register("status")}
          />
        </form>
      </Modal>
    </div>
  );
}
