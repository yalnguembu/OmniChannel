import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Send, X, FileText, Loader2, Plus, Trash2 } from "lucide-react";
import { AudioPlayer } from "../shared/AudioPlayer";
import { cn } from "@/lib/utils";
import type { PendingMedia } from "@/hooks/useWhatsapp";

interface MediaPreviewProps {
  /** Files picked from the attachment menu — the initial queue. */
  files: File[];
  /** Send every queued attachment, each carrying its own caption. */
  onSend: (items: PendingMedia[]) => void;
  /** Discard the queue and close the composer. */
  onCancel: () => void;
  isSending: boolean;
}

interface QueueItem {
  id: string;
  file: File;
  caption: string;
}

let seq = 0;
const nextId = () => `m${++seq}`;

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}

function kindOf(file: File) {
  const mime = file.type || "";
  return {
    isImage: mime.startsWith("image/"),
    isVideo: mime.startsWith("video/"),
    isAudio: mime.startsWith("audio/"),
    // Some browsers hand over an empty MIME type for a picked file, so fall
    // back to the extension before giving up on a preview.
    isPdf:
      mime === "application/pdf" || /\.pdf$/i.test(file.name),
  };
}

/**
 * WhatsApp-style media composer. Several attachments can be queued at once and
 * each one keeps **its own caption** — exactly like the native app, where a
 * multi-picture selection is sent as one message per picture. The thumbnail
 * strip switches between them; the caption field always edits the selected one.
 */
