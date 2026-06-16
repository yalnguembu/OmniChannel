import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell, Check, Clock, AlertTriangle, Info } from "lucide-react";
import { postApiNotificationSearchOptions } from "@/shared/api/generated/@tanstack/react-query.gen";
import { Toggle } from "@/components/ui/Toggle";
import { PageLoader } from "@/components/feedback/PageLoader";
import { formatRelative } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { NotificationDto } from "@/shared/api/types";
import { SettingsSidebar } from "@/components/features/settings/SettingsSidebar";

const ALERT_RULES = [
  {
    key: "low_balance",
    label: "Solde wallet bas",
    desc: "Alerte quand le solde passe sous le seuil minimum",
    emailDefault: true,
    appDefault: true,
  },
  {
    key: "campaign_done",
    label: "Campagne terminee",
    desc: "Notification a la fin de chaque campagne",
    emailDefault: true,
    appDefault: true,
  },
  {
    key: "msg_failed",
    label: "Messages ecoues",
    desc: "Alerte quand le taux d'echec depasse 10%",
    emailDefault: true,
    appDefault: false,
  },
  {
    key: "import_done",
    label: "Import contacts termine",
    desc: "Notification a la fin d'un import CSV",
    emailDefault: false,
    appDefault: true,
  },
  {
    key: "connector_error",
    label: "Connecteur en erreur",
    desc: "Alerte si un connecteur devient indisponible",
    emailDefault: true,
    appDefault: true,
  },
];

const REPORT_RULES = [
  {
    key: "daily",
    label: "Rapport quotidien",
    desc: "Synthese des envois de la journee a 08:00",
    emailDefault: true,
    appDefault: false,
  },
  {
    key: "weekly",
    label: "Rapport hebdomadaire",
    desc: "Bilan de la semaine chaque lundi matin",
    emailDefault: true,
    appDefault: false,
  },
  {
    key: "monthly",
    label: "Rapport mensuel",
    desc: "Analyse complete du mois ecoule",
    emailDefault: false,
    appDefault: false,
  },
];

function NotifRow({
  label,
  desc,
  emailDefault,
  appDefault,
}: {
  label: string;
  desc: string;
  emailDefault: boolean;
  appDefault: boolean;
}) {
  const [emailOn, setEmailOn] = useState(emailDefault);
  const [appOn, setAppOn] = useState(appDefault);
  return (
    <div className="flex items-start justify-between px-5 py-4 border-b border-[#F0F2F4] last:border-0 gap-6">
      <div className="flex-1">
        <p className="text-[13px] font-medium text-[#0D2137]">{label}</p>
        <p className="text-[12px] text-[#8BAFC0] mt-0.5 max-w-[420px]">
          {desc}
        </p>
      </div>
      <div className="flex items-center gap-6 shrink-0">
        <div className="flex flex-col items-center gap-1.5">
          <p className="text-[10.5px] text-[#8BAFC0] uppercase tracking-[0.06em]">
            Email
          </p>
          <Toggle checked={emailOn} onChange={setEmailOn} />
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <p className="text-[10.5px] text-[#8BAFC0] uppercase tracking-[0.06em]">
            In-app
          </p>
          <Toggle checked={appOn} onChange={setAppOn} />
        </div>
      </div>
    </div>
  );
}

function getNotifMeta(alertType?: string) {
  if (alertType === "warning")
    return { Icon: AlertTriangle, color: "#D97706", bg: "#FEF3C7" };
  if (alertType === "error")
    return { Icon: AlertTriangle, color: "#DC2626", bg: "#FEE2E2" };
  if (alertType === "success")
    return { Icon: Check, color: "#16A34A", bg: "#DCFCE7" };
  if (alertType === "info")
    return { Icon: Info, color: "#2E8FAD", bg: "#E8F4F8" };
  return { Icon: Bell, color: "#8BAFC0", bg: "#F0F2F4" };
}

