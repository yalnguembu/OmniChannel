import { useMessageLogViewModel } from "@/hooks/useMessageLogViewModel";
import { MessageLogHeader } from "@/components/features/messages/MessageLogHeader";
import { MessageLogTable } from "@/components/features/messages/MessageLogTable";
import { MessageDetailPanel } from "@/components/features/messages/MessageDetailPanel";

export default function MessagesPage() {
  const vm = useMessageLogViewModel();

  return (
    <main className="flex flex-col h-screen overflow-hidden font-sans bg-[#F4F5F6]">
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-white">
          {/* KPI strip */}
          <div className="grid grid-cols-5 gap-2.5 p-4 px-5 bg-white border-b border-[#E5E7EB] shrink-0">
            <div className="p-3 px-3.5 bg-[#F7F8F9] rounded-[10px] border border-[#E5E7EB]">
              <div className="text-[10.5px] text-[#8BAFC0] uppercase tracking-[0.06em] mb-1.5">
                Envoyés (24h)
              </div>
              <div className="text-[20px] font-semibold text-[#0D2137] tracking-[-0.025em] leading-none">
                3 847
              </div>
              <div className="text-[11px] mt-1 flex items-center gap-[3px] text-[#16A34A]">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M2 7l2-2 1.5 1.5L8 3"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                +18%
              </div>
            </div>
            <div className="p-3 px-3.5 bg-[#F7F8F9] rounded-[10px] border border-[#E5E7EB]">
              <div className="text-[10.5px] text-[#8BAFC0] uppercase tracking-[0.06em] mb-1.5">
                Livrés
              </div>
              <div className="text-[20px] font-semibold text-[#0D2137] tracking-[-0.025em] leading-none">
                3 614
              </div>
              <div className="text-[11px] mt-1 flex items-center gap-[3px] text-[#16A34A]">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M2 7l2-2 1.5 1.5L8 3"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                93.9%
              </div>
            </div>
            <div className="p-3 px-3.5 bg-[#F7F8F9] rounded-[10px] border border-[#E5E7EB]">
              <div className="text-[10.5px] text-[#8BAFC0] uppercase tracking-[0.06em] mb-1.5">
                Ouverts
              </div>
              <div className="text-[20px] font-semibold text-[#0D2137] tracking-[-0.025em] leading-none">
                1 584
              </div>
              <div className="text-[11px] mt-1 flex items-center gap-[3px] text-[#8BAFC0]">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M2 5h6"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
                43.8%
              </div>
            </div>
            <div className="p-3 px-3.5 bg-[#F7F8F9] rounded-[10px] border border-[#E5E7EB]">
              <div className="text-[10.5px] text-[#8BAFC0] uppercase tracking-[0.06em] mb-1.5">
                Échoués
              </div>
              <div className="text-[20px] font-semibold text-[#0D2137] tracking-[-0.025em] leading-none">
                233
              </div>
              <div className="text-[11px] mt-1 flex items-center gap-[3px] text-[#DC2626]">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M2 3l2 2 1.5-1.5L8 7"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                6.1%
              </div>
            </div>
            <div className="p-3 px-3.5 bg-[#F7F8F9] rounded-[10px] border border-[#E5E7EB]">
              <div className="text-[10.5px] text-[#8BAFC0] uppercase tracking-[0.06em] mb-1.5">
                Coût (24h)
              </div>
              <div className="text-[20px] font-semibold text-[#0D2137] tracking-[-0.025em] leading-none">
                1 540{" "}
                <span className="text-[12px] font-normal text-[#8BAFC0]">
                  XAF
                </span>
              </div>
              <div className="text-[11px] mt-1 flex items-center gap-[3px] text-[#8BAFC0]">
                0.40 XAF / msg
              </div>
            </div>
          </div>

          <MessageLogHeader
          // @ts-expect-error
            totalCount={vm.totalCount}
            search={vm.search}
            onSearchChange={vm.handleSearch}
            filterOptions={[
              { value: "all", label: "Tous" },
              { value: "delivered", label: "Livrés" },
              { value: "opened", label: "Ouverts" },
              { value: "failed", label: "Échoués" },
              { value: "pending", label: "En attente" },
            ]}
            currentFilter={vm.filter}
            onFilterChange={vm.handleFilter}
            filteredCount={vm.messages.length}
            createFrom={vm.createFrom}
            setCreateFrom={vm.setCreateFrom}
            createTo={vm.createTo}
            setCreateTo={vm.setCreateTo}
            sort={vm.sort}
            setSort={vm.setSort}
            sortOrder={vm.sortOrder}
            setSortOrder={vm.setSortOrder}
            channelId={vm.channelId}
            setChannelId={vm.setChannelId}
            campaignId={vm.campaignId}
            setCampaignId={vm.setCampaignId}
            pageSize={vm.pageSize}
            setPageSize={vm.setPageSize}
          />

          <MessageLogTable
          // @ts-expect-error
            messages={vm.messages}
            isLoading={vm.isLoading}
            activeMsgId={vm.activeMsg?.id}
            onSelectMessage={(m) => vm.handleSelectMessage(m)}
            page={vm.page}
            pageSize={vm.pageSize}
          // @ts-expect-error
            totalCount={vm.totalCount}
            onPageChange={vm.setPage}
          />
        </div>

        <MessageDetailPanel
          activeMsg={vm.activeMsg}
          detailTab={vm.detailTab}
          // @ts-expect-error
          setDetailTab={vm.setDetailTab}
          events={vm.events}
          isEventsLoading={vm.isEventsLoading}
          onClose={() => vm.setActiveMsg(null)}
        />
      </div>
    </main>
  );
}
