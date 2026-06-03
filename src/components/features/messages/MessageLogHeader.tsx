import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Filter } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import {
  getApiChannelDropdownOptions,
  getApiCampaignDropdownOptions,
} from "@/shared/api/generated/@tanstack/react-query.gen";

export function MessageLogHeader({
  totalCount,
  search,
  onSearchChange,
  filterOptions,
  currentFilter,
  onFilterChange,
  filteredCount,
  createFrom,
  setCreateFrom,
  createTo,
  setCreateTo,
  sort,
  setSort,
  sortOrder,
  setSortOrder,
  channelId,
  setChannelId,
  campaignId,
  setCampaignId,
  pageSize,
  setPageSize,
}: {
  totalCount: number;
  search: string;
  onSearchChange: (v: string) => void;
  filterOptions: { value: string; label: string }[];
  currentFilter: string;
  onFilterChange: (v: string) => void;
  filteredCount: number;
  createFrom: string;
  setCreateFrom: (v: string) => void;
  createTo: string;
  setCreateTo: (v: string) => void;
  sort: string;
  setSort: (v: string) => void;
  sortOrder: string;
  setSortOrder: (v: string) => void;
  channelId: string;
  setChannelId: (v: string) => void;
  campaignId: string;
  setCampaignId: (v: string) => void;
  pageSize: number;
  setPageSize: (v: number) => void;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: channelData } = useQuery({
    ...getApiChannelDropdownOptions(),
  });
  const channels = channelData?.data || [];

  const { data: campaignData } = useQuery({
    ...getApiCampaignDropdownOptions(),
  });
  const campaigns = campaignData?.data || [];

  return (
    <>
      <div className="flex items-center gap-2 p-3 px-5 border-b border-[#E5E7EB] bg-white shrink-0 flex-wrap">
        <div className="flex items-center gap-2 px-3 bg-white border border-[#E5E7EB] rounded-full h-[34px] w-[220px] focus-within:border-[#2E8FAD] focus-within:ring-2 focus-within:ring-[#2E8FAD]/10 transition-colors">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="5" cy="5" r="3.5" stroke="#8BAFC0" strokeWidth="1.1" />
            <path
              d="M8 8l2.5 2.5"
              stroke="#8BAFC0"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
          <input
            placeholder="ID, destinataire, contenu…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full border-none outline-none bg-transparent text-[12.5px] text-[#0D2137] placeholder:text-[#8BAFC0]"
          />
        </div>

        <div className="w-[1px] h-[18px] bg-[#E5E7EB] shrink-0 mx-1"></div>

        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            className={`text-[12px] px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
              currentFilter === opt.value
                ? "bg-[#0D2137] text-white border-[#0D2137] font-medium"
                : "border-[#E5E7EB] bg-transparent text-[#4A7A94] hover:bg-[#F0F2F4]"
            }`}
            onClick={() => onFilterChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}

        <div className="ml-auto flex gap-2 items-center">
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-[12px] font-normal px-3 py-[5px] rounded-full bg-white text-[#0D2137] border border-[#E5E7EB] cursor-pointer transition-colors hover:bg-[#F0F2F4] whitespace-nowrap inline-flex items-center gap-1.5"
          >
            <Filter size={12} strokeWidth={1.5} />
            Filtres
          </button>
          
          <button
            className="text-[12px] font-normal px-3 py-[5px] rounded-full bg-white text-[#0D2137] border border-[#E5E7EB] cursor-pointer transition-colors hover:bg-[#F0F2F4] whitespace-nowrap inline-flex items-center gap-1.5"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M2 9V3a1 1 0 011-1h5.5L10 4.5V9a1 1 0 01-1 1H3a1 1 0 01-1-1z"
                stroke="currentColor"
                strokeWidth="1.1"
              />
              <path d="M6.5 2v2.5H10" stroke="currentColor" strokeWidth="1.1" />
            </svg>
            Exporter
          </button>
          <span className="text-[12px] text-[#8BAFC0] flex items-center ml-1">
            {filteredCount.toLocaleString("fr")} messages
          </span>
        </div>
      </div>

      <Modal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Filtres avancés" 
        subtitle="Affiner la liste des messages"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12.5px] font-medium text-[#0D2137] mb-1.5">Canal</label>
              <select
                value={channelId}
                onChange={(e) => setChannelId(e.target.value)}
                className="w-full text-[13px] px-3 py-2 border border-[#E5E7EB] rounded-lg bg-white text-[#0D2137] outline-none focus:border-[#2E8FAD] transition-colors"
              >
                <option value="">Tous les canaux</option>
                {channels.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-[12.5px] font-medium text-[#0D2137] mb-1.5">Campagne</label>
              <select
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                className="w-full text-[13px] px-3 py-2 border border-[#E5E7EB] rounded-lg bg-white text-[#0D2137] outline-none focus:border-[#2E8FAD] transition-colors"
              >
                <option value="">Toutes les campagnes</option>
                {campaigns.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12.5px] font-medium text-[#0D2137] mb-1.5">Date de début</label>
              <input 
                type="date" 
                value={createFrom} 
                onChange={e => setCreateFrom(e.target.value)} 
                className="w-full text-[13px] px-3 py-2 border border-[#E5E7EB] rounded-lg bg-white text-[#0D2137] outline-none focus:border-[#2E8FAD] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[12.5px] font-medium text-[#0D2137] mb-1.5">Date de fin</label>
              <input 
                type="date" 
                value={createTo} 
                onChange={e => setCreateTo(e.target.value)} 
                className="w-full text-[13px] px-3 py-2 border border-[#E5E7EB] rounded-lg bg-white text-[#0D2137] outline-none focus:border-[#2E8FAD] transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12.5px] font-medium text-[#0D2137] mb-1.5">Trier par</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full text-[13px] px-3 py-2 border border-[#E5E7EB] rounded-lg bg-white text-[#0D2137] outline-none focus:border-[#2E8FAD] transition-colors"
              >
                <option value="createdAt">Date de création</option>
                <option value="sentAt">Date d'envoi</option>
                <option value="deliveredAt">Date de livraison</option>
                <option value="readAt">Date de lecture</option>
                <option value="status">Statut</option>
                <option value="channelName">Nom du canal</option>
                <option value="campaignName">Nom de campagne</option>
                <option value="direction">Direction</option>
                <option value="messageType">Type de message</option>
              </select>
            </div>
            <div>
              <label className="block text-[12.5px] font-medium text-[#0D2137] mb-1.5">Ordre</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full text-[13px] px-3 py-2 border border-[#E5E7EB] rounded-lg bg-white text-[#0D2137] outline-none focus:border-[#2E8FAD] transition-colors"
              >
                <option value="desc">Décroissant</option>
                <option value="asc">Croissant</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[12.5px] font-medium text-[#0D2137] mb-1.5">Éléments par page</label>
            <select
              value={pageSize.toString()}
              onChange={(e) => setPageSize(parseInt(e.target.value, 10))}
              className="w-full text-[13px] px-3 py-2 border border-[#E5E7EB] rounded-lg bg-white text-[#0D2137] outline-none focus:border-[#2E8FAD] transition-colors"
            >
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="250">250</option>
            </select>
          </div>
        </div>
      </Modal>
    </>
  );
}
