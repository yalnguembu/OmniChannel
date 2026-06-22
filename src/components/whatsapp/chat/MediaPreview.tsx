import React, { useEffect, useRef, useState } from "react";
import { Send, X, FileText, Loader2 } from "lucide-react";
import { AudioPlayer } from "../shared/AudioPlayer";

interface MediaPreviewProps {
  /** The file picked from the attachment menu. */
  file: File;
  /** Send the file with the typed caption. */
  onSend: (caption: string) => void;
  /** Discard the pending file and close the composer. */
  onCancel: () => void;
  isSending: boolean;
}

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}

/**
 * WhatsApp-style media composer: shows a preview of the picked file with a
 * caption field, overlaid on top of the chat column. Mirrors the native UX —
 * the user reviews the attachment and adds a description before sending.
 */
export const MediaPreview: React.FC<MediaPreviewProps> = ({
  file,
  onSend,
  onCancel,
  isSending,
}) => {
  const [caption, setCaption] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const mime = file.type || "";
  const isImage = mime.startsWith("image/");
  const isVideo = mime.startsWith("video/");
  const isAudio = mime.startsWith("audio/");

  // Object URL for visual media. Create AND revoke it inside the same effect so
  // the URL is recreated on every (re)mount — under React StrictMode the first
  // mount is immediately torn down, and a URL created in useMemo would be left
  // revoked (and the preview blank) on the second mount.
  const [objectUrl, setObjectUrl] = useState("");
  useEffect(() => {
    if (!(isImage || isVideo || isAudio)) {
      setObjectUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file, isImage, isVideo, isAudio]);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const handleSend = () => {
    if (isSending) return;
    onSend(caption.trim());
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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
        <span className="text-white/90 text-sm truncate">{file.name}</span>
      </div>

      {/* Preview */}
      <div className="flex-1 min-h-0 flex items-center justify-center px-6 pb-2 overflow-hidden">
        {(isImage || isVideo || isAudio) && !objectUrl ? (
          <Loader2 size={32} className="animate-spin text-white/70" />
        ) : isImage ? (
          <img
            src={objectUrl}
            alt={file.name}
            className="max-w-full max-h-full object-contain rounded-md"
          />
        ) : isVideo ? (
          <video
            src={objectUrl}
            controls
            className="max-w-full max-h-full rounded-md"
          />
        ) : isAudio ? (
          <div className="w-full max-w-md flex flex-col items-center gap-4">
            <div className="size-20 rounded-full bg-wa-green/20 flex items-center justify-center text-wa-green">
              <FileText size={36} />
            </div>
            <AudioPlayer src={objectUrl} className="w-full" />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="size-24 rounded-2xl bg-white/10 flex items-center justify-center text-white/80">
              <FileText size={48} />
            </div>
            <div className="text-white/90 text-sm font-medium break-all max-w-xs">
              {file.name}
            </div>
            <div className="text-white/50 text-xs">{humanSize(file.size)}</div>
          </div>
        )}
      </div>

      {/* Caption + send */}
      <div className="shrink-0 px-3 pb-4 pt-1">
        <div className="flex items-end gap-2 max-w-3xl mx-auto">
          <div className="flex-1 min-w-0 bg-white rounded-2xl px-4 py-2.5">
            <textarea
              ref={inputRef}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder="Ajouter une légende…"
              className="w-full border-none outline-none resize-none text-sm text-wa-text placeholder:text-wa-muted bg-transparent max-h-28 leading-snug"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={isSending}
            className="size-12 rounded-full bg-wa-green-send text-white flex items-center justify-center shadow-md hover:brightness-105 transition-all shrink-0 disabled:opacity-70"
            aria-label="Envoyer"
          >
            {isSending ? (
              <Loader2 size={22} className="animate-spin" />
            ) : (
              <Send size={22} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
