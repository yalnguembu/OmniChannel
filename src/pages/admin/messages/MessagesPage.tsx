import { MessageSquare, Loader } from "lucide-react";
import { SearchInput } from "@/components/ui/SearchInput";
import { Pagination } from "@/components/data-table/DataTable";
import { statusLabel, cn } from "@/lib/utils";
import { useAdminMessagesViewModel } from "@/hooks/admin/useAdminMessagesViewModel";
import { MessagesTable } from "@/components/features/admin/messages/MessagesTable";
import { JobsTable } from "@/components/features/admin/messages/JobsTable";

const msgTabs = [
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "jobs", label: "Jobs en cours", icon: Loader },
] as const;

export default function MessagesPage() {
  const vm = useAdminMessagesViewModel();

  return (
    <div className="p-7">
      <h1 className="text-[20px] font-semibold text-[#0D2137] tracking-tight mb-5">
        Messagerie globale
      </h1>

      <div className="flex bg-white border border-[#E5E7EB] rounded-[14px] overflow-hidden mb-5">
        {msgTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => vm.setTab(t.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-[13px] border-b-2 transition-all cursor-pointer whitespace-nowrap",
              vm.tab === t.id
                ? "text-[#1B5E82] font-medium border-[#2E8FAD] bg-[#E8F4F8]"
                : "text-[#4A7A94] border-transparent hover:text-[#0D2137] hover:bg-[#F7F8F9]",
            )}
          >
            <t.icon size={13} strokeWidth={1.3} />
            {t.label}
          </button>
        ))}
      </div>

      {vm.tab === "messages" && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[13px] text-[#4A7A94]">
              {vm.msgTotal.toLocaleString("fr")} messages
            </p>
            <SearchInput
              placeholder="ID, destinataire, contenu…"
              value={vm.search}
              onChange={(e) => vm.setSearch(e.target.value)}
              containerClassName="w-64"
            />
          </div>
          <MessagesTable messages={vm.messages} isLoading={vm.loadingMsgs} />
          <Pagination
            total={vm.msgTotal}
            pageSize={vm.pageSize}
            page={vm.page}
            onChange={vm.setPage}
          />
        </>
      )}

      {vm.tab === "jobs" && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[13px] text-[#4A7A94]">
              {vm.jobTotal.toLocaleString("fr")} jobs
            </p>
            <div className="flex gap-2">
              {["running", "pending", "completed", "failed"].map((s) => (
                <div
                  key={s}
                  className="flex items-center gap-1.5 text-[11.5px] text-[#4A7A94]"
                >
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      s === "running"
                        ? "bg-[#2E8FAD]"
                        : s === "completed"
                          ? "bg-[#16A34A]"
                          : s === "failed"
                            ? "bg-[#DC2626]"
                            : "bg-[#D97706]",
                    )}
                  />
                  {vm.jobs.filter((j) => j.status === s).length} {statusLabel(s)}
                </div>
              ))}
            </div>
          </div>
          <JobsTable jobs={vm.jobs} isLoading={vm.loadingJobs} />
          <Pagination
            total={vm.jobTotal}
            pageSize={vm.pageSize}
            page={vm.page}
            onChange={vm.setPage}
          />
        </>
      )}
    </div>
  );
}
