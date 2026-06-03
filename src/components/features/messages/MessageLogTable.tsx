import type { MessageDto } from "@/shared/api/types";
import { formatRelative } from "@/lib/date";
import { Pagination } from "@/components/data-table/DataTable";
import { chMeta, statusMeta } from "./constant";

type MessageLogPageProps = {
  messages: MessageDto[];
  isLoading: boolean;
  activeMsgId?: string;
  onSelectMessage: (m: MessageDto) => void;
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (p: number) => void;
};

export function MessageLogTable({
  messages,
  isLoading,
  activeMsgId,
  onSelectMessage,
  page,
  pageSize,
  totalCount,
  onPageChange,
}: MessageLogPageProps) {
  return (
    <>
      <div className="flex-1 overflow-y-auto scrollbar-custom">
        <table className="w-full border-collapse table-fixed">
          <colgroup>
            <col className="w-[36px]" />
            <col className="w-[130px]" />
            <col className="w-[150px]" />
            <col />
            <col className="w-[90px]" />
            <col className="w-[110px]" />
            <col className="w-[130px]" />
            <col className="w-[110px]" />
          </colgroup>
          <thead>
            <tr className="h-[38px] bg-[#F7F8F9] sticky top-0 z-10 border-b border-[#E5E7EB]">
              <th className="px-3.5 text-left text-[10.5px] font-semibold text-[#8BAFC0] uppercase tracking-[0.06em] whitespace-nowrap"></th>
              <th className="px-3.5 text-left text-[10.5px] font-semibold text-[#8BAFC0] uppercase tracking-[0.06em] whitespace-nowrap">
                ID message
              </th>
              <th className="px-3.5 text-left text-[10.5px] font-semibold text-[#8BAFC0] uppercase tracking-[0.06em] whitespace-nowrap">
                Destinataire
              </th>
              <th className="px-3.5 text-left text-[10.5px] font-semibold text-[#8BAFC0] uppercase tracking-[0.06em] whitespace-nowrap">
                Campagne · Contenu
              </th>
              <th className="px-3.5 text-left text-[10.5px] font-semibold text-[#8BAFC0] uppercase tracking-[0.06em] whitespace-nowrap">
                Canal
              </th>
              <th className="px-3.5 text-left text-[10.5px] font-semibold text-[#8BAFC0] uppercase tracking-[0.06em] whitespace-nowrap">
                Statut
              </th>
              <th className="px-3.5 text-left text-[10.5px] font-semibold text-[#8BAFC0] uppercase tracking-[0.06em] whitespace-nowrap">
                Envoyé le
              </th>
              <th className="px-3.5 text-left text-[10.5px] font-semibold text-[#8BAFC0] uppercase tracking-[0.06em] whitespace-nowrap">
                Coût
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={8}
                  className="text-center py-4 text-[12.5px] text-[#4A7A94]"
                >
                  Chargement...
                </td>
              </tr>
            ) : messages.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="text-center py-4 text-[#8BAFC0] text-[12.5px]"
                >
                  Aucun message trouvé
                </td>
              </tr>
            ) : (
              messages.map((m, i) => {
                let cm = chMeta.sms;
                if (m.channelCode?.toLowerCase() === "email") cm = chMeta.email;
                if (m.channelCode?.toLowerCase() === "whatsapp")
                  cm = chMeta.whatsapp;
                if (m.channelCode?.toLowerCase() === "push") cm = chMeta.push;

                const st =
                  statusMeta[m.status.toLowerCase()] || statusMeta.default;

                return (
                  <tr
                    key={m.id}
                    className={`h-[48px] border-b border-[#E5E7EB] transition-colors cursor-pointer animate-in fade-in slide-in-from-left-1 duration-200 fill-mode-both hover:bg-[#F7F8F9] last:border-b-0 ${m.id === activeMsgId ? "bg-[#E8F4F8]" : ""}`}
                    style={{ animationDelay: `${Math.min(i * 0.02, 0.5)}s` }}
                    onClick={() => onSelectMessage(m)}
                  >
                    <td className="px-3.5 align-middle">
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 border border-black/5"
                        style={{ background: cm.bg }}
                      >
                        {cm.name === "SMS" ? (
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 13 13"
                            fill="none"
                          >
                            <rect
                              x="1"
                              y="2.5"
                              width="11"
                              height="7.5"
                              rx="1.5"
                              stroke={cm.c}
                              strokeWidth="1.1"
                            />
                            <path
                              d="M4 6h5M4 8h3"
                              stroke={cm.c}
                              strokeWidth="1"
                              strokeLinecap="round"
                            />
                          </svg>
                        ) : cm.name === "Email" ? (
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 13 13"
                            fill="none"
                          >
                            <rect
                              x="1"
                              y="2.5"
                              width="11"
                              height="8"
                              rx="1.5"
                              stroke={cm.c}
                              strokeWidth="1.1"
                            />
                            <path
                              d="M1 4l5.5 4L12 4"
                              stroke={cm.c}
                              strokeWidth="1.1"
                            />
                          </svg>
                        ) : cm.name === "WhatsApp" ? (
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 13 13"
                            fill="none"
                          >
                            <circle
                              cx="6.5"
                              cy="6.5"
                              r="5"
                              stroke={cm.c}
                              strokeWidth="1.1"
                            />
                            <path
                              d="M4.5 8.5c.5-1.5 3-3.5 4-3-.5 1-2 2.5-4 3z"
                              stroke={cm.c}
                              strokeWidth="1"
                              strokeLinecap="round"
                            />
                          </svg>
                        ) : (
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 13 13"
                            fill="none"
                          >
                            <path
                              d="M6.5 1.5a3.5 3.5 0 013.5 3.5c0 2.5 1.5 3 1.5 3h-10s1.5-.5 1.5-3a3.5 3.5 0 013.5-3.5z"
                              stroke={cm.c}
                              strokeWidth="1.1"
                            />
                            <path
                              d="M5 10v.5a1.5 1.5 0 003 0V10"
                              stroke={cm.c}
                              strokeWidth="1.1"
                            />
                          </svg>
                        )}
                      </div>
                    </td>
                    <td className="px-3.5 text-[12.5px] text-[#0D2137] align-middle truncate font-mono text-[11px] text-[#4A7A94]">
                      {m.id.slice(0, 10).toUpperCase()}
                    </td>
                    <td className="px-3.5 text-[12.5px] text-[#0D2137] align-middle truncate">
                      <div className="font-medium">
                        {`${m.clientFirstName} ${m.clientLastName}` || "—"}
                      </div>
                      <div className="text-[11px] text-[#8BAFC0] truncate max-w-[140px]">
                        {m.recipientAddress || ""}
                      </div>
                    </td>
                    <td className="px-3.5 text-[12.5px] text-[#0D2137] align-middle truncate">
                      <div className="font-medium truncate">
                        {m.subject || "-"}
                      </div>
                      <div className="text-[11.5px] text-[#8BAFC0] truncate">
                        {(m.content || "").substring(0, 55)}…
                      </div>
                    </td>
                    <td className="px-3.5 text-[12.5px] text-[#0D2137] align-middle truncate">
                      <span
                        className="text-[11.5px] font-medium"
                        style={{ color: cm.c }}
                      >
                        {cm.name}
                      </span>
                    </td>
                    <td className="px-3.5 text-[12.5px] text-[#0D2137] align-middle truncate">
                      <div className="flex items-center gap-1.5">
                        <div
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
                        ></div>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 border rounded-[4px] text-[11px] font-medium ${st.cls}`}
                        >
                          {st.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-3.5 text-[12px] text-[#8BAFC0] align-middle truncate">
                      {formatRelative(m.sentAt)}
                    </td>
                    <td className="px-3.5 text-[11px] text-[#4A7A94] align-middle truncate font-mono">
                      {m.cost != null ? m.cost.toFixed(2) : "—"} XAF
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#E5E7EB] bg-[#F7F8F9] shrink-0">
        <span className="text-[12px] text-[#8BAFC0]">
          Affichage {(page - 1) * pageSize + 1}–
          {Math.min(page * pageSize, totalCount)} sur{" "}
          <span className="text-[#0D2137] font-medium">
            {totalCount.toLocaleString("fr")}
          </span>
        </span>
        <Pagination
          total={totalCount}
          pageSize={pageSize}
          page={page}
          onChange={onPageChange}
        />
      </div>
    </>
  );
}
