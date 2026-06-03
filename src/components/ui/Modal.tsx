import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizes = {
  sm: 'max-w-[420px]',
  md: 'max-w-[520px]',
  lg: 'max-w-[680px]',
  xl: 'max-w-[1000px]',
}

export function Modal({ open, onClose, title, subtitle, children, footer, size = 'md' }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 bg-[#0D2137]/35 flex items-center justify-center z-[200] p-5"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
            className={cn(
              'bg-white rounded-[20px] w-full shadow-[0_24px_64px_rgba(13,33,55,0.18)] flex flex-col max-h-[90vh]',
              sizes[size]
            )}
          >
            <div className="px-6 pt-5 pb-4 border-b border-[#E5E7EB] flex items-start justify-between shrink-0">
              <div>
                <h2 className="text-[16px] font-semibold text-[#0D2137] tracking-tight">{title}</h2>
                {subtitle && <p className="text-[12.5px] text-[#4A7A94] mt-0.5">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-[6px] border border-[#E5E7EB] bg-transparent flex items-center justify-center cursor-pointer text-[#8BAFC0] hover:bg-[#F0F2F4] hover:text-[#0D2137] transition-all shrink-0"
              >
                <X size={12} strokeWidth={1.4} />
              </button>
            </div>
            <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>
            {footer && (
              <div className="px-6 py-3.5 border-t border-[#E5E7EB] bg-[#F7F8F9] flex items-center justify-end gap-2 shrink-0 rounded-b-[20px]">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
