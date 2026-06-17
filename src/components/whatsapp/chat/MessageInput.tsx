import React, { useRef, useState } from "react";
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
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { cn } from "@/lib/utils";
import {
  SendMessageFormSchema,
  type SendMessageForm,
} from "@/models/whatsapp.models";
import type { ReplyTo } from "@/store/useWhatsappStore";

interface MessageInputProps {
  replyTo: ReplyTo | null;
  onCancelReply: () => void;
  onSend: (text: string) => Promise<void>;
  onSendMedia: (
    file: File,
    type: "image" | "audio" | "document",
  ) => Promise<void>;
  onOpenFlow: () => void;
  isSending: boolean;
  inputRef: React.RefObject<HTMLTextAreaElement>;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  replyTo,
  onCancelReply,
  onSend,
  onSendMedia,
  onOpenFlow,
  isSending,
  inputRef,
}) => {
  const [showAttMenu, setShowAttMenu] = useState(false);
  const [showEmojiMenu, setShowEmojiMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileTypeRef = useRef<"image" | "audio" | "document">("document");

  const { register, handleSubmit, reset, watch, setValue } =
    useForm<SendMessageForm>({
      resolver: zodResolver(SendMessageFormSchema),
      defaultValues: { content: "" },
    });

  const content = watch("content");
  const hasText = !!content?.trim();

  const onSubmit = async (data: SendMessageForm) => {
    reset();
    autoResize();
    await onSend(data.content);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  const autoResize = () => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height =
        Math.min(inputRef.current.scrollHeight, 120) + "px";
    }
  };

  const pickFile = (accept: string, type: "image" | "audio" | "document") => {
    fileTypeRef.current = type;
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept;
      fileInputRef.current.click();
    }
    setShowAttMenu(false);
  };

  const onFilePicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await onSendMedia(file, fileTypeRef.current);
    e.target.value = "";
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
    // Outer wrapper is the containing block for popups so they always stay
    // within the chat column and never overflow the viewport horizontally.
    <div className="shrink-0 relative">
      {/* Attachment popup — relative to this full-width container */}
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
              onClick={() => pickFile("image/*,video/*", "image")}
            >
              <span className="size-9 rounded-full bg-[#bf59cf] flex items-center justify-center text-white shrink-0">
                <Image size={16} />
              </span>
              Photos &amp; vidéos
            </button>
            <button
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-wa-text hover:bg-wa-hover transition-colors"
              onClick={() => pickFile("application/*,text/*", "document")}
            >
              <span className="size-9 rounded-full bg-[#0e6ede] flex items-center justify-center text-white shrink-0">
                <FileText size={16} />
              </span>
              Document
            </button>
            <button
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-wa-text hover:bg-wa-hover transition-colors"
              onClick={() => pickFile("audio/*", "audio")}
            >
              <span className="size-9 rounded-full bg-[#e05c47] flex items-center justify-center text-white shrink-0">
                <Music size={16} />
              </span>
              Audio
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

      {/* Reply bar */}
      <AnimatePresence>
        {replyTo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-3 bg-wa-bubble-in border-t border-wa-border px-4 py-2 overflow-hidden"
          >
            <div className="flex-1 min-w-0 border-l-4 border-wa-teal pl-3">
              <div className="text-xs font-bold text-wa-teal truncate">
                {replyTo.author}
              </div>
              <div className="text-xs text-wa-muted truncate">
                {replyTo.content}
              </div>
            </div>
            <button
              onClick={onCancelReply}
              className="text-wa-icon hover:text-wa-text transition-colors p-1 rounded-full hover:bg-wa-active shrink-0"
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input row */}
      <div className="flex items-end rounded-full bg-white shadow-lg mx-4 mb-2 gap-2 px-4 py-2.5">
        {/* Attachment button */}
        <button
          type="button"
          className="size-10 rounded-full flex items-center justify-center text-wa-icon hover:bg-black/5 transition-colors shrink-0 mb-px"
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
          className="size-10 rounded-full flex items-center justify-center text-wa-icon hover:bg-black/5 transition-colors shrink-0 mb-px"
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
                (inputRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = e;
            }}
            rows={1}
            placeholder="Tapez un message"
            onKeyDown={onKeyDown}
            onInput={autoResize}
            className="w-full border-none outline-none resize-none lg:text-sm text-wa-text placeholder:text-wa-muted bg-transparent max-h-28 leading-snug"
          />
        </div>

        {/* Send / Mic button */}
        <button
          type="button"
          disabled={isSending}
          onClick={hasText ? handleSubmit(onSubmit) : undefined}
          className={cn(
            "size-10 rounded-full cursor-pointer flex items-center justify-center transition-all shrink-0 mr-1",
            hasText
              ? "bg-wa-green-send text-white hover:brightness-105 shadow-md"
              : "text-wa-icon hover:bg-black/5",
          )}
        >
          {hasText ? <Send size={20} /> : <Mic size={22} />}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
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
