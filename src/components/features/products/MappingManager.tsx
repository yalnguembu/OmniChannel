import React from 'react'
import { Plus, Trash2, ArrowRight } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import type { AttributeDefinition } from './AttributeManager'

interface MappingManagerProps {
  attributes: AttributeDefinition[]
  mappings: Record<string, string>
  onChange: (mappings: Record<string, string>) => void
}

export function MappingManager({ attributes, mappings, onChange }: MappingManagerProps) {
  const addMapping = () => {
    const availableAttr = attributes.find(a => !mappings[a.key])
    if (availableAttr) {
      onChange({ ...mappings, [availableAttr.key]: '' })
    }
  }

  const removeMapping = (key: string) => {
    const newMappings = { ...mappings }
    delete newMappings[key]
    onChange(newMappings)
  }

  const updateMapping = (key: string, value: string) => {
    onChange({ ...mappings, [key]: value })
  }

  const mappingEntries = Object.entries(mappings)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[14px] font-bold text-[#0D2137]">Mapping des données</h3>
          <p className="text-[11.5px] text-[#8BAFC0]">Lien entre vos attributs et les colonnes d'import</p>
        </div>
        <button
          type="button"
          onClick={addMapping}
          disabled={attributes.length === 0 || mappingEntries.length >= attributes.length}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#2E8FAD] bg-[#E8F4F8] rounded-full hover:bg-[#D1E9F1] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus size={14} /> Ajouter un mapping
        </button>
      </div>

      <div className="space-y-2">
        {attributes.length === 0 ? (
          <div className="p-8 border-2 border-dashed border-[#E5E7EB] rounded-[16px] text-center bg-[#FBFBFC]">
            <p className="text-[13px] text-[#8BAFC0]">Veuillez d'abord définir des attributs pour pouvoir les mapper.</p>
          </div>
        ) : mappingEntries.length === 0 ? (
          <div className="p-8 border-2 border-dashed border-[#E5E7EB] rounded-[16px] text-center bg-[#FBFBFC]">
            <p className="text-[13px] text-[#8BAFC0]">Aucun mapping défini. Cliquez sur "Ajouter un mapping".</p>
          </div>
        ) : (
          <div className="space-y-2">
            {mappingEntries.map(([key, value]) => {
              const attr = attributes.find(a => a.key === key)
              return (
                <div key={key} className="flex items-center gap-3 p-3 bg-white border border-[#E5E7EB] rounded-[14px] group">
                  <div className="flex-1">
                    <Select
                      value={key}
                      onChange={(e) => {
                        const newKey = e.target.value
                        if (newKey === key) return
                        const newMappings = { ...mappings }
                        delete newMappings[key]
                        newMappings[newKey] = value
                        onChange(newMappings)
                      }}
                      options={attributes.map(a => ({ 
                        value: a.key, 
                        label: a.label || a.key,
                        disabled: !!mappings[a.key] && a.key !== key 
                      }))}
                    />
                  </div>
                  <ArrowRight size={16} className="text-[#8BAFC0] shrink-0" />
                  <div className="flex-[1.5]">
                    <Input
                      placeholder="Nom de colonne (ex: FIRST_NAME) ou Index (0, 1...)"
                      value={value}
                      onChange={(e) => updateMapping(key, e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMapping(key)}
                    className="p-2 text-[#8BAFC0] hover:text-[#DC2626] transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
