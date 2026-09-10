import React, { useMemo, useState } from 'react';
import { FileText, Loader2, Music, Play, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toUtcDate, fmtTimeFull } from '@/models/whatsapp.models';
import { mediaUrl } from '@/shared/api/whatsappBaseUrl';
import type { GalleryItem } from '@/hooks/chatViewModel';

type Tab = 'media' | 'docs';

interface MediaGalleryViewProps {
  items: GalleryItem[];
  /** Older pages hold media that hasn't been fetched yet. */
  hasOlder: boolean;
  isLoadingOlder: boolean;
  onLoadOlder: () => void;
  /** Open a picture / video in the full-screen lightbox. */
  onOpen: (type: 'image' | 'video', url: string, caption?: string) => void;
}

function monthLabel(ts: string | null): string {
  if (!ts) return 'Sans date';
  const d = toUtcDate(ts);
  const s = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * WhatsApp's "Médias, liens et documents" list, rendered as a sub-view of the
 * contact-info panel rather than as its own dialog — the same navigation the
 * native app uses.
 *
 * It only knows about messages already paged in, so the end of the list offers
 * to pull more rather than pretending to be exhaustive.
 */
export const MediaGalleryView: React.FC<MediaGalleryViewProps> = ({
  items,
  hasOlder,
  isLoadingOlder,
  onLoadOlder,
  onOpen,
}) => {
  const [tab, setTab] = useState<Tab>('media');

  const visual = useMemo(
    () => items.filter((i) => i.kind === 'image' || i.kind === 'video'),
    [items],
  );
  const docs = useMemo(
    () => items.filter((i) => i.kind === 'document' || i.kind === 'audio'),
    [items],
  );

  // Group by month, preserving the newest-first order the view model produced.
  const groups = useMemo(() => {
    const source = tab === 'media' ? visual : docs;
    const out: { label: string; entries: GalleryItem[] }[] = [];
    for (const item of source) {
      const label = monthLabel(item.timestamp);
      const last = out[out.length - 1];
      if (last && last.label === label) last.entries.push(item);
      else out.push({ label, entries: [item] });
    }
    return out;
  }, [tab, visual, docs]);

  return (
    <div className="bg-white">
      {/* Tabs — sticky so switching stays reachable while scrolling */}
      <div className="sticky top-0 z-10 flex gap-1 border-b border-wa-border bg-white px-2">
        {([
          ['media', `Médias${visual.length ? ` (${visual.length})` : ''}`],
          ['docs', `Documents${docs.length ? ` (${docs.length})` : ''}`],
        ] as [Tab, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'flex-1 border-b-2 -mb-px px-2 py-2.5 text-sm transition-colors',
              tab === key
                ? 'border-wa-teal text-wa-teal font-medium'
                : 'border-transparent text-wa-muted hover:text-wa-text',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {groups.length === 0 ? (
        <p className="px-6 py-10 text-center text-sm text-wa-muted">
          {tab === 'media'
            ? 'Aucune photo ni vidéo dans les messages chargés'
            : 'Aucun document ni audio dans les messages chargés'}
        </p>
      ) : (
        <div className="px-3 pt-2">
          {groups.map((group) => (
            <section key={group.label} className="mb-4">
              <h3 className="py-1.5 text-xs font-semibold uppercase tracking-wider text-wa-muted">
                {group.label}
              </h3>

              {tab === 'media' ? (
                <div className="grid grid-cols-3 gap-1">
                  {group.entries.map((item) => {
                    const url = mediaUrl(item.url);
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() =>
                          onOpen(
                            item.kind === 'video' ? 'video' : 'image',
                            url,
                            item.caption ?? undefined,
                          )
                        }
                        title={item.caption || item.fileName || undefined}
                        className="group relative aspect-square overflow-hidden rounded-md bg-wa-input-bg"
                      >
                        {item.kind === 'video' ? (
                          <>
                            <video
                              src={url}
                              preload="metadata"
                              muted
                              className="size-full object-cover"
                            />
                            <span className="absolute inset-0 flex items-center justify-center bg-black/25 text-white">
                              <Play size={20} />
                            </span>
                          </>
                        ) : (
                          <img
                            src={url}
                            alt={item.caption || item.fileName || ''}
                            loading="lazy"
                            className="size-full object-cover transition-transform group-hover:scale-105"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <ul className="divide-y divide-wa-border">
                  {group.entries.map((item) => (
                    <li key={item.key}>
                      <a
                        href={mediaUrl(item.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-md px-1 py-2.5 no-underline transition-colors hover:bg-wa-hover"
                      >
                        <span
                          className={cn(
                            'flex size-9 shrink-0 items-center justify-center rounded-lg text-white',
                            item.kind === 'audio' ? 'bg-[#e05c47]' : 'bg-[#0e6ede]',
                          )}
                        >
                          {item.kind === 'audio' ? (
                            <Music size={17} />
                          ) : (
                            <FileText size={17} />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm text-wa-text">
                            {item.fileName ||
                              (item.kind === 'audio' ? 'Message vocal' : 'Document')}
                          </span>
                          <span className="block truncate text-xs text-wa-muted">
                            {fmtTimeFull(item.timestamp)}
                            {item.caption ? ` · ${item.caption}` : ''}
                          </span>
                        </span>
                        <Download size={16} className="shrink-0 text-wa-icon" />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      )}

      {/* The gallery only sees messages already paged in. */}
      {hasOlder && (
        <div className="border-t border-wa-border px-4 py-3.5 text-center">
          <p className="mb-2 text-xs text-wa-muted">
            Seuls les messages déjà chargés sont listés.
          </p>
          <button
            type="button"
            onClick={onLoadOlder}
            disabled={isLoadingOlder}
            className="inline-flex items-center gap-1.5 rounded-full bg-wa-teal px-3.5 py-1.5 text-xs font-medium text-white transition-all hover:brightness-105 disabled:opacity-60"
          >
            {isLoadingOlder && <Loader2 size={13} className="animate-spin" />}
            Charger plus ancien
          </button>
        </div>
      )}
    </div>
  );
};
