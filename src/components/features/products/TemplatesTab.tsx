import React from 'react'
import { Eye, FileText, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SearchInput } from '@/components/ui/SearchInput'
import { PageLoader } from '@/components/feedback/PageLoader'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Pagination } from '@/components/data-table/DataTable'
import { TemplateList } from '@/components/features/templates/TemplateList'
import { TemplateDetail } from '@/components/features/templates/TemplateDetail'
import { TemplateModal } from '@/components/features/templates/TemplateModal'
import { useProductTemplates } from '@/hooks/useProductTemplates'

interface TemplatesTabProps {
  productId: string
}

export function TemplatesTab({ productId }: TemplatesTabProps) {
  const vm = useProductTemplates(productId);

  return (
    <div className="flex h-[calc(100vh-280px)] min-h-[500px] border border-[#E5E7EB] rounded-[20px] bg-white overflow-hidden shadow-sm">
      {/* Sidebar List */}
      <div className="w-[340px] border-r border-[#E5E7EB] flex flex-col shrink-0 bg-white">
        <div className="p-5 border-b border-[#F3F4F6]">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-[15px] font-bold text-[#0D2137]">Templates</h3>
            <span className="text-[11px] font-bold text-[#2E8FAD] bg-[#E8F4F8] px-2 py-0.5 rounded-full">{vm.totalCount}</span>
          </div>
          <SearchInput 
            placeholder="Rechercher..." 
            value={vm.search} 
            onChange={(e) => vm.setSearch(e.target.value)} 
            containerClassName="w-full mb-3"
          />
          <Button 
            variant="primary" 
            className="w-full gap-2" 
            size="sm" 
            onClick={() => { vm.setEditingTemplate(null); vm.setIsModalOpen(true) }}
          >
            <Plus size={14} /> Nouveau template
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-custom bg-[#FBFBFC]/50">
          {vm.isLoading ? (
            <div className="py-20"><PageLoader /></div>
          ) : vm.templates.length === 0 ? (
            <div className="py-20 px-8 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-[#F7F8F9] flex items-center justify-center mb-4 text-[#B8CDD8] opacity-50">
                <FileText size={24} />
              </div>
              <p className="text-[13px] font-medium text-[#0D2137]">Aucun template</p>
              <p className="text-[11.5px] text-[#8BAFC0] mt-1">Créez votre premier template pour ce produit.</p>
            </div>
          ) : (
            <TemplateList 
              templates={vm.templates}
              activeId={vm.activeTemplate?.id}
              onSelect={(t) => vm.setActiveTemplateId(t.id)}
            />
          )}
        </div>

        <div className="p-4 border-t border-[#F3F4F6] bg-white">
          <Pagination 
            total={vm.totalCount} 
            pageSize={20} 
            page={vm.page} 
            onChange={vm.setPage} 
          />
        </div>
      </div>

      {/* Detail Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {vm.activeTemplate ? (
          <TemplateDetail
            template={vm.activeTemplate}
            tplChannels={vm.tplChannels}
            channels={vm.channels as any}
            onEdit={vm.setEditingTemplate}
            onDuplicate={vm.handleDuplicate}
            onDelete={() => { /* Logic can be added */ }}
            onToggleChannel={vm.handleToggleChannel}
            onSave={vm.handleSave}
            isSaving={vm.isActionPending}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#F7F8F9]/20 p-12 text-center">
            <div className="w-20 h-20 rounded-[28px] bg-white border border-[#E5E7EB] flex items-center justify-center mb-6 shadow-sm">
              <Eye size={36} className="text-[#B8CDD8] opacity-30" />
            </div>
            <h3 className="text-[18px] font-bold text-[#0D2137]">Sélectionnez un template</h3>
            <p className="text-[14px] text-[#8BAFC0] mt-2 max-w-[300px]">
              Choisissez un template dans la liste de gauche pour voir ses détails ou le modifier.
            </p>
          </div>
        )}
      </div>

      {/* Global Template Modal for Scoped Product */}
      <TemplateModal 
        open={vm.isModalOpen || !!vm.editingTemplate}
        onClose={() => { vm.setIsModalOpen(false); vm.setEditingTemplate(null) }}
        editing={vm.editingTemplate}
        onSubmit={vm.handleSubmit}
        loading={vm.isActionPending}
        products={[]}
      />
    </div>
  )
}
