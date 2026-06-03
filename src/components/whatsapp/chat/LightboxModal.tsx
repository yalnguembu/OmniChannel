import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface LightboxModalProps {
  open: boolean;
  type: 'image' | 'video' | null;
  src: string;
  caption?: string;
  onClose: () => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  open,
  type,
  src,
  caption,
  onClose,
}) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[1000] bg-black/90 flex flex-col items-center justify-center gap-4 p-6"
          onClick={onClose}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            onClick={onClose}
          >
            <X size={20} />
          </button>

          {type === 'image' && (
            <img
              src={src}
              alt={caption || ''}
              className="max-w-[92vw] max-h-[88vh] object-contain rounded"
              onClick={(e) => e.stopPropagation()}
            />
          )}
          {type === 'video' && (
            <video
              src={src}
              controls
              autoPlay
              className="max-w-[92vw] max-h-[88vh] rounded outline-none"
              onClick={(e) => e.stopPropagation()}
            />
          )}
          {caption && (
            <p className="text-white/75 text-[13px] max-w-[500px] text-center">{caption}</p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
