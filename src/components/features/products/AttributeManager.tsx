import React from 'react'
import { Plus, Trash2, Key, Type, Database, ShieldCheck } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { cn } from '@/lib/utils'

export interface AttributeDefinition {
  key: string
  label: string
  datatype: 'string' | 'number' | 'boolean' | 'date'
  validationRegex?: string
}

interface AttributeManagerProps {
  attributes: AttributeDefinition[]
  onChange: (attributes: AttributeDefinition[]) => void
}

export function AttributeManager({ attributes, onChange }: AttributeManagerProps) {
  const addAttribute = () => {
    onChange([...attributes, { key: '', label: '', datatype: 'string' }])
  }

  const removeAttribute = (index: number) => {
    onChange(attributes.filter((_, i) => i !== index))
  }

  const updateAttribute = (index: number, updates: Partial<AttributeDefinition>) => {
    const newAttrs = [...attributes]
    newAttrs[index] = { ...newAttrs[index], ...updates }
    onChange(newAttrs)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[14px] font-bold text-[#0D2137]">Définition des attributs</h3>
          <p className="text-[11.5px] text-[#8BAFC0]">Créez les champs personnalisés pour vos clients</p>
        </div>
        <button
          type="button"
          onClick={addAttribute}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#2E8FAD] bg-[#E8F4F8] rounded-full hover:bg-[#D1E9F1] transition-colors"
        >
          <Plus size={14} /> Ajouter un attribut
        </button>
      </div>

      <div className="space-y-3">
        {attributes.length === 0 ? (
          <div className="p-8 border-2 border-dashed border-[#E5E7EB] rounded-[16px] text-center">
            <p className="text-[13px] text-[#8BAFC0]">Aucun attribut défini. Cliquez sur "Ajouter" pour commencer.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {attributes.map((attr, index) => (
              <div 
                key={index} 
                className="group relative p-4 bg-white border border-[#E5E7EB] rounded-[18px] hover:border-[#B8CDD8] hover:bg-[#FBFBFC] transition-all"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Input
                    label="Clé (id)"
                    placeholder="ex: loyalty_pts"
                    value={attr.key}
                    onChange={(e) => updateAttribute(index, { key: e.target.value })}
                    className="text-[13px]"
                  />
                  <Input
                    label="Libellé"
                    placeholder="ex: Points Fidélité"
                    value={attr.label}
                    onChange={(e) => updateAttribute(index, { label: e.target.value })}
                    className="text-[13px]"
                  />
                  <Select
                    label="Type de donnée"
                    value={attr.datatype}
                    onChange={(e) => updateAttribute(index, { datatype: e.target.value as any })}
                    options={[
                      { value: 'string', label: 'Texte' },
                      { value: 'number', label: 'Nombre' },
                      { value: 'boolean', label: 'Booléen' },
                      { value: 'date', label: 'Date' },
                    ]}
                  />
                  <Input
                    label="Regex de validation"
                    placeholder="ex: ^[0-9]+$"
                    value={attr.validationRegex}
                    onChange={(e) => updateAttribute(index, { validationRegex: e.target.value })}
                    className="text-[13px]"
                  />
                </div>
                
                <button
                  type="button"
                  onClick={() => removeAttribute(index)}
                  className="absolute -top-2 -right-2 w-7 h-7 bg-white border border-[#E5E7EB] rounded-full flex items-center justify-center text-[#8BAFC0] hover:text-[#DC2626] hover:border-[#DC2626] opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
