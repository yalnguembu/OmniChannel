import React from 'react';
import { Lock, MessageCircle } from 'lucide-react';

export const ChatPlaceholder: React.FC = () => (
  <div
    className="flex-1 flex flex-col items-center justify-center gap-5 px-6 bg-wa-chat-bg"
  >
    {/* WhatsApp-style icon */}
    <div className="relative flex items-center justify-center">
      <div className="size-[168px] rounded-full bg-wa-border/50 flex items-center justify-center">
        <MessageCircle
          size={80}
          className="text-wa-icon/30"
          strokeWidth={1}
        />
      </div>
    </div>

    <div className="text-center space-y-2 max-w-xs">
      <h2 className="text-3xl font-light text-wa-text">OmniChannel Inbox</h2>
      <p className="text-wa-muted text-sm leading-relaxed">
        Sélectionnez une conversation pour afficher les messages ou démarrez une nouvelle discussion.
      </p>
    </div>

    <div className="flex items-center gap-1.5 text-xs text-wa-muted mt-1">
      <Lock size={12} />
      <span>Vos messages personnels sont chiffrés de bout en bout</span>
    </div>
  </div>
);
