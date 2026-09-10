import React, { useState, useRef, useEffect } from 'react';
import { Reply, Info, User, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MessageTicks } from '../shared/MessageTicks';
import { AudioPlayer } from '../shared/AudioPlayer';
import { RichText } from '../shared/RichText';
import type { MessageViewModel } from '@/hooks/chatViewModel';
import type { Media } from '@/models/whatsapp.models';
import { mediaUrl as getFullUrl } from '@/shared/api/whatsappBaseUrl';

// ─── Message type resolution ─────────────────────────────────────────────────
// The backend forwards a loose messageType string; for TEXT payloads that are
// actually a media URL (or a serialized contact card) we sniff the content.
// Shared by the renderer and the meta-placement logic so the two always agree.

export function resolveMessageType(vm: MessageViewModel): string {
  let t = vm.messageType;
  if (vm.content && t === 'TEXT') {
    const lower = vm.content.toLowerCase();
    if (lower.match(/\.(jpeg|jpg|gif|png|webp|bmp)$/i)) t = 'IMAGE';
    else if (lower.match(/\.(mp4|webm|mov|avi)$/i)) t = 'VIDEO';
    else if (lower.match(/\.(mp3|wav|ogg|m4a|aac)$/i)) t = 'AUDIO';
    else if (lower.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv)$/i)) t = 'DOCUMENT';
    // Fallback sniff: a WhatsApp contact-card payload serialized as JSON
    // (in case the backend's messageType string doesn't match our enum).
    else if (/^\s*\[?\s*\{\s*"name"\s*:/.test(vm.content)) t = 'CONTACT';
  }
  return t;
}

function isVisualMedia(media: Media) {
  const mt = (media.mediaType || '').toUpperCase();
  const mime = media.mimeType || '';
  return (
    mt === 'IMAGE' || mt === 'PHOTO' || mt === 'VIDEO' ||
    mime.startsWith('image/') || mime.startsWith('video/')
  );
}

/**
 * Where the time + ticks go, WhatsApp-style:
 *  - `overlay` — picture/video with no caption: floating pill over the media.
 *  - `inline`  — text (or captioned media): the meta sits on the last text
 *                line, room reserved by an invisible inline spacer.
 *  - `block`   — audio / document / contact: its own right-aligned row.
 */
type MetaMode = 'overlay' | 'inline' | 'block';

function getMetaMode(vm: MessageViewModel): MetaMode {
  const medias = vm.medias ?? [];
  if (medias.length > 0) {
    const captioned = !!vm.content || medias.some((m) => m.caption);
    if (captioned) return 'inline';
    return medias.every(isVisualMedia) ? 'overlay' : 'block';
  }
  const t = resolveMessageType(vm);
  if (t === 'IMAGE' || t === 'PHOTO' || t === 'VIDEO') return 'overlay';
  if (
    t === 'AUDIO' || t === 'VOICE' || t === 'DOCUMENT' || t === 'PDF' ||
    t === 'FILE' || t === 'CONTACT' || t === 'CONTACTS'
  ) {
    return 'block';
  }
  return 'inline';
}

// ─── Media renderers ──────────────────────────────────────────────────────────

interface MediaContentProps {
  media: Media;
  /** Let the picture reach the bubble edge (WhatsApp does this when it is the
      whole message; with a caption the normal padding is kept). */
  bleed: boolean;
  /** In-chat search term to highlight inside the caption. */
  highlight?: string;
  onImageClick?: (url: string, alt: string) => void;
}

