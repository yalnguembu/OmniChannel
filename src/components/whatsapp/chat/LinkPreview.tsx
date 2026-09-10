import React, { useMemo, useState } from 'react';
import { Globe, X } from 'lucide-react';

interface LinkPreviewProps {
  /** Absolute URL detected in the composer. */
  url: string;
  onDismiss: () => void;
}

/**
 * Preview card shown above the composer once a link is typed, the way
 * WhatsApp previews the URL you are about to send.
 *
 * It shows the destination — favicon, domain, full URL — but no title or
 * thumbnail: those live in the target page's OpenGraph tags, and a browser
 * can't read them cross-origin. A rich preview would need a backend endpoint
 * that fetches and unfurls the URL server-side; the API has none today.
 */
export const LinkPreview: React.FC<LinkPreviewProps> = ({ url, onDismiss }) => {
  const [iconFailed, setIconFailed] = useState(false);

  const parsed = useMemo(() => {
    try {
      const u = new URL(url);
      return {
        host: u.hostname.replace(/^www\./, ''),
        // The site's own favicon — no third-party lookup service involved.
        icon: `${u.origin}/favicon.ico`,
        pretty: u.href.replace(/^https?:\/\//, ''),
      };
    } catch {
      return null;
    }
  }, [url]);

  if (!parsed) return null;

  return (
    <div className="mx-4 mb-2 flex items-center gap-3 rounded-lg border-l-4 border-wa-teal bg-wa-bubble-in px-3 py-2 shadow-sm">
      <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded bg-wa-input-bg">
        {iconFailed ? (
          <Globe size={18} className="text-wa-icon" />
        ) : (
          <img
            src={parsed.icon}
            alt=""
            className="size-5 object-contain"
            onError={() => setIconFailed(true)}
          />
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-medium text-wa-text">
          {parsed.host}
        </span>
        <span className="block truncate text-xs text-wa-muted">{parsed.pretty}</span>
      </span>

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Masquer l'aperçu du lien"
        className="shrink-0 rounded-full p-1 text-wa-icon transition-colors hover:bg-wa-active hover:text-wa-text"
      >
        <X size={16} />
      </button>
    </div>
  );
};