export const MediaPreview: React.FC<MediaPreviewProps> = ({
  files,
  onSend,
  onCancel,
  isSending,
}) => {
  const seed = (source: File[]) =>
    source.map((file) => ({ id: nextId(), file, caption: "" }));

  const [items, setItems] = useState<QueueItem[]>(() => seed(files));
  const [activeId, setActiveId] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const addInputRef = useRef<HTMLInputElement>(null);

  // Re-seed only when the parent hands over a *different* selection — the
  // initial one is already in state, and re-seeding it would throw away
  // captions and object URLs on the first render.
  const seededRef = useRef(files);
  useEffect(() => {
    if (seededRef.current === files) return;
    seededRef.current = files;
    setItems(seed(files));
  }, [files]);

  const active = useMemo(
    () => items.find((i) => i.id === activeId) ?? items[0] ?? null,
    [items, activeId],
  );

  // Keep the selection valid as items are added or removed.
  useEffect(() => {
    if (items.length === 0) return;
    if (!items.some((i) => i.id === activeId)) setActiveId(items[0].id);
  }, [items, activeId]);

  // Object URLs for every previewable attachment, created and revoked as a
  // set. Doing it in one effect (rather than per render) keeps StrictMode's
  // double-mount from leaving a revoked URL behind and a blank preview.
  const [urls, setUrls] = useState<Record<string, string>>({});
  useEffect(() => {
    const created: Record<string, string> = {};
    for (const item of items) {
      const { isImage, isVideo, isAudio, isPdf } = kindOf(item.file);
      if (isImage || isVideo || isAudio || isPdf) {
        created[item.id] = URL.createObjectURL(item.file);
      }
    }
    setUrls(created);
    return () => {
      for (const url of Object.values(created)) URL.revokeObjectURL(url);
    };
  }, [items]);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [active?.id]);

  const setCaption = useCallback(
    (value: string) => {
      if (!active) return;
      setItems((prev) =>
        prev.map((i) => (i.id === active.id ? { ...i, caption: value } : i)),
      );
    },
    [active],
  );

  const removeItem = useCallback(
    (id: string) => {
      setItems((prev) => {
        const next = prev.filter((i) => i.id !== id);
        if (next.length === 0) onCancel();
        return next;
      });
    },
    [onCancel],
  );

  const onAddFiles = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (picked.length === 0) return;
    setItems((prev) => {
      const added = picked.map((file) => ({ id: nextId(), file, caption: "" }));
      setActiveId(added[0].id);
      return [...prev, ...added];
    });
  }, []);

  const handleSend = useCallback(() => {
    if (isSending || items.length === 0) return;
    onSend(items.map(({ file, caption }) => ({ file, caption })));
  }, [isSending, items, onSend]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!active) return null;

  const { isImage, isVideo, isAudio, isPdf } = kindOf(active.file);
  const activeUrl = urls[active.id];
  const captioned = items.filter((i) => i.caption.trim()).length;

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-[#0b141a]/95">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 shrink-0">
        <button
          onClick={onCancel}
          disabled={isSending}
          className="size-10 rounded-full flex items-center justify-center text-white/90 hover:bg-white/10 transition-colors disabled:opacity-50"
          aria-label="Annuler"
        >
          <X size={22} />
        </button>
        <span className="text-white/90 text-sm truncate">{active.file.name}</span>
        <span className="ml-auto text-white/50 text-xs shrink-0">
          {items.length > 1
            ? `${items.indexOf(active) + 1} / ${items.length}`
            : humanSize(active.file.size)}
        </span>
      </div>

      {/* Preview of the selected attachment */}
      <div className="flex-1 min-h-0 flex items-center justify-center px-6 pb-2 overflow-hidden">
        {(isImage || isVideo || isAudio || isPdf) && !activeUrl ? (
          <Loader2 size={32} className="animate-spin text-white/70" />
        ) : isImage ? (
          <img
            src={activeUrl}
            alt={active.file.name}
            className="max-w-full max-h-full object-contain rounded-md"
          />
        ) : isVideo ? (
          <video src={activeUrl} controls className="max-w-full max-h-full rounded-md" />
        ) : isPdf ? (
          // Rendered by the browser's built-in viewer — the chrome is hidden so
          // it reads as a page preview rather than an embedded app.
          <iframe
            src={`${activeUrl}#toolbar=0&navpanes=0&view=FitH`}
            title={active.file.name}
            className="h-full w-full max-w-3xl rounded-md bg-white"
          />
        ) : isAudio ? (
          <div className="w-full max-w-md flex flex-col items-center gap-4">
            <div className="size-20 rounded-full bg-wa-green/20 flex items-center justify-center text-wa-green">
              <FileText size={36} />
            </div>
            <AudioPlayer src={activeUrl} className="w-full text-white/80" />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="size-24 rounded-2xl bg-white/10 flex items-center justify-center text-white/80">
              <FileText size={48} />
            </div>
            <div className="text-white/90 text-sm font-medium break-all max-w-xs">
              {active.file.name}
            </div>
            <div className="text-white/50 text-xs">{humanSize(active.file.size)}</div>
          </div>
        )}
      </div>

      {/* Caption for the selected attachment + send */}
      <div className="shrink-0 px-3 pb-3 pt-1">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-2">
            <div className="flex-1 min-w-0 bg-white rounded-2xl px-4 py-2.5">
              <textarea
                ref={inputRef}
                value={active.caption}
                onChange={(e) => setCaption(e.target.value)}
                onKeyDown={onKeyDown}
                rows={1}
                placeholder={
                  items.length > 1
                    ? "Légende de ce fichier…"
                    : "Ajouter une légende…"
                }
                className="w-full border-none outline-none resize-none text-sm text-wa-text placeholder:text-wa-muted bg-transparent max-h-28 leading-snug"
              />
            </div>
            <button
              onClick={handleSend}
              disabled={isSending}
              className="size-12 rounded-full bg-wa-green-send text-white flex items-center justify-center shadow-md hover:brightness-105 transition-all shrink-0 disabled:opacity-70 relative"
              aria-label={
                items.length > 1 ? `Envoyer ${items.length} fichiers` : "Envoyer"
              }
            >
              {isSending ? (
                <Loader2 size={22} className="animate-spin" />
              ) : (
                <Send size={22} />
              )}
              {items.length > 1 && !isSending && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-white text-wa-green-send text-[11px] font-semibold flex items-center justify-center shadow">
                  {items.length}
                </span>
              )}
            </button>
          </div>

          {items.length > 1 && (
            <p className="mt-2 text-center text-[11px] text-white/45">
              {items.length} fichiers — un message par fichier
              {captioned > 0 && `, ${captioned} avec légende`}
            </p>
          )}
        </div>
      </div>

      {/* Thumbnail strip — switch between attachments, drop one, add more */}
      <div className="shrink-0 border-t border-white/10 px-3 py-2.5">
        <div className="max-w-3xl mx-auto flex items-center gap-2 overflow-x-auto [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.25)_transparent]">
          {items.map((item) => {
            const k = kindOf(item.file);
            const url = urls[item.id];
            const isActive = item.id === active.id;
            return (
              <div key={item.id} className="relative shrink-0 group/thumb">
                <button
                  type="button"
                  onClick={() => setActiveId(item.id)}
                  className={cn(
                    "size-14 rounded-lg overflow-hidden flex items-center justify-center transition-all",
                    isActive
                      ? "ring-2 ring-wa-green-send opacity-100"
                      : "opacity-55 hover:opacity-85",
                    k.isImage || k.isVideo ? "bg-black/40" : "bg-white/10",
                  )}
                  aria-label={`Sélectionner ${item.file.name}`}
                >
                  {k.isImage && url ? (
                    <img src={url} alt="" className="size-full object-cover" />
                  ) : k.isVideo && url ? (
                    <video src={url} muted className="size-full object-cover" />
                  ) : k.isPdf ? (
                    <span className="flex flex-col items-center gap-0.5 text-white/80">
                      <FileText size={18} />
                      <span className="text-[9px] font-semibold tracking-wide">PDF</span>
                    </span>
                  ) : (
                    <FileText size={20} className="text-white/70" />
                  )}
                </button>
                {/* A caption on a non-selected item is otherwise invisible */}
                {item.caption.trim() && (
                  <span className="absolute bottom-0 inset-x-0 h-1 bg-wa-green-send" />
                )}
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  disabled={isSending}
                  aria-label={`Retirer ${item.file.name}`}
                  className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-black/75 text-white/90 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 focus:opacity-100 transition-opacity disabled:hidden"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            );
          })}

          <button
            type="button"
            onClick={() => addInputRef.current?.click()}
            disabled={isSending}
            className="size-14 shrink-0 rounded-lg border border-dashed border-white/30 text-white/60 flex items-center justify-center hover:border-white/60 hover:text-white/90 transition-colors disabled:opacity-40"
            aria-label="Ajouter des fichiers"
          >
            <Plus size={20} />
          </button>
          <input
            ref={addInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={onAddFiles}
          />
        </div>
      </div>
    </div>
  );
};