const MediaContent: React.FC<MediaContentProps> = ({ media, bleed, highlight, onImageClick }) => {
  const mt = (media.mediaType || '').toUpperCase();
  const mime = media.mimeType || '';
  const url = getFullUrl(media.internalStorageUrl);
  const bleedCls = bleed ? '-mx-[6px] -mt-[3px]' : '';

  if (mt === 'IMAGE' || mt === 'PHOTO' || mime.startsWith('image/')) {
    return (
      <div className={bleedCls}>
        <img
          src={url}
          alt={media.fileName || 'Photo'}
          loading="lazy"
          className="block max-w-full max-h-[330px] w-auto rounded-[6px] cursor-zoom-in"
          onClick={() => onImageClick?.(url, media.fileName || 'Photo')}
        />
        {media.caption && (
          <p className="text-[14.2px] leading-[19px] whitespace-pre-wrap break-words mt-1 px-[6px]">
            <RichText text={media.caption} highlight={highlight} />
          </p>
        )}
      </div>
    );
  }

  if (mt === 'VIDEO' || mime.startsWith('video/')) {
    return (
      <div className={bleedCls}>
        <video
          src={url}
          controls
          preload="metadata"
          className="block max-w-full max-h-[330px] rounded-[6px]"
        />
        {media.caption && (
          <p className="text-[14.2px] leading-[19px] whitespace-pre-wrap break-words mt-1 px-[6px]">
            <RichText text={media.caption} highlight={highlight} />
          </p>
        )}
      </div>
    );
  }

  if (mt === 'AUDIO' || mt === 'VOICE' || mime.startsWith('audio/')) {
    return <AudioPlayer src={url} className="flex w-full min-w-48 max-w-72" />;
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
  /** Invisible inline box reserving room for the time + ticks on the last line. */
  spacer: React.ReactNode;
  metaMode: MetaMode;
  highlight?: string;
  onImageClick: (url: string, alt: string) => void;
}

const BubbleContent: React.FC<BubbleContentProps> = ({ vm, spacer, metaMode, highlight, onImageClick }) => {
  const inlineSpacer = metaMode === 'inline' ? spacer : null;

  if (vm.medias && vm.medias.length > 0) {
    const bleed = metaMode === 'overlay';
    return (
      <div className="flex flex-col gap-1">
        {vm.medias.map((m, i) => (
          <MediaContent
            key={i}
            media={m}
            bleed={bleed}
            highlight={highlight}
            onImageClick={onImageClick}
          />
        ))}
        {vm.content ? (
          <p className="text-[14.2px] leading-[19px] whitespace-pre-wrap break-words mt-1">
            <RichText text={vm.content} highlight={highlight} />
            {inlineSpacer}
          </p>
        ) : (
          inlineSpacer
        )}
      </div>
    );
  }

  switch (resolveMessageType(vm)) {
    case 'IMAGE':
    case 'PHOTO':
      return (
        <div className="-mx-[6px] -mt-[3px]">
          <img
            src={getFullUrl(vm.content)}
            alt="Photo"
            loading="lazy"
            className="block max-w-full max-h-[330px] w-auto rounded-[6px] cursor-zoom-in"
            onClick={() => onImageClick(getFullUrl(vm.content), 'Photo')}
          />
        </div>
      );
    case 'VIDEO':
      return (
        <div className="-mx-[6px] -mt-[3px]">
          <video
            src={getFullUrl(vm.content)}
            controls
            preload="metadata"
            className="block max-w-full max-h-[330px] rounded-[6px]"
          />
        </div>
      );
    case 'AUDIO':
    case 'VOICE':
      return (
        <AudioPlayer
          src={getFullUrl(vm.content)}
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
    case 'CONTACT':
    case 'CONTACTS': {
      // WhatsApp (Meta Cloud API) calls this type "contacts" (plural); the
      // backend forwards that raw string, so match both spellings here.
      // WhatsApp sends an array of contact cards, e.g.:
      // [{"name":{"first_name":"Raissa","formatted_name":"Raissa"},"phones":[{"phone":"+237...","wa_id":"...","type":"MOBILE"}]}]
      let contacts: { name: string; phone: string }[] = [];
      try {
        const parsed = JSON.parse(vm.content || '[]');
        const list = Array.isArray(parsed) ? parsed : [parsed];
        contacts = list.map((o) => ({
          name: o?.name?.formatted_name || o?.name?.first_name || o?.name || 'Contact',
          phone: o?.phones?.[0]?.phone || o?.phone || o?.phoneNumber || '',
        }));
      } catch {
        contacts = [{ name: 'Contact', phone: '' }];
      }
      return (
        <div className="flex flex-col gap-1">
          {contacts.map((c, i) => (
            <div key={i} className="flex items-center gap-2.5 bg-black/5 rounded-lg px-3 py-2 min-w-48">
              <div className="size-10 rounded-full bg-wa-icon flex items-center justify-center text-white shrink-0">
                <User size={20} />
              </div>
              <div>
                <div className="text-sm font-medium">{c.name}</div>
                {c.phone && <div className="text-xs text-wa-muted">{c.phone}</div>}
              </div>
            </div>
          ))}
        </div>
      );
    }
    default:
      return (
        <p className="text-[14.2px] leading-[19px] whitespace-pre-wrap break-words">
          <RichText text={vm.content || ''} highlight={highlight} />
          {inlineSpacer}
        </p>
      );
  }
};

// ─── Bubble tail SVG ─────────────────────────────────────────────────────────
// WhatsApp Web's own tail geometry (8×13 viewBox), so the notch lines up with
// the squared-off top corner of the bubble.

const TailInbound = () => (
  <svg
    className="absolute -left-2 top-0 z-[1]"
    width="8"
    height="13"
    viewBox="0 0 8 13"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path opacity=".13" d="M2.812,1H8v11.193l-6.467-8.625C0.474,2.156,1.042,1,2.812,1z" />
    <path fill="#ffffff" d="M2.812,0H8v11.193l-6.467-8.625C0.474,1.156,1.042,0,2.812,0z" />
  </svg>
);

const TailOutbound = () => (
  <svg
    className="absolute -right-2 top-0 z-[1]"
    width="8"
    height="13"
    viewBox="0 0 8 13"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path opacity=".13" d="M5.188,1H0v11.193l6.467-8.625C7.526,2.156,6.958,1,5.188,1z" />
    <path fill="#d9fdd3" d="M5.188,0H0v11.193l6.467-8.625C7.526,1.156,6.958,0,5.188,0z" />
  </svg>
);

// ─── Main MessageBubble ───────────────────────────────────────────────────────

interface MessageBubbleProps {
  vm: MessageViewModel;
  /** First of a run of consecutive messages from the same author — gets the tail. */
  isFirstOfGroup?: boolean;
  /** In-chat search term — every occurrence is marked inside the bubble. */
  highlight?: string;
  /** This bubble is the hit the search is currently focused on. */
  isActiveMatch?: boolean;
  onReply: (vm: MessageViewModel) => void;
  onInfo: (id: string) => void;
  onImageClick: (url: string, alt: string) => void;
}

export const MessageBubble = React.memo<MessageBubbleProps>(({
  vm,
  isFirstOfGroup = true,
  highlight,
  isActiveMatch = false,
  onReply,
  onInfo,
  onImageClick,
}) => {
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
    onReply(vm);
    setIsMenuOpen(false);
  };

  const handleInfo = () => {
    onInfo(vm.id);
    setIsMenuOpen(false);
  };

  const metaMode = getMetaMode(vm);
  const showTail = isFirstOfGroup;

  const meta = (
    <span className="flex items-center gap-0.5 leading-none whitespace-nowrap">
      <span className={cn('text-[11px]', metaMode === 'overlay' ? 'text-white' : 'text-wa-muted')}>
        {vm.timeStr}
      </span>
      {vm.isOutbound && <MessageTicks status={vm.status} />}
    </span>
  );

  // Reserves the exact room the absolutely-positioned meta needs on the last
  // text line — the WhatsApp trick that keeps time + ticks flush bottom-right
  // without a float (the float broke wrapping on long unbroken words).
  const inlineSpacer = (
    <span
      aria-hidden
      className="inline-block h-px align-bottom"
      style={{ width: vm.isOutbound ? 62 : 42 }}
    />
  );

  return (
    <div
      data-msg-id={vm.id}
      className={cn(
        'flex relative group',
        // WhatsApp spacing: 2px inside a run, 12px between runs.
        isFirstOfGroup ? 'mt-3' : 'mt-[2px]',
        vm.isOutbound ? 'justify-end' : 'justify-start'
      )}
    >
      {/* Outer wrapper — sizes the bubble but stays unclipped so the tail and
          the hover menu (siblings of the bubble, not descendants) survive the
          bubble's own overflow-hidden. */}
      <div className="relative max-w-[min(65%,520px)] min-w-0">
        {/* Tail — only on the first message of a run, like WhatsApp */}
        {showTail && (vm.isOutbound ? <TailOutbound /> : <TailInbound />)}

        {/* Bubble */}
        <div
          className={cn(
            'relative rounded-[7.5px] px-[9px] pt-[6px] pb-[8px] overflow-hidden',
            'shadow-[0_1px_0.5px_rgba(11,20,26,0.13)]',
            vm.isOutbound ? 'bg-wa-bubble-out' : 'bg-wa-bubble-in',
            showTail && (vm.isOutbound ? 'rounded-tr-none' : 'rounded-tl-none'),
            // The focused search hit, so it stands out among the other marks.
            isActiveMatch && 'ring-2 ring-wa-teal ring-offset-1 ring-offset-transparent'
          )}
        >
          {/* Sender name (inbound group) */}
          {vm.senderName && isFirstOfGroup && (
            <div className="text-[12.8px] font-medium text-wa-teal mb-0.5">{vm.senderName}</div>
          )}

          {/* Reply quote — author + content flow inline as one paragraph,
              wrapping onto multiple lines instead of forcing a single
              nowrap line (nowrap here would force the flex chain above to
              grow past the max-width, since min-width wins over max-width). */}
          {vm.replyToContent && (
            <div className="bg-black/6 rounded-[4px] border-l-4 border-wa-teal px-2 py-1 mb-1 min-w-0 max-h-16 overflow-hidden">
              <div className="text-xs whitespace-normal break-words min-w-0">
                <span className="font-medium text-wa-teal">{vm.replyToAuthor}</span>{' '}
                <span className="text-wa-muted">{vm.replyToContent}</span>
              </div>
            </div>
          )}

          <BubbleContent
            vm={vm}
            spacer={inlineSpacer}
            metaMode={metaMode}
            highlight={highlight}
            onImageClick={onImageClick}
          />

          {/* Meta: time + ticks — placement depends on the content type */}
          {metaMode === 'inline' && (
            <div className="absolute bottom-[6px] right-[9px]">{meta}</div>
          )}
          {metaMode === 'overlay' && (
            <div className="absolute bottom-2 right-2 rounded-full bg-black/35 px-1.5 py-0.5">
              {meta}
            </div>
          )}
          {metaMode === 'block' && <div className="flex justify-end mt-0.5">{meta}</div>}
        </div>

        {/* Hover chevron — sibling of the (overflow-hidden) bubble so it's never clipped */}
        <div
          className={cn(
            'absolute top-0.5 right-0.5 transition-opacity duration-100',
            isMenuOpen
              ? 'opacity-100'
              : 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto'
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
              <div className="absolute right-0 top-0 bg-white rounded-lg shadow-xl border border-wa-border py-1 z-50 min-w-40">
                <button
                  onClick={handleReply}
                  className="flex items-center gap-4 w-full px-4 py-2.5 text-wa-text hover:bg-wa-hover transition-colors text-sm"
                >
                  <Reply size={16} className="text-wa-icon" />
                  Répondre
                </button>
                <button
                  onClick={handleInfo}
                  className="flex items-center gap-4 w-full px-4 py-2.5 text-wa-text hover:bg-wa-hover transition-colors text-sm"
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
});

MessageBubble.displayName = 'MessageBubble';
