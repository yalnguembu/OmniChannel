import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ArrowLeft, Package, UserPlus, Database, Save } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { AttributeManager, type AttributeDefinition } from './AttributeManager'
import { MappingManager } from './MappingManager'
import { cn } from '@/lib/utils'
import type { ProductModel } from '@/models/product.model'

interface ProductWizardProps {
  isOpen: boolean
  onClose: () => void
  editingProduct: ProductModel | null
  onSubmit: (data: any) => void 
  isPending: boolean
}

const wizardSteps = [
  { id: 'general', title: 'Infos générales', icon: Package },
  { id: 'attributes', title: 'Attributs Clients', icon: UserPlus },
  { id: 'mappings', title: 'Mapping des Données', icon: Database },
]

export function ProductWizard({ isOpen, onClose, editingProduct, onSubmit, isPending }: ProductWizardProps) {
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'draft' as 'active' | 'inactive' | 'paused' | 'draft',
    clientAttributes: [] as AttributeDefinition[],
    clientMappingConfiguration: {} as Record<string, string>,
  })

  useEffect(() => {
    if (isOpen) {
      if (editingProduct) {
        setFormData({
          name: editingProduct.name,
          description: editingProduct.description || '',
          status: editingProduct.status || 'draft',
          clientAttributes: editingProduct.attributes || [],
          clientMappingConfiguration: editingProduct.mapping || {},
        })
      } else {
        setFormData({
          name: '',
          description: '',
          status: 'draft',
          clientAttributes: [],
          clientMappingConfiguration: {},
        })
      }
      setStep(0)
    }
  }, [isOpen, editingProduct])

  const handleNext = () => {
    if (step < wizardSteps.length - 1) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 0) setStep(step - 1)
  }

  const handleSave = () => {
    onSubmit({
      ...formData,
      clientAttributes: JSON.stringify(formData.clientAttributes),
      clientMappingConfiguration: JSON.stringify(formData.clientMappingConfiguration),
    })
  }

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={editingProduct ? `Modifier ${editingProduct.name}` : "Nouveau produit"}
      subtitle={editingProduct ? `ID: ${editingProduct.id}` : "Configurez votre espace omnicanal"}
      size="xl"
      footer={null}
    >
      <div className="flex flex-col h-[75vh]">
        {/* Wizard Header */}
        <div className="px-8 py-6 border-b border-[#E5E7EB] bg-[#FAFBFC]">
          <div className="flex items-center justify-between gap-4 max-w-[900px] mx-auto w-full">
            {wizardSteps.map((s, i) => {
              const Icon = s.icon
              const isActive = i === step
              const isCompleted = i < step
              return (
                <React.Fragment key={s.id}>
                  <div 
                    className={cn(
                      "flex items-center gap-3 transition-all duration-300",
                      isActive ? "opacity-100 scale-105" : "opacity-40"
                    )}
                  >
                    <div className={cn(
                      "w-11 h-11 rounded-[14px] flex items-center justify-center transition-all border-2",
                      isActive ? "bg-[#0D2137] border-[#0D2137] text-white shadow-lg" : 
                      isCompleted ? "bg-[#2E8FAD] border-[#2E8FAD] text-white" : "bg-white border-[#E5E7EB] text-[#8BAFC0]"
                    )}>
                      {isCompleted ? <Check size={20} /> : <Icon size={20} />}
                    </div>
                    <div className="hidden lg:block">
                      <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-[#8BAFC0] mb-0.5">Étape {i + 1}</p>
                      <p className="text-[14.5px] font-bold text-[#0D2137] whitespace-nowrap">{s.title}</p>
                    </div>
                  </div>
                  {i < wizardSteps.length - 1 && (
                    <div className={cn(
                      "flex-1 h-[2px] hidden md:block mx-2",
                      isCompleted ? "bg-[#2E8FAD]" : "bg-[#E5E7EB]"
                    )} />
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </div>

        {/* Wizard Body */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12 bg-white scrollbar-custom">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="h-full"
            >
              {step === 0 && (
                <div className="space-y-7 max-w-[600px] mx-auto py-4">
                  <div className="bg-[#E8F4F8]/30 p-5 rounded-[16px] border border-[#2E8FAD]/10 mb-8">
                    <p className="text-[13px] text-[#1B5E82] leading-relaxed">
                      Le produit est l'unité centrale de votre configuration. Il définit quels attributs vos clients posséderont et comment ils seront mappés.
                    </p>
                  </div>
                  <Input
                    label="Nom du produit *"
                    placeholder="ex: Canal Boutique E-commerce"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      label="Statut initial"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      options={[
                        { value: 'active', label: 'Actif' },
                        { value: 'paused', label: 'En pause' },
                        { value: 'draft', label: 'Brouillon' },
                      ]}
                    />
                  </div>
                  <Textarea
                    label="Description"
                    placeholder="À quoi sert cet espace ? (ex: Gestion des commandes et SAV)"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="min-h-[140px]"
                  />
                </div>
              )}

              {step === 1 && (
                <div className="max-w-[900px] mx-auto h-full">
                  <AttributeManager 
                    attributes={formData.clientAttributes}
                    onChange={(attrs) => setFormData({ ...formData, clientAttributes: attrs })}
                  />
                </div>
              )}

              {step === 2 && (
                <div className="max-w-[800px] mx-auto h-full">
                  <MappingManager 
                    attributes={formData.clientAttributes}
                    mappings={formData.clientMappingConfiguration}
                    onChange={(maps) => setFormData({ ...formData, clientMappingConfiguration: maps })}
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Wizard Footer */}
        <div className="px-8 py-5 border-t border-[#E5E7EB] bg-[#FAFBFC] flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
          <Button 
            variant="secondary" 
            onClick={handleBack} 
            disabled={step === 0}
            className="gap-2 px-6"
          >
            <ArrowLeft size={16} /> Précédent
          </Button>

          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose} disabled={isPending}>Annuler</Button>
            {step < wizardSteps.length - 1 ? (
              <Button 
                variant="primary" 
                onClick={handleNext}
                disabled={step === 0 && !formData.name.trim()}
                className="px-8"
              >
                Continuer
              </Button>
            ) : (
              <Button 
                variant="primary" 
                onClick={handleSave}
                loading={isPending}
                className="gap-2 px-8 shadow-lg shadow-[#2E8FAD]/20"
              >
                <Save size={16} /> {editingProduct ? "Enregistrer les modifications" : "Finaliser la création"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}
