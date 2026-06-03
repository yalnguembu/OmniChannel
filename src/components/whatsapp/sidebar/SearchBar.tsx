import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => (
  <div className="px-3 py-3 bg-wa-sidebar/80 shrink-0">
    <div className="flex items-center gap-2 bg-wa-input-bg rounded-full px-4 py-3 transition-shadow focus-within:shadow-sm">
      <Search size={18} className="text-wa-muted shrink-0" />
      <input
        id="chat-search-input"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Rechercher ou démarrer une discussion"
        className="border-none bg-transparent outline-none flex-1 text-wa-text placeholder:text-wa-muted"
      />
    </div>
  </div>
);
