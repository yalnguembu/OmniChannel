import type {
  SearchMessageResponse,
  SearchMessageEventResponse,
} from "@/shared/api/generated/types.gen";
import { formatRelative, formatDateTime } from "@/lib/date";
import { chMeta, statusMeta } from "./constant";

export function MessageDetailPanel({
  activeMsg,
  detailTab,
  setDetailTab,
  events,
  isEventsLoading,
  onClose,
}: {
  activeMsg: SearchMessageResponse | null;
  detailTab: string;
  setDetailTab: (t: string) => void;
  events: SearchMessageEventResponse[];
  isEventsLoading: boolean;
  onClose: () => void;
}) {
  if (!activeMsg) return null;

  const chId = activeMsg.channelId?.toLowerCase() || "sms";
  let cm = chMeta.sms;
  if (chId.includes("email")) cm = chMeta.email;
  if (chId.includes("whatsapp")) cm = chMeta.whatsapp;
  if (chId.includes("push")) cm = chMeta.push;

  const st = statusMeta[activeMsg.status ?? ""] || statusMeta.default;

  return (
    <div className="w-[420px] border-l border-[#E5E7EB] bg-white flex flex-col shrink-0 relative z-10 shadow-[-4px_0_24px_rgba(0,0,0,0.03)] animate-in slide-in-from-right duration-300">
      <div className="px-[18px] pt-4 pb-[14px] border-b border-[#E5E7EB] shrink-0">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="text-[11px] font-mono text-[#8BAFC0] mb-1.5">
              {activeMsg.id?.toUpperCase()}
            </div>
            <div className="text-[15px] font-semibold text-[#0D2137] tracking-[-0.015em] mb-1">
              {activeMsg.templateId ? "Template Message" : "Message Libre"}
            </div>
            <div className="text-[12.5px] text-[#4A7A94]">
              {activeMsg.recipientAddress}
            </div>
          </div>
          <button
            className="w-[26px] h-[26px] rounded-md border border-[#E5E7EB] bg-transparent flex items-center justify-center cursor-pointer text-[#8BAFC0] transition-colors shrink-0 hover:bg-[#F0F2F4] hover:text-[#0D2137]"
            onClick={onClose}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M2 2l8 8M10 2L2 10"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 border rounded-[4px] text-[11px] font-medium ${st.cls}`}
          >
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{
                background: st.dot.includes("var")
                  ? st.dot === "var(--ok)"
                    ? "#16A34A"
                    : st.dot === "var(--t)"
                      ? "#2E8FAD"
                      : st.dot === "var(--er)"
                        ? "#DC2626"
                        : st.dot === "var(--wa)"
                          ? "#D97706"
                          : "#8BAFC0"
                  : st.dot,
              }}
            ></span>
            {st.label}
          </span>
          <span
            className="text-[11.5px] font-medium px-2 py-0.5 rounded-[4px]"
            style={{ color: cm.c, background: cm.bg }}
          >
            {cm.name}
          </span>
          {activeMsg.errorCode && (
            <span className="font-mono text-[11px] bg-[#FEE2E2] text-[#DC2626] px-2 py-0.5 rounded-[4px] border border-[#FCA5A5]">
              {activeMsg.errorCode}
            </span>
          )}
        </div>
      </div>

      <div className="flex border-b border-[#E5E7EB] shrink-0 px-1">
        <div
          className={`text-[12.5px] px-3 py-[9px] cursor-pointer border-b-2 transition-colors whitespace-nowrap hover:text-[#0D2137] ${detailTab === "detail" ? "text-[#1B5E82] font-medium border-[#2E8FAD]" : "text-[#4A7A94] border-transparent"}`}
          onClick={() => setDetailTab("detail")}
        >
          Détail
        </div>
        <div
          className={`text-[12.5px] px-3 py-[9px] cursor-pointer border-b-2 transition-colors whitespace-nowrap hover:text-[#0D2137] ${detailTab === "timeline" || detailTab === "events" ? "text-[#1B5E82] font-medium border-[#2E8FAD]" : "text-[#4A7A94] border-transparent"}`}
          onClick={() => setDetailTab("events")}
        >
          Événements
        </div>
        <div
          className={`text-[12.5px] px-3 py-[9px] cursor-pointer border-b-2 transition-colors whitespace-nowrap hover:text-[#0D2137] ${detailTab === "content" ? "text-[#1B5E82] font-medium border-[#2E8FAD]" : "text-[#4A7A94] border-transparent"}`}
          onClick={() => setDetailTab("content")}
        >
          Contenu
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-[14px_18px] scrollbar-custom">
        {detailTab === "detail" && (
          <>
            <div className="flex items-start justify-between py-2 border-b border-[#E5E7EB]">
              <span className="text-[11.5px] text-[#8BAFC0] shrink-0 mr-3 pt-[1px]">
                ID message
              </span>
              <span className="text-[12.5px] text-[#0D2137] text-right break-all font-mono">
                {activeMsg.id}
              </span>
            </div>
            <div className="flex items-start justify-between py-2 border-b border-[#E5E7EB]">
              <span className="text-[11.5px] text-[#8BAFC0] shrink-0 mr-3 pt-[1px]">
                Direction
              </span>
              <span className="text-[12.5px] text-[#0D2137] text-right break-all">
                {activeMsg.direction}
              </span>
            </div>
            <div className="flex items-start justify-between py-2 border-b border-[#E5E7EB]">
              <span className="text-[11.5px] text-[#8BAFC0] shrink-0 mr-3 pt-[1px]">
                Destinataire
              </span>
              <span className="text-[12.5px] text-[#0D2137] text-right break-all">
                {activeMsg.clientFirstName} {activeMsg.clientLastName}
              </span>
            </div>
            <div className="flex items-start justify-between py-2 border-b border-[#E5E7EB]">
              <span className="text-[11.5px] text-[#8BAFC0] shrink-0 mr-3 pt-[1px]">
                Canal
              </span>
              <span
                className="text-[12.5px] text-right break-all font-medium"
                style={{ color: cm.c }}
              >
                {cm.name}
              </span>
            </div>
            <div className="flex items-start justify-between py-2 border-b border-[#E5E7EB]">
              <span className="text-[11.5px] text-[#8BAFC0] shrink-0 mr-3 pt-[1px]">
                Type de message
              </span>
              <span className="text-[12.5px] text-[#0D2137] text-right break-all">
                {activeMsg.messageType}
              </span>
            </div>
            <div className="flex items-start justify-between py-2 border-b border-[#E5E7EB]">
              <span className="text-[11.5px] text-[#8BAFC0] shrink-0 mr-3 pt-[1px]">
                Statut
              </span>
              <span className="text-[12.5px] text-[#0D2137] text-right break-all">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 border rounded-[4px] text-[11px] font-medium ${st.cls}`}
                >
                  {st.label}
                </span>
              </span>
            </div>
            <div className="flex items-start justify-between py-2 border-b border-[#E5E7EB]">
              <span className="text-[11.5px] text-[#8BAFC0] shrink-0 mr-3 pt-[1px]">
                Envoyé le
              </span>
              <span className="text-[12.5px] text-[#0D2137] text-right break-all">
                {formatDateTime(activeMsg.sentAt)}
              </span>
            </div>
            <div className="flex items-start justify-between py-2 border-b border-[#E5E7EB]">
              <span className="text-[11.5px] text-[#8BAFC0] shrink-0 mr-3 pt-[1px]">
                Tentatives
              </span>
              <span className="text-[12.5px] text-[#0D2137] text-right break-all">
                {activeMsg.attemptCount || 1}/{activeMsg.maxAttempts || 3}
              </span>
            </div>
            <div className="flex items-start justify-between py-2 border-b border-[#E5E7EB]">
              <span className="text-[11.5px] text-[#8BAFC0] shrink-0 mr-3 pt-[1px]">
                Coût
              </span>
              <span className="text-[12.5px] text-[#0D2137] text-right break-all font-mono">
                {activeMsg.cost?.toFixed(2) || "0.00"} XAF
              </span>
            </div>
            <div className="flex items-start justify-between py-2 border-b border-[#E5E7EB]">
              <span className="text-[11.5px] text-[#8BAFC0] shrink-0 mr-3 pt-[1px]">
                Connecteur
              </span>
              <span className="text-[12.5px] text-[#0D2137] text-right break-all">
                {activeMsg.connectorName || "N/A"}
              </span>
            </div>
            {activeMsg.errorCode && (
              <div className="flex items-start justify-between py-2 border-b border-[#E5E7EB]">
                <span className="text-[11.5px] text-[#8BAFC0] shrink-0 mr-3 pt-[1px]">
                  Code erreur
                </span>
                <span className="text-[12.5px] text-[#0D2137] text-right break-all">
                  <span className="font-mono text-[11px] bg-[#FEE2E2] text-[#DC2626] px-2 py-0.5 rounded-[4px] border border-[#FCA5A5]">
                    {activeMsg.errorCode}
                  </span>
                </span>
              </div>
            )}

            {activeMsg.status === "failed" && (
              <div className="mt-3.5">
                <div className="bg-[#FEF3C7] border border-[#FCD34D] rounded-md p-[10px_14px] flex items-start gap-2">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    className="shrink-0 mt-[1px]"
                  >
                    <path
                      d="M3 7a4 4 0 104-4H4M4 2v3h3"
                      stroke="#D97706"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="text-[12px] text-[#D97706]">
                    Échec de l'envoi · Tentative {activeMsg.attemptCount || 1}/
                    {activeMsg.maxAttempts || 3}
                  </div>
                </div>
              </div>
            )}
            <div className="flex gap-2 mt-4">
              <button className="text-[12px] font-medium px-3.5 py-1.5 rounded-full bg-[#E8541A] text-white border-none cursor-pointer inline-flex items-center gap-1.5 shadow-[0_2px_10px_rgba(232,84,26,0.22)] transition-all duration-200 whitespace-nowrap hover:bg-[#D44814] hover:-translate-y-[1px]">
                Renvoyer
              </button>
              <button className="text-[12px] font-normal px-3 py-1.5 rounded-full bg-white text-[#0D2137] border border-[#E5E7EB] cursor-pointer inline-flex items-center gap-1.5 transition-colors whitespace-nowrap hover:bg-[#F0F2F4]">
                Voir le contact
              </button>
            </div>
          </>
        )}

        {(detailTab === "timeline" || detailTab === "events") && (
          <div className="flex flex-col pt-1">
            {isEventsLoading ? (
              <div className="p-5 text-center text-[12px] text-[#8BAFC0]">
                Chargement...
              </div>
            ) : events.length === 0 ? (
              <div className="p-5 text-center text-[12px] text-[#8BAFC0]">
                Aucun événement trouvé
              </div>
            ) : (
              events.map((ev: any, i) => (
                <div
                  className="flex items-start gap-3 relative pb-5 last:pb-0 group"
                  key={ev.id || i}
                >
                  {i !== events.length - 1 && (
                    <div className="absolute left-[9.5px] top-[22px] bottom-0 w-[1px] bg-[#E5E7EB]"></div>
                  )}
                  <div className="flex flex-col items-center shrink-0 z-[1]">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-[1.5px] bg-[#E8F4F8] border-[#2E8FAD]/30">
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path
                          d="M1 4h6M4 1.5l2.5 2.5L4 6.5"
                          stroke="#2E8FAD"
                          strokeWidth="1.1"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-medium text-[#0D2137]">
                      {ev.eventType}
                    </div>
                    <div className="text-[11px] text-[#8BAFC0] mt-0.5">
                      {formatRelative(ev.createdAt)}
                    </div>
                    {ev.metadata && (
                      <div className="text-[11.5px] text-[#4A7A94] mt-1 bg-[#F7F8F9] border border-[#E5E7EB] rounded-md px-2.5 py-1.5 font-mono break-all leading-relaxed">
                        {JSON.stringify(ev.metadata)}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {detailTab === "content" && (
          <>
            <div className="mb-3.5">
              <div className="text-[11.5px] font-medium text-[#8BAFC0] uppercase tracking-[0.06em] mb-2">
                Contenu envoyé
              </div>
              <div className="bg-[#F7F8F9] border border-[#E5E7EB] rounded-md p-[12px_14px] text-[12.5px] text-[#0D2137] leading-[1.65] whitespace-pre-wrap">
                {activeMsg.content || "—"}
              </div>
            </div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11.5px] font-medium text-[#8BAFC0] uppercase tracking-[0.06em]">
                Méta
              </div>
            </div>
            <div className="flex items-start justify-between py-2 border-b border-[#E5E7EB]">
              <span className="text-[11.5px] text-[#8BAFC0] shrink-0 mr-3 pt-[1px]">
                Taille
              </span>
              <span className="text-[12.5px] text-[#0D2137] text-right break-all">
                {(activeMsg.content || "").length} chars
              </span>
            </div>
            <div className="flex items-start justify-between py-2 border-b border-[#E5E7EB]">
              <span className="text-[11.5px] text-[#8BAFC0] shrink-0 mr-3 pt-[1px]">
                Segments SMS
              </span>
              <span className="text-[12.5px] text-[#0D2137] text-right break-all">
                {chId.includes("sms")
                  ? Math.ceil((activeMsg.content || "").length / 160) +
                    " segment(s)"
                  : "N/A"}
              </span>
            </div>
            <div className="flex items-start justify-between py-2">
              <span className="text-[11.5px] text-[#8BAFC0] shrink-0 mr-3 pt-[1px]">
                Template
              </span>
              <span className="text-[12.5px] text-right break-all text-[#2E8FAD] cursor-pointer">
                {activeMsg.templateId || "N/A"}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
