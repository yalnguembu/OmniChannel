import React, { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Smile,
  Send,
  Mic,
  Image,
  FileText,
  Music,
  X,
  Zap,
  Plus,
  LayoutTemplate,
  Clock,
  Square,
  Zap as ZapIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { cn } from "@/lib/utils";
import {
  SendMessageFormSchema,
  type SendMessageForm,
} from "@/models/whatsapp.models";
import type { ReplyTo } from "@/store/useWhatsappStore";
import { toast } from "sonner";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import { extractFirstUrl } from "../shared/RichText";
import { LinkPreview } from "./LinkPreview";
import { QuickReplyMenu } from "./QuickReplyMenu";
import { QuickRepliesModal } from "./QuickRepliesModal";
import { matchQuickReplies, useQuickReplyStore } from "@/store/useQuickReplyStore";
import type { QuickReply } from "@/shared/db/quickReplies";

interface SlashToken {
  /** Text typed after the slash. */
  query: string;
  /** Offsets of the whole `/token` in the textarea value. */
  start: number;
  end: number;
}

/**
 * The `/shortcut` being typed at the caret, if any.
 *
 * Anchored to the start of the message or to whitespace, so a slash inside a
 * URL (`https://…`) or a date never opens the palette.
 */
function readSlashToken(el: HTMLTextAreaElement | null): SlashToken | null {
  if (!el) return null;
  const caret = el.selectionStart ?? 0;
  const match = /(?:^|\s)\/([^\s/]*)$/.exec(el.value.slice(0, caret));
  if (!match) return null;
  const query = match[1];
  return { query, start: caret - query.length - 1, end: caret };
}

interface MessageInputProps {
  replyTo: ReplyTo | null;
  onCancelReply: () => void;
  onSend: (text: string) => Promise<void>;
  /** Files were picked — the parent opens the media preview composer.
      Several at once is supported: each becomes its own captioned message. */
  onPickMedia: (files: File[]) => void;
  onOpenFlow: () => void;
  onOpenTemplate: () => void;
  /** True when the WhatsApp 24h window is closed — only templates may be sent. */
  disabled?: boolean;
  isSending: boolean;
  inputRef: React.RefObject<HTMLTextAreaElement>;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  replyTo,
  onCancelReply,
  onSend,
  onPickMedia,
  onOpenFlow,
  onOpenTemplate,
  disabled = false,
  isSending,
  inputRef,
}) => {
  const [showAttMenu, setShowAttMenu] = useState(false);
  const [showEmojiMenu, setShowEmojiMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset, watch, setValue } =
    useForm<SendMessageForm>({
      resolver: zodResolver(SendMessageFormSchema),
      defaultValues: { content: "" },
    });

  const content = watch("content");
  const hasText = !!content?.trim();

  // Preview the first link being typed, until the user dismisses that exact
  // URL — editing the message to a different link brings the card back.
  const previewUrl = useMemo(() => extractFirstUrl(content ?? ""), [content]);
  const [dismissedUrl, setDismissedUrl] = useState<string | null>(null);
  const showPreview = !!previewUrl && previewUrl !== dismissedUrl;

  const onSubmit = async (data: SendMessageForm) => {
    const text = data.content;
    closeMenu();
    if (speech.listening) speech.stop();
    reset({ content: "" });
    setDismissedUrl(null);
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.style.height = "auto";
      inputRef.current.blur();
    }
    await onSend(text);
  };

  // ── Quick replies ──
  const quickReplies = useQuickReplyStore((s) => s.replies);
  const hydrateQuickReplies = useQuickReplyStore((s) => s.hydrate);
  const [quickRepliesOpen, setQuickRepliesOpen] = useState(false);
  /** The `/token` under the caret, or null when the menu should stay closed. */
  const [slashToken, setSlashToken] = useState<SlashToken | null>(null);
  const [menuIndex, setMenuIndex] = useState(0);

  useEffect(() => {
    hydrateQuickReplies();
  }, [hydrateQuickReplies]);

  const matches = useMemo(
    () => (slashToken ? matchQuickReplies(quickReplies, slashToken.query) : []),
    [slashToken, quickReplies],
  );
  const menuOpen = slashToken !== null && !disabled;

  /** Recompute the token after anything that can move the caret. */
  const syncSlashToken = () => {
    const next = readSlashToken(inputRef.current);
    setSlashToken(next);
    setMenuIndex(0);
  };

  const closeMenu = () => setSlashToken(null);

  const insertQuickReply = (reply: QuickReply) => {
    const el = inputRef.current;
    const token = slashToken ?? readSlashToken(el);
    if (!el || !token) return;
    const next =
      el.value.slice(0, token.start) + reply.content + el.value.slice(token.end);
    setValue("content", next, { shouldDirty: true });
    closeMenu();
    // Put the caret right after what was inserted, once RHF has written the
    // value back to the (uncontrolled) textarea.
    requestAnimationFrame(() => {
      el.focus();
      const caret = token.start + reply.content.length;
      el.setSelectionRange(caret, caret);
      autoResize();
    });
  };

  // ── Dictation ──
  // What was already typed when dictation started; the transcript is appended
  // to it so speaking never wipes an in-progress message.
  const dictationBaseRef = useRef("");

  const applyTranscript = (transcript: string) => {
    const base = dictationBaseRef.current;
    const separator = base && !/\s$/.test(base) ? " " : "";
    setValue("content", base + separator + transcript, { shouldDirty: true });
    // The field grows as the sentence does.
    requestAnimationFrame(autoResize);
  };

  const speech = useSpeechToText({
    lang: "fr-FR",
    onTranscript: applyTranscript,
    onError: (message) => toast.error(message),
  });

  const toggleDictation = () => {
    if (speech.listening) {
      speech.stop();
      inputRef.current?.focus();
      return;
    }
    dictationBaseRef.current = inputRef.current?.value ?? content ?? "";
    speech.start();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // While the palette is up it takes the navigation keys, so Enter picks a
    // reply instead of sending a half-typed `/command`.
    if (menuOpen) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setMenuIndex((i) => (matches.length ? (i + 1) % matches.length : 0));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setMenuIndex((i) =>
          matches.length ? (i - 1 + matches.length) % matches.length : 0,
        );
        return;
      }
      if ((e.key === "Enter" && !e.shiftKey) || e.key === "Tab") {
        if (matches[menuIndex]) {
          e.preventDefault();
          insertQuickReply(matches[menuIndex]);
          return;
        }
      }
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        closeMenu();
        return;
      }
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(onSubmit)();
    }
    if (e.key === "Escape" && speech.listening) {
      e.preventDefault();
      e.stopPropagation();
      speech.stop();
    }
  };

  const autoResize = () => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height =
        Math.min(inputRef.current.scrollHeight, 120) + "px";
    }
  };

  const pickFile = (accept: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept;
      fileInputRef.current.click();
    }
    setShowAttMenu(false);
  };

  const onFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (picked.length === 0) return;
    onPickMedia(picked);
  };

  const onEmojiClick = (emojiData: { emoji: string }) => {
    const currentRef = inputRef.current;
    if (currentRef) {
      const start = currentRef.selectionStart;
      const end = currentRef.selectionEnd;
      const val = content || "";
      const newText =
        val.substring(0, start) + emojiData.emoji + val.substring(end);
      setValue("content", newText);
      setTimeout(() => {
        currentRef.focus();
        currentRef.setSelectionRange(
          start + emojiData.emoji.length,
          start + emojiData.emoji.length,
        );
        autoResize();
      }, 0);
    } else {
      setValue("content", (content || "") + emojiData.emoji);
      autoResize();
    }
  };

  const { ref: formRef, ...restRegister } = register("content");

  return (
    <div className="shrink-0 relative">
      <AnimatePresence>
        {showAttMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.12 }}
            className="absolute bottom-full mb-2 left-4 w-68 max-w-[calc(100%-2rem)] bg-white rounded-2xl shadow-xl border border-wa-border py-2 z-50 overflow-hidden"
          >
            <button
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-wa-text hover:bg-wa-hover transition-colors"
              onClick={() => pickFile("image/*,video/*")}
            >
              <span className="size-9 rounded-full bg-[#bf59cf] flex items-center justify-center text-white shrink-0">
                <Image size={16} />
              </span>
              Photos &amp; vidéos
            </button>
            <button
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-wa-text hover:bg-wa-hover transition-colors"
              onClick={() => pickFile("application/*,text/*")}
            >
              <span className="size-9 rounded-full bg-[#0e6ede] flex items-center justify-center text-white shrink-0">
                <FileText size={16} />
              </span>
              Document
            </button>
            <button
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-wa-text hover:bg-wa-hover transition-colors"
              onClick={() => pickFile("audio/*")}
            >
              <span className="size-9 rounded-full bg-[#e05c47] flex items-center justify-center text-white shrink-0">
                <Music size={16} />
              </span>
              Audio
            </button>
            <button
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-wa-text hover:bg-wa-hover transition-colors"
              onClick={() => {
                setQuickRepliesOpen(true);
                setShowAttMenu(false);
              }}
            >
              <span className="size-9 rounded-full bg-wa-teal flex items-center justify-center text-white shrink-0">
                <ZapIcon size={16} />
              </span>
              Réponses rapides
            </button>
            <button
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-wa-text hover:bg-wa-hover transition-colors"
              onClick={() => {
                onOpenFlow();
                setShowAttMenu(false);
              }}
            >
              <span className="size-9 rounded-full bg-wa-green flex items-center justify-center text-white shrink-0">
                <Zap size={16} />
              </span>
              Envoyer un Flow
            </button>
            <button
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-wa-text hover:bg-wa-hover transition-colors"
              onClick={() => {
                onOpenTemplate();
                setShowAttMenu(false);
              }}
            >
              <span className="size-9 rounded-full bg-wa-teal flex items-center justify-center text-white shrink-0">
                <LayoutTemplate size={16} />
              </span>
              Envoyer un template
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emoji picker — right-anchored so it never overflows the right edge */}
      <AnimatePresence>
        {showEmojiMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.12 }}
            className="absolute bottom-full mb-2 left-4 z-50 max-w-[calc(100%-2rem)]"
          >
            <EmojiPicker
              onEmojiClick={onEmojiClick}
              theme={Theme.LIGHT}
              searchPlaceHolder="Chercher..."
              width={280}
              height={340}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {menuOpen && (
        <QuickReplyMenu
          replies={matches}
          query={slashToken?.query ?? ""}
          activeIndex={menuIndex}
          onHover={setMenuIndex}
          onPick={insertQuickReply}
          onManage={() => {
            closeMenu();
            setQuickRepliesOpen(true);
          }}
        />
      )}

      <QuickRepliesModal
        open={quickRepliesOpen}
        onClose={() => setQuickRepliesOpen(false)}
      />

      {/* Link preview — sits above the reply bar, like WhatsApp */}
      {showPreview && previewUrl && (
        <LinkPreview url={previewUrl} onDismiss={() => setDismissedUrl(previewUrl)} />
      )}

      {/* Reply bar — plain render (no height animation, which deformed the
          input row as it expanded/collapsed). */}
      {replyTo && (
        <div className="flex items-center gap-3 bg-wa-bubble-in border-t border-wa-border px-4 py-2">
          <div className="flex-1 min-w-0 border-l-4 border-wa-teal pl-3">
            <div className="text-xs whitespace-normal break-words line-clamp-2 min-w-0">
              <span className="font-bold text-wa-teal">{replyTo.author}</span>{" "}
              <span className="text-wa-muted">{replyTo.content}</span>
            </div>
          </div>
          <button
            onClick={onCancelReply}
            className="text-wa-icon hover:text-wa-text transition-colors p-1 rounded-full hover:bg-wa-active shrink-0"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* 24h window closed — free-form messaging blocked, template required */}
      {disabled && (
        <div className="flex items-center gap-2 mx-4 mb-2 px-4 py-2.5 rounded-2xl bg-wa-bubble-in border border-wa-border text-xs text-wa-muted">
          <Clock size={15} className="shrink-0 text-wa-icon" />
          <span className="flex-1">
            La fenêtre de 24h est expirée. Envoyez un template pour reprendre la
            conversation.
          </span>
          <button
            type="button"
            onClick={onOpenTemplate}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-wa-teal px-3 py-1 text-white font-medium hover:brightness-105 transition-all"
          >
            <LayoutTemplate size={13} />
            Template
          </button>
        </div>
      )}

      {/* Dictation status — the words land straight in the field, this only
          says the mic is live and offers a way out. */}
      {speech.listening && (
        <div className="mx-4 mb-2 flex items-center gap-2 rounded-full bg-error/10 px-4 py-1.5 text-xs text-error">
          <span className="relative flex size-2 shrink-0">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-error opacity-70" />
            <span className="relative inline-flex size-2 rounded-full bg-error" />
          </span>
          <span className="flex-1">Dictée en cours — parlez</span>
          <button
            type="button"
            onClick={() => speech.stop()}
            className="shrink-0 font-medium underline underline-offset-2"
          >
            Arrêter
          </button>
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end rounded-2xl bg-white shadow-lg mx-4 mb-2 gap-2 px-4 py-2.5">
        {/* Attachment button */}
        <button
          type="button"
          disabled={disabled}
          className="size-10 rounded-full flex items-center justify-center text-wa-icon hover:bg-black/5 transition-colors shrink-0 mb-px disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed"
          onClick={() => {
            setShowEmojiMenu(false);
            setShowAttMenu((v) => !v);
          }}
        >
          <Plus size={24} />
        </button>

        {/* Emoji button */}
        <button
          type="button"
          disabled={disabled}
          className="size-10 rounded-full flex items-center justify-center text-wa-icon hover:bg-black/5 transition-colors shrink-0 mb-px disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed"
          onClick={() => {
            setShowAttMenu(false);
            setShowEmojiMenu((v) => !v);
          }}
        >
          <Smile size={24} />
        </button>

        {/* Textarea */}
        <div className="flex-1 min-w-0 bg-white rounded-lg px-3 py-2">
          <textarea
            {...restRegister}
            ref={(e) => {
              formRef(e);
              if (inputRef)
                (
                  inputRef as React.MutableRefObject<HTMLTextAreaElement | null>
                ).current = e;
            }}
            rows={1}
            disabled={disabled}
            placeholder={
              disabled
                ? "Fenêtre de 24h expirée — envoyez un template"
                : "Tapez un message"
            }
            onKeyDown={onKeyDown}
            onInput={() => {
              autoResize();
              syncSlashToken();
            }}
            onKeyUp={syncSlashToken}
            onClick={syncSlashToken}
            onBlur={closeMenu}
            className="w-full border-none outline-none resize-none text-[15px] text-wa-text placeholder:text-wa-muted bg-transparent max-h-28 leading-snug disabled:cursor-not-allowed"
          />
        </div>

        {/* Dictation — always available, unlike the send button */}
        <button
          type="button"
          disabled={disabled || !speech.available}
          onClick={toggleDictation}
          aria-pressed={speech.listening}
          aria-label={speech.listening ? "Arrêter la dictée" : "Dicter le message"}
          title={
            speech.unavailableReason ??
            (speech.listening ? "Arrêter la dictée (Échap)" : "Dicter le message")
          }
          className={cn(
            "size-10 rounded-full flex items-center justify-center transition-all shrink-0",
            speech.listening
              ? "bg-error text-white shadow-md"
              : "text-wa-icon hover:bg-black/5 cursor-pointer",
            (disabled || !speech.available) &&
              "opacity-40 cursor-not-allowed hover:bg-transparent",
          )}
        >
          {speech.listening ? <Square size={16} fill="currentColor" /> : <Mic size={20} />}
        </button>

        {/* Send */}
        {hasText && (
          <button
            type="button"
            disabled={isSending || disabled}
            onClick={handleSubmit(onSubmit)}
            aria-label="Envoyer"
            className={cn(
              "size-10 rounded-full flex items-center justify-center transition-all shrink-0 mr-1",
              disabled
                ? "text-wa-icon opacity-40 cursor-not-allowed"
                : "bg-wa-green-send text-white hover:brightness-105 shadow-md cursor-pointer",
            )}
          >
            <Send size={20} />
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={onFilePicked}
      />

      {/* Click-outside overlay */}
      {(showAttMenu || showEmojiMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowAttMenu(false);
            setShowEmojiMenu(false);
          }}
        />
      )}
    </div>
  );
};
