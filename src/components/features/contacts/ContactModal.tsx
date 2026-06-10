import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { User, Mail, Phone, MapPin, ShieldCheck, Globe } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { clientSchema } from '@/lib/validators'
import type { ClientModel } from '@/models/client.model'
import type { CreateClientRequest } from '@/shared/api/generated/types.gen'
import type { z } from 'zod'

type ClientForm = z.infer<typeof clientSchema>;

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
  editing: ClientModel | null;
  onSubmit: (data: CreateClientRequest) => void;
  loading: boolean;
}

export function ContactModal({ open, onClose, editing, onSubmit, loading }: ContactModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ClientForm>({
    resolver: zodResolver(clientSchema),
  });

  useEffect(() => {
    if (editing) {
      reset({
        firstName: editing.firstName || '',
        lastName: editing.lastName || '',
        email: editing.email || '',
        phone: editing.phone || '',
        city: editing.city || '',
        country: editing.country || '',
        status: editing.status,
      });
    } else {
      reset({ firstName: '', lastName: '', email: '', phone: '', city: '', country: '', status: 'active' });
    }
  }, [editing, reset, open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Modifier le Client' : 'Nouveau Contact'}
      subtitle={editing ? `Édition du profil de ${editing.firstName} ${editing.lastName}` : 'Ajoutez un prospect ou un client à votre base de données'}
      size="lg"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button variant="ghost" onClick={onClose} className="font-bold text-[#8BAFC0]">Annuler</Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit(onSubmit)} 
            loading={loading}
            className="px-8 shadow-lg shadow-[#0D2137]/10 font-bold"
          >
            {editing ? 'Sauvegarder les modifications' : 'Créer le contact'}
          </Button>
        </div>
      }
    >
      <form className="space-y-6 py-2">
        {/* Identité Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2 px-1">
             <User size={14} className="text-[#2E8FAD]" />
             <span className="text-[11px] font-bold text-[#8BAFC0] uppercase tracking-[0.1em]">Identité du Client</span>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <Input 
              label="Prénom *" 
              placeholder="ex: Jean" 
              error={errors.firstName?.message} 
              {...register('firstName')} 
              className="h-11 bg-[#FBFBFC]"
            />
            <Input 
              label="Nom *" 
              placeholder="ex: Dupont" 
              error={errors.lastName?.message} 
              {...register('lastName')} 
              className="h-11 bg-[#FBFBFC]"
            />
          </div>
        </div>

        {/* Contact Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2 px-1 text-[#2E8FAD]">
             <Mail size={14} />
             <span className="text-[11px] font-bold text-[#8BAFC0] uppercase tracking-[0.1em]">Coordonnées</span>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <Input 
              label="Adresse Email" 
              type="email" 
              placeholder="jean.dupont@email.com"
              error={errors.email?.message} 
              {...register('email')} 
              prefixIcon={<Mail size={14} className="text-[#8BAFC0]" />}
              className="h-11 bg-[#FBFBFC]"
            />
            <Input 
              label="Numéro de Téléphone *" 
              placeholder="+237 6..."
              error={errors.phone?.message} 
              {...register('phone')} 
              prefixIcon={<Phone size={14} className="text-[#8BAFC0]" />}
              className="h-11 bg-[#FBFBFC]"
            />
          </div>
        </div>

        {/* Localisation & Statut */}
        <div className="space-y-4">
           <div className="flex items-center gap-2 mb-2 px-1 text-[#2E8FAD]">
             <MapPin size={14} />
             <span className="text-[11px] font-bold text-[#8BAFC0] uppercase tracking-[0.1em]">Détails du Compte</span>
          </div>
          <div className="grid grid-cols-3 gap-5">
            <Input 
              label="Ville" 
              placeholder="Douala"
              {...register('city')} 
              className="h-11 bg-[#FBFBFC]"
              prefixIcon={<MapPin size={14} className="text-[#8BAFC0]" />}
            />
            <Input 
              label="Pays" 
              placeholder="Cameroun"
              {...register('country')} 
              className="h-11 bg-[#FBFBFC]"
              prefixIcon={<Globe size={14} className="text-[#8BAFC0]" />}
            />
            <Select
              label="Statut du Compte"
              options={[
                { value: 'active', label: 'Actif' },
                { value: 'inactive', label: 'Inactif' },
                { value: 'blocked', label: 'Bloqué / Spam' },
              ]}
              {...register('status')}
              className="h-11 bg-[#FBFBFC]"
              prefixIcon={<ShieldCheck size={14} className="text-[#8BAFC0]" />}
            />
          </div>
        </div>
      </form>
    </Modal>
  )
}
