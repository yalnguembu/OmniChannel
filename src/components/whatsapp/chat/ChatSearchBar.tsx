import React, { useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface ChatSearchBarProps {
  visible: boolean;
  value: string;
  onChange: (v: string) => void;
  onClose: () => void;
}

export const ChatSearchBar: React.FC<ChatSearchBarProps> = ({
  visible,
  value,
  onChange,
  onClose,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (visible) inputRef.current?.focus();
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 48, opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="bg-wa-input-bg border-b border-wa-border flex items-center px-4 gap-3 overflow-hidden shrink-0"
        >
          <Search size={16} className="text-wa-icon" />
          <input
            ref={inputRef}
            type="search"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Rechercher dans la conversation..."
            className="flex-1 bg-transparent outline-none border-none text-sm text-wa-text placeholder:text-wa-muted"
          />
          <button
            onClick={onClose}
            className="text-wa-icon hover:text-wa-text transition-colors p-1 rounded-full hover:bg-wa-active"
          >
            <X size={18} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