function NotifCard({ n }: { n: NotificationDto }) {
  const { Icon, color, bg } = getNotifMeta(n.alertType);
  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-[12px] border transition-all",
        n.isRead
          ? "bg-white border-[#E5E7EB]"
          : "bg-[#E8F4F8] border-[#C8E8F2]",
      )}
    >
      <div
        className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0"
        style={{ background: bg }}
      >
        <Icon size={15} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "text-[13px]",
              n.isRead ? "text-[#4A7A94]" : "font-medium text-[#0D2137]",
            )}
          >
            {n.title}
          </p>
          {!n.isRead && (
            <div className="w-2 h-2 rounded-full bg-[#2E8FAD] shrink-0 mt-1" />
          )}
        </div>
        <p className="text-[12px] text-[#8BAFC0] mt-0.5 line-clamp-2">
          {n.message}
        </p>
        <div className="flex items-center gap-3 mt-2">
          <span className="flex items-center gap-1 text-[11px] text-[#8BAFC0]">
            <Clock size={11} />
            {formatRelative(n.createdAt)}
          </span>
          {n.actionUrl && n.actionLabel && (
            <a
              href={n.actionUrl}
              className="text-[11.5px] text-[#2E8FAD] hover:text-[#1B5E82] transition-colors"
            >
              {n.actionLabel}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export function NotificationsPage() {
  const [activeSection, setActiveSection] = useState<"preferences" | "inbox">(
    "preferences",
  );

  const { data: notifications = [], isLoading } = useQuery({
    ...postApiNotificationSearchOptions({
      body: { pageNumber: 1, pageSize: 50 },
    }),
    enabled: activeSection === "inbox",
    select: (res: any) => (res?.data?.items ?? []) as NotificationDto[],
  });
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="flex h-screen bg-white">
      <SettingsSidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-7">
          <div className="mb-6">
            <h1 className="text-[20px] font-semibold text-[#0D2137] tracking-tight">
              Notifications
            </h1>
            <p className="text-[12.5px] text-[#4A7A94] mt-1">
              Configurez vos préférences de notification
            </p>
          </div>

          <div className="flex gap-1 mb-5">
        {(
          [
            ["preferences", "Preferences"],
            ["inbox", "Notifications recues"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-[13px] transition-all cursor-pointer",
              activeSection === id
                ? "bg-[#E8F4F8] text-[#1B5E82] font-medium border border-[#C8E8F2]"
                : "text-[#4A7A94] hover:bg-[#F0F2F4]",
            )}
          >
            {label}
            {id === "inbox" && unreadCount > 0 && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#E8541A] text-white">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeSection === "preferences" && (
        <div className="max-w-6xl flex flex-col gap-4">
          <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#E5E7EB] bg-[#F7F8F9]">
              <p className="text-[13px] font-medium text-[#0D2137]">
                Alertes operationnelles
              </p>
            </div>
            {ALERT_RULES.map((n) => (
              <NotifRow
                key={n.key}
                label={n.label}
                desc={n.desc}
                emailDefault={n.emailDefault}
                appDefault={n.appDefault}
              />
            ))}
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#E5E7EB] bg-[#F7F8F9]">
              <p className="text-[13px] font-medium text-[#0D2137]">
                Rapports et syntheses
              </p>
            </div>
            {REPORT_RULES.map((n) => (
              <NotifRow
                key={n.key}
                label={n.label}
                desc={n.desc}
                emailDefault={n.emailDefault}
                appDefault={n.appDefault}
              />
            ))}
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#E5E7EB] bg-[#F7F8F9]">
              <p className="text-[13px] font-medium text-[#0D2137]">
                Canaux de notification
              </p>
            </div>
            <div className="flex items-start justify-between px-5 py-4 border-b border-[#F0F2F4]">
              <div>
                <p className="text-[13px] font-medium text-[#0D2137]">
                  Email principal
                </p>
                <p className="text-[12px] text-[#8BAFC0] mt-0.5">
                  Toutes les alertes seront envoyees a cette adresse
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[12.5px] text-[#0D2137]">
                  contact@company.com
                </span>
                <button className="text-[12px] px-2.5 py-1 rounded-full border border-[#E5E7EB] bg-white hover:bg-[#F0F2F4] text-[#4A7A94] transition-all cursor-pointer">
                  Modifier
                </button>
              </div>
            </div>
            <div className="flex items-start justify-between px-5 py-4">
              <div>
                <p className="text-[13px] font-medium text-[#0D2137]">
                  Notifications in-app
                </p>
                <p className="text-[12px] text-[#8BAFC0] mt-0.5">
                  Alertes dans l'interface OmniChannel
                </p>
              </div>
              <Toggle checked={true} onChange={() => {}} />
            </div>
          </div>
        </div>
      )}

      {activeSection === "inbox" && (
        <div className="max-w-6xl">
          {isLoading ? (
            <PageLoader />
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 bg-white border border-[#E5E7EB] rounded-lg">
              <Bell size={32} className="text-[#8BAFC0] mb-3 opacity-50" />
              <p className="text-[14px] font-medium text-[#0D2137]">
                Aucune notification
              </p>
              <p className="text-[12.5px] text-[#8BAFC0] mt-1">
                Vous recevrez ici les alertes de votre activite
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {notifications.map((n) => (
                <NotifCard key={n.id} n={n} />
              ))}
            </div>
          )}
        </div>
      )}
        </div>
      </div>
    </div>
  );
}
