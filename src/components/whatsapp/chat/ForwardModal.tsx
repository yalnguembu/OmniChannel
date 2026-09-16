import React, { useMemo, useState } from 'react';
import { Search, Forward, Loader2, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/shadcn/dialog';
import { cn } from '@/lib/utils';
import { AvatarInitials } from '../shared/AvatarInitials';
import { useWhatsAppStore } from '@/store/useWhatsappStore';
import { useSendMedia, useSendText, type PendingMedia } from '@/hooks/useWhatsapp';
import { mediaUrl } from '@/shared/api/whatsappBaseUrl';
import { avatarColor, getInitials, convPreview } from '@/models/whatsapp.models';
import type { MessageViewModel } from '@/hooks/chatViewModel';

interface ForwardModalProps {
  open: boolean;
  onClose: () => void;
  /** Messages picked in the thread, oldest first. */
  messages: MessageViewModel[];
  /** Cleared once the forward succeeded. */
  onDone: () => void;
}

/** Downloads a stored media so it can be re-uploaded to another recipient. */
async function fetchAsFile(url: string, name: string): Promise<File> {
  const response = await fetch(url, { credentials: 'include' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const blob = await response.blob();
  return new File([blob], name || 'fichier', { type: blob.type });
}

/**
 * Forwards the selected messages to other conversations.
 *
 * WhatsApp has no "forward" endpoint here, so a forward is a re-send: text
 * goes out as text, and a media message is downloaded and re-uploaded to each
 * recipient. That makes it dependent on the media URLs being reachable, and
 * it is why failures are reported per recipient rather than as one verdict.
 */
export const ForwardModal: React.FC<ForwardModalProps> = ({
  open,
  onClose,
  messages,
  onDone,
}) => {
  const conversations = useWhatsAppStore((s) => s.conversations);
  const activeConversationId = useWhatsAppStore((s) => s.activeConversationId);
  const sendText = useSendText();
  const sendMedia = useSendMedia();

  const [query, setQuery] = useState('');
  const [targets, setTargets] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);

  const candidates = useMemo(() => {
    const q = query.trim().toLowerCase();
    return conversations
      // Forwarding to the conversation you are already in makes no sense.
      .filter((c) => c.id !== activeConversationId)
      .filter((c) =>
        q
          ? `${c.contactAddress ?? ''} ${c.contactName ?? ''}`.toLowerCase().includes(q)
          : true,
      )
      .slice(0, 100);
  }, [conversations, activeConversationId, query]);

  const toggle = (id: string) =>
    setTargets((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const handleForward = async () => {
    const recipients = conversations.filter((c) => targets.has(c.id));
    if (recipients.length === 0 || messages.length === 0) return;

    setSending(true);
    const failures: string[] = [];

    for (const recipient of recipients) {
      const to = recipient.contactAddress ?? '';
      if (!to) {
        failures.push(recipient.id);
        continue;
      }
      try {
        for (const message of messages) {
          const medias = message.medias ?? [];
          if (medias.length > 0) {
            // Re-upload rather than link: the recipient must receive the file,
            // not a URL only our agents can open.
            const items: PendingMedia[] = [];
            for (const media of medias) {
              if (!media.internalStorageUrl) continue;
              const file = await fetchAsFile(
                mediaUrl(media.internalStorageUrl),
                media.fileName ?? 'fichier',
              );
              items.push({ file, caption: media.caption ?? undefined });
            }
            if (items.length > 0) await sendMedia.mutateAsync({ to, items });
            if (message.content?.trim()) {
              await sendText.mutateAsync({ to, body: message.content });
            }
          } else if (message.content?.trim()) {
            await sendText.mutateAsync({ to, body: message.content });
          }
        }
      } catch {
        failures.push(recipient.contactAddress ?? recipient.id);
      }
    }

    setSending(false);

    const sent = recipients.length - failures.length;
    if (sent > 0) {
      toast.success(
        `${messages.length} message${messages.length > 1 ? 's' : ''} transféré${
          messages.length > 1 ? 's' : ''
        } à ${sent} destinataire${sent > 1 ? 's' : ''}`,
      );
    }
    if (failures.length > 0) {
      toast.error(`Échec pour : ${failures.join(', ')}`);
    }
    if (sent > 0) {
      setTargets(new Set());
      onDone();
      onClose();
    }
  };

  const mediaCount = messages.filter((m) => (m.medias?.length ?? 0) > 0).length;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !sending && onClose()}>
      <DialogContent className="md:max-w-xl w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Forward size={17} className="text-wa-teal" />
            Transférer {messages.length} message{messages.length > 1 ? 's' : ''}
          </DialogTitle>
          <DialogDescription>
            Choisissez les conversations qui doivent les recevoir.
          </DialogDescription>
        </DialogHeader>

        {mediaCount > 0 && (
          <p className="flex items-start gap-2 rounded-lg bg-warning-muted px-3 py-2 text-xs text-warning">
            <AlertCircle size={14} className="mt-px shrink-0" />
            {mediaCount} message{mediaCount > 1 ? 's contiennent' : ' contient'} un
            média : il sera téléchargé puis renvoyé, ce qui peut prendre un moment.
          </p>
        )}

        {/* Recipient search */}
        <div className="flex items-center gap-2 rounded-full bg-wa-input-bg px-3.5 py-2">
          <Search size={16} className="shrink-0 text-wa-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une conversation…"
            className="min-w-0 flex-1 bg-transparent text-sm text-wa-text outline-none placeholder:text-wa-muted"
          />
        </div>

        <div className="max-h-72 overflow-y-auto [scrollbar-width:thin]">
          {candidates.length === 0 ? (
            <p className="py-8 text-center text-sm text-wa-muted">
              Aucune conversation ne correspond.
            </p>
          ) : (
            <ul className="divide-y divide-wa-border">
              {candidates.map((conv) => {
                const picked = targets.has(conv.id);
                const name = conv.contactName || conv.contactAddress || '—';
                return (
                  <li key={conv.id}>
                    <button
                      type="button"
                      onClick={() => toggle(conv.id)}
                      className="flex w-full items-center gap-3 px-1 py-2.5 text-left transition-colors hover:bg-wa-hover"
                    >
                      <AvatarInitials
                        initials={getInitials(name)}
                        background={avatarColor(conv.id)}
                        size="md"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-wa-text">{name}</span>
                        <span className="block truncate text-xs text-wa-muted">
                          {convPreview(conv) || conv.contactAddress}
                        </span>
                      </span>
                      <span
                        aria-hidden
                        className={cn(
                          'flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors',
                          picked
                            ? 'border-wa-teal bg-wa-teal text-white'
                            : 'border-wa-icon/40',
                        )}
                      >
                        {picked && <Check size={13} strokeWidth={3} />}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-wa-border pt-3">
          <span className="text-xs text-wa-muted">
            {targets.size > 0
              ? `${targets.size} destinataire${targets.size > 1 ? 's' : ''}`
              : 'Aucun destinataire'}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={sending}
              className="rounded-full px-3 py-1.5 text-xs text-wa-muted transition-colors hover:bg-wa-hover disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleForward}
              disabled={sending || targets.size === 0}
              className="inline-flex items-center gap-1.5 rounded-full bg-wa-green-send px-4 py-1.5 text-xs font-medium text-white transition-all hover:brightness-105 disabled:opacity-50"
            >
              {sending ? <Loader2 size={14} className="animate-spin" /> : <Forward size={14} />}
              Transférer
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
