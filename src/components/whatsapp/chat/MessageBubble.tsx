import React, { useState, useRef, useEffect } from 'react';
import { Reply, Info, User, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MessageTicks } from '../shared/MessageTicks';
import type { MessageViewModel } from '@/hooks/chatViewModel';
import type { Media } from '@/models/whatsapp.models';
import { BASE_URL } from '@/shared/api/whatsappBaseUrl';

function getFullUrl(url: string | null | undefined) {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
  return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

// ─── Media renderers ──────────────────────────────────────────────────────────

interface MediaContentProps {
  media: Media;
  onImageClick?: (url: string, alt: string) => void;
}

const MediaContent: React.FC<MediaContentProps> = ({ media, onImageClick }) => {
  const mt = (media.mediaType || '').toUpperCase();
  const mime = media.mimeType || '';
  const url = getFullUrl(media.internalStorageUrl);

  if (mt === 'IMAGE' || mt === 'PHOTO' || mime.startsWith('image/')) {
    return (
      <div>
        <img
          src={url}
          alt={media.fileName || 'Photo'}
          loading="lazy"
          className="block max-w-full max-h-72 object-cover rounded-md cursor-zoom-in"
          onClick={() => onImageClick?.(url, media.fileName || 'Photo')}
        />
        {media.caption && (
          <p className="text-sm mt-1 leading-5">{media.caption}</p>
        )}
      </div>
    );
  }

  if (mt === 'VIDEO' || mime.startsWith('video/')) {
    return (
      <video
        src={url}
        controls
        preload="metadata"
        className="block max-w-full max-h-72 rounded-md"
      />
    );
  }

  if (mt === 'AUDIO' || mt === 'VOICE' || mime.startsWith('audio/')) {
    return (
      <audio
        src={url}
        controls
        preload="metadata"
        className="block w-full min-w-48 max-w-72"
      />
    );
  }

  // Document fallback
  const ext = (media.fileName?.split('.').pop() || 'FILE').toUpperCase().slice(0, 5);
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2.5 bg-black/5 hover:bg-black/9 rounded-lg px-3 py-2 cursor-pointer min-w-44 transition-colors no-underline"
    >
      <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="size-9 shrink-0">
        <rect width="48" height="48" rx="6" fill="#e53935" />
        <text x="50%" y="58%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="13" fontWeight="700" fontFamily="sans-serif">
          {ext}
        </text>
      </svg>
      <div className="min-w-0">
        <div className="text-xs font-medium truncate max-w-48">{media.fileName || 'Fichier'}</div>
        <div className="text-[11px] text-wa-muted">Appuyer pour ouvrir</div>
      </div>
    </a>
  );
};

// ─── Bubble Content by type ───────────────────────────────────────────────────

interface BubbleContentProps {
  vm: MessageViewModel;
  onImageClick: (url: string, alt: string) => void;
}

const BubbleContent: React.FC<BubbleContentProps> = ({ vm, onImageClick }) => {
  if (vm.medias && vm.medias.length > 0) {
    return (
      <div className="flex flex-col gap-1">
        {vm.medias.map((m, i) => (
          <MediaContent key={i} media={m} onImageClick={onImageClick} />
        ))}
        {vm.content && (
          <p className="text-sm leading-5 whitespace-pre-wrap mt-1">{vm.content}</p>
        )}
      </div>
    );
  }

  let t = vm.messageType;
  if (vm.content && t === 'TEXT') {
    const lower = vm.content.toLowerCase();
    if (lower.match(/\.(jpeg|jpg|gif|png|webp|bmp)$/i)) t = 'IMAGE';
    else if (lower.match(/\.(mp4|webm|mov|avi)$/i)) t = 'VIDEO';
    else if (lower.match(/\.(mp3|wav|ogg|m4a|aac)$/i)) t = 'AUDIO';
    else if (lower.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv)$/i)) t = 'DOCUMENT';
  }

  switch (t) {
    case 'IMAGE':
    case 'PHOTO':
      return (
        <img
          src={getFullUrl(vm.content)}
          alt="Photo"
          loading="lazy"
          className="block max-w-full max-h-72 object-cover rounded-md cursor-zoom-in"
          onClick={() => onImageClick(getFullUrl(vm.content), 'Photo')}
        />
      );
    case 'VIDEO':
      return (
        <video
          src={getFullUrl(vm.content)}
          controls
          preload="metadata"
          className="block max-w-full max-h-72 rounded-md"
        />
      );
    case 'AUDIO':
    case 'VOICE':
      return (
        <audio
          src={getFullUrl(vm.content)}
          controls
          preload="metadata"
          className="block w-full min-w-48 max-w-72"
        />
      );
    case 'DOCUMENT':
    case 'PDF':
    case 'FILE': {
      const ext = (vm.content?.split('/').pop()?.split('.').pop() || 'FILE').toUpperCase().slice(0, 5);
      return (
        <a
          href={getFullUrl(vm.content)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 bg-black/5 hover:bg-black/9 rounded-lg px-3 py-2 cursor-pointer min-w-44 transition-colors no-underline"
        >
          <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="size-9 shrink-0">
            <rect width="48" height="48" rx="6" fill="#e53935" />
            <text x="50%" y="58%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="13" fontWeight="700" fontFamily="sans-serif">{ext}</text>
          </svg>
          <div className="min-w-0">
            <div className="text-xs font-medium truncate max-w-48">Document</div>
            <div className="text-[11px] text-wa-muted">Appuyer pour ouvrir</div>
          </div>
        </a>
      );
    }
    case 'CONTACT': {
      let name = 'Contact', phone = '';
      try {
        const o = JSON.parse(vm.content || '{}');
        name = o.name || name;
        phone = o.phone || o.phoneNumber || '';
      } catch {}
      return (
        <div className="flex items-center gap-2.5 bg-black/5 rounded-lg px-3 py-2 min-w-48">
          <div className="size-10 rounded-full bg-wa-icon flex items-center justify-center text-white shrink-0">
            <User size={20} />
          </div>
          <div>
            <div className="text-sm font-medium">{name}</div>
            {phone && <div className="text-xs text-wa-muted">{phone}</div>}
          </div>
        </div>
      );
    }
    default:
      return <p className="text leading-5 whitespace-pre-wrap">{vm.content || ''}</p>;
  }
};

