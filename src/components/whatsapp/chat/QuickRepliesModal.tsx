import React, { useEffect, useRef, useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Upload,
  Download,
  Zap,
  AlertCircle,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/shadcn/dialog';
import { cn } from '@/lib/utils';
import { useQuickReplyStore } from '@/store/useQuickReplyStore';
import {
  normaliseShortcut,
  parseQuickReplyFile,
  toQuickReplyFile,
  QUICK_REPLY_FILE_EXAMPLE,
  type QuickReply,
} from '@/shared/db/quickReplies';

interface QuickRepliesModalProps {
  open: boolean;
  onClose: () => void;
}

interface Draft {
  id?: string;
  shortcut: string;
  label: string;
  content: string;
}

const EMPTY_DRAFT: Draft = { shortcut: '', label: '', content: '' };

/**
 * Management surface for the agent's canned replies: create, edit, delete,
 * and move a whole set between agents through a JSON file.
 */
export const QuickRepliesModal: React.FC<QuickRepliesModalProps> = ({ open, onClose }) => {
  const replies = useQuickReplyStore((s) => s.replies);
  const error = useQuickReplyStore((s) => s.error);
  const hydrate = useQuickReplyStore((s) => s.hydrate);
  const save = useQuickReplyStore((s) => s.save);
  const remove = useQuickReplyStore((s) => s.remove);
  const importMany = useQuickReplyStore((s) => s.importMany);

  const [draft, setDraft] = useState<Draft | null>(null);
  const [showFormat, setShowFormat] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) hydrate();
  }, [open, hydrate]);

  const startCreate = () => setDraft({ ...EMPTY_DRAFT });
  const startEdit = (reply: QuickReply) =>
    setDraft({
      id: reply.id,
      shortcut: reply.shortcut,
      label: reply.label ?? '',
      content: reply.content,
    });

  const submitDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;

    const shortcut = normaliseShortcut(draft.shortcut);
    if (!shortcut) {
      toast.error('Le raccourci est requis.');
      return;
    }
    if (!draft.content.trim()) {
      toast.error('Le message est requis.');
      return;
    }
    // A shortcut has to be unique, otherwise `/x` would be ambiguous.
    const clash = replies.find((r) => r.shortcut === shortcut && r.id !== draft.id);
    if (clash) {
      toast.error(`/${shortcut} existe déjà.`);
      return;
    }

    const existing = draft.id ? replies.find((r) => r.id === draft.id) : undefined;
    const saved = await save(
      { shortcut, label: draft.label, content: draft.content },
      existing,
    );
    if (saved) {
      toast.success(existing ? 'Réponse mise à jour' : `/${saved.shortcut} enregistrée`);
      setDraft(null);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const { valid, errors } = parseQuickReplyFile(await file.text());
    if (valid.length > 0) {
      const count = await importMany(valid);
      toast.success(
        `${count} réponse${count > 1 ? 's' : ''} importée${count > 1 ? 's' : ''}` +
          (errors.length ? ` — ${errors.length} ignorée(s)` : ''),
      );
    }
    if (errors.length > 0) {
      // Keep it readable: the first few reasons, not the whole list.
      toast.error(errors.slice(0, 3).join(' '), { duration: 8000 });
    }
  };

  const handleExport = () => {
    if (replies.length === 0) {
      toast.info('Aucune réponse rapide à exporter.');
      return;
    }
    const blob = new Blob([JSON.stringify(toQuickReplyFile(replies), null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reponses-rapides-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      {/* Same width as the other form-heavy modal (TemplateBroadcastModal) and
          a height cap, so a long list scrolls inside instead of pushing the
          dialog past the viewport. */}
      <DialogContent className="md:max-w-xl w-full max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap size={17} className="text-wa-teal" />
            Réponses rapides
          </DialogTitle>
          <DialogDescription>
            Tapez <span className="font-mono text-wa-teal">/raccourci</span> dans la zone
            de saisie pour insérer un message enregistré.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p className="flex items-start gap-2 rounded-lg bg-error-muted px-3 py-2 text-xs text-error">
            <AlertCircle size={14} className="mt-px shrink-0" />
            {error}
          </p>
        )}

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={startCreate}
            className="inline-flex items-center gap-1.5 rounded-full bg-wa-teal px-3 py-1.5 text-xs font-medium text-white transition-all hover:brightness-105"
          >
            <Plus size={14} />
            Nouvelle réponse
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-full border border-wa-border px-3 py-1.5 text-xs text-wa-text transition-colors hover:bg-wa-hover"
          >
            <Upload size={14} />
            Importer un JSON
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 rounded-full border border-wa-border px-3 py-1.5 text-xs text-wa-text transition-colors hover:bg-wa-hover"
          >
            <Download size={14} />
            Exporter
          </button>
          <button
            type="button"
            onClick={() => setShowFormat((v) => !v)}
            className="ml-auto text-xs text-wa-muted underline underline-offset-2 hover:text-wa-text"
          >
            {showFormat ? 'Masquer le format' : 'Voir le format attendu'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleImport}
          />
        </div>

        {showFormat && (
          <pre className="max-h-40 overflow-auto rounded-lg bg-wa-input-bg p-3 text-[11px] leading-relaxed text-wa-text">
            {QUICK_REPLY_FILE_EXAMPLE}
          </pre>
        )}

        {/* Editor */}
        {draft && (
          <form
            onSubmit={submitDraft}
            className="space-y-3 rounded-lg border border-wa-border p-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-wa-text">
                {draft.id ? 'Modifier la réponse' : 'Nouvelle réponse'}
              </p>
              <button
                type="button"
                onClick={() => setDraft(null)}
                aria-label="Annuler"
                className="rounded-full p-1 text-wa-icon transition-colors hover:bg-wa-hover"
              >
                <X size={15} />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-[11px] text-wa-muted">Raccourci *</span>
                <div className="flex items-center rounded-lg border border-wa-border bg-wa-input-bg px-2.5">
                  <span className="font-mono text-sm text-wa-muted">/</span>
                  <input
                    value={draft.shortcut}
                    onChange={(e) => setDraft({ ...draft, shortcut: e.target.value })}
                    placeholder="merci"
                    autoFocus
                    className="w-full bg-transparent py-2 font-mono text-sm text-wa-text outline-none"
                  />
                </div>
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] text-wa-muted">Titre</span>
                <input
                  value={draft.label}
                  onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                  placeholder="Remerciement"
                  className="w-full rounded-lg border border-wa-border bg-wa-input-bg px-2.5 py-2 text-sm text-wa-text outline-none focus:border-wa-teal"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-1 block text-[11px] text-wa-muted">Message *</span>
              <textarea
                value={draft.content}
                onChange={(e) => setDraft({ ...draft, content: e.target.value })}
                rows={4}
                placeholder="Le texte inséré dans la zone de saisie…"
                className="w-full resize-y rounded-lg border border-wa-border bg-wa-input-bg px-2.5 py-2 text-sm text-wa-text outline-none focus:border-wa-teal"
              />
            </label>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="rounded-full px-3 py-1.5 text-xs text-wa-muted transition-colors hover:bg-wa-hover"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="rounded-full bg-wa-green-send px-4 py-1.5 text-xs font-medium text-white transition-all hover:brightness-105"
              >
                Enregistrer
              </button>
            </div>
          </form>
        )}

        {/* List */}
        <div className="[scrollbar-width:thin]">
          {replies.length === 0 ? (
            <p className="py-8 text-center text-sm text-wa-muted">
              Aucune réponse rapide enregistrée.
            </p>
          ) : (
            <ul className="divide-y divide-wa-border">
              {replies.map((reply) => (
                <li
                  key={reply.id}
                  className={cn(
                    'group flex items-start gap-3 px-1 py-2.5',
                    draft?.id === reply.id && 'bg-wa-hover',
                  )}
                >
                  <span className="mt-0.5 shrink-0 font-mono text-[13px] font-medium text-wa-teal">
                    /{reply.shortcut}
                  </span>
                  <div className="min-w-0 flex-1">
                    {reply.label && (
                      <p className="truncate text-xs font-medium text-wa-text">
                        {reply.label}
                      </p>
                    )}
                    <p className="line-clamp-2 text-xs text-wa-muted">{reply.content}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => startEdit(reply)}
                      aria-label={`Modifier /${reply.shortcut}`}
                      className="rounded-full p-1.5 text-wa-icon transition-colors hover:bg-wa-active"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(reply.id)}
                      aria-label={`Supprimer /${reply.shortcut}`}
                      className="rounded-full p-1.5 text-wa-icon transition-colors hover:bg-error-muted hover:text-error"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