// ─── Bubble tail SVG ─────────────────────────────────────────────────────────

const TailInbound = () => (
  <svg
    className="absolute -left-2 top-0 shrink-0"
    width="8"
    height="13"
    viewBox="0 0 8 13"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M1 0C1 0 0 13 8 13L8 0L1 0Z" fill="white" />
  </svg>
);

const TailOutbound = () => (
  <svg
    className="absolute -right-2 top-0 shrink-0"
    width="8"
    height="13"
    viewBox="0 0 8 13"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M7 0C7 0 8 13 0 13L0 0L7 0Z" fill="#D9FDD3" />
  </svg>
);

// ─── Main MessageBubble ───────────────────────────────────────────────────────

interface MessageBubbleProps {
  vm: MessageViewModel;
  onReply: () => void;
  onInfo: () => void;
  onImageClick: (url: string, alt: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  vm,
  onReply,
  onInfo,
  onImageClick,
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMenuOpen]);

  const handleReply = () => {
    onReply();
    setIsMenuOpen(false);
  };

  const handleInfo = () => {
    onInfo();
    setIsMenuOpen(false);
  };

  return (
    <div
      className={cn(
        'flex my-1 relative group',
        vm.isOutbound ? 'justify-end' : 'justify-start'
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Bubble */}
      <div
        className={cn(  
          'relative max-w-[65%] rounded-[7.5px] px-2 pt-1.5 pb-2 pr-4',
          'shadow-[0_1px_0.5px_rgba(11,20,26,0.13)] wrap-break-word',
          vm.isOutbound
            ? 'bg-wa-bubble-out rounded-tr-none'
            : 'bg-wa-bubble-in rounded-tl-none'
        )}
      >
        {/* Tail */}
        {vm.isOutbound ? <TailOutbound /> : <TailInbound />}

        {/* Sender name (inbound group) */}
        {vm.senderName && (
          <div className="text-xs font-bold text-wa-teal mb-0.5">{vm.senderName}</div>
        )}

        {/* Reply quote */}
        {vm.replyToContent && (
          <div className="bg-black/6 rounded border-l-4 border-wa-teal px-2 py-1 mb-1 max-h-16 overflow-hidden">
            <div className="text-xs font-bold text-wa-teal mb-px">{vm.replyToAuthor}</div>
            <div className="text-xs text-wa-muted truncate">{vm.replyToContent}</div>
          </div>
        )}

        <BubbleContent vm={vm} onImageClick={onImageClick} />

        {/* Meta: time + ticks */}
        <div className="flex items-center gap-0.5 justify-end mt-px float-right ml-1.5">
          {vm.isOutbound && <MessageTicks status={vm.status} />}
          <span className="text-[11px] text-wa-muted">{vm.timeStr}</span>
        </div>
        <div className="clear-both" />

        {/* Hover dropdown chevron inside bubble */}
        <div
          className={cn(
            'absolute top-1 right-1 transition-opacity duration-100',
            isHovering ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
        >
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="size-5 rounded-full flex items-center justify-center bg-black/10 hover:bg-black/20 text-wa-text transition-colors"
              title="Actions"
            >
              <ChevronDown size={12} />
            </button>
            {/* Sub-menu */}
            {isMenuOpen && (
              <div className="absolute right-0 top-0 bg-white rounded-lg shadow-xl border border-wa-border py-1 z-50 min-w-40 min-h-30">
                <button
                  onClick={handleReply}
                  className="flex items-center gap-4 w-full px-4 py-3 text-wa-text hover:bg-wa-hover transition-colors text-base"
                >
                  <Reply size={16} className="text-wa-icon" />
                  Répondre
                </button>
                <button
                  onClick={handleInfo}
                  className="flex items-center gap-4 w-full px-4 py-3 text-wa-text hover:bg-wa-hover transition-colors text-base"
                >
                  <Info size={16} className="text-wa-icon" />
                  Détails
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
