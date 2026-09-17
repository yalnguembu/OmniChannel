import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { toUtcDate, localDayDiff } from '@/models/whatsapp.models';
import type { MessageViewModel } from '@/hooks/chatViewModel';

interface MessagesListProps {
  /** Resets scroll state when the user switches discussion. */
  conversationId: string | null;
  vms: MessageViewModel[];
  isLoading: boolean;
  /** Older pages remain on the server. */
  hasOlder: boolean;
  isLoadingOlder: boolean;
  onLoadOlder: () => void;
  /** In-chat search term — every occurrence is highlighted in the bubbles. */
  highlightTerm?: string;
  /** The focused hit, painted in the stronger "current match" colour. */
  activeMatchId?: string | null;
  /** Message to scroll to and flash (search hit or date jump). */
  scrollTargetId?: string | null;
  onScrollTargetConsumed?: () => void;
  onReply: (vm: MessageViewModel) => void;
  onInfo: (id: string) => void;
  onImageClick: (url: string, alt: string) => void;
  /** Tapping a reply preview navigates to the quoted message. */
  onQuoteClick?: (messageId: string) => void;
  onForward?: (vm: MessageViewModel) => void;
  /** Selection mode for forwarding. */
  selectable?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
}

// ─── Grouping ────────────────────────────────────────────────────────────────

interface Item {
  vm: MessageViewModel;
  /** First of a run of consecutive messages from the same author. */
  isFirstOfGroup: boolean;
}

interface DayGroup {
  key: string;
  label: string;
  items: Item[];
}

/** A run of messages breaks after this long a pause, like WhatsApp. */
const GROUP_GAP_MS = 15 * 60 * 1000;

/** Distance from the bottom under which the view is considered "pinned". */
const PIN_THRESHOLD_PX = 80;
/** Distance from the bottom above which the jump-to-bottom button appears. */
const JUMP_THRESHOLD_PX = 260;
/** Distance from the top at which the next older page starts loading. */
const LOAD_OLDER_THRESHOLD_PX = 220;
/**
 * How many pages may be pulled automatically just to fill a viewport taller
 * than the conversation. Without a cap, a short page plus a tall window walks
 * the whole history one request at a time.
 */
const MAX_AUTO_FILL_PAGES = 3;

function tsOf(vm: MessageViewModel) {
  return vm.rawMessage.sentAt || vm.rawMessage.receivedAt || vm.rawMessage.createdAt;
}

function formatDateSep(ts: string | null | undefined): string {
  if (!ts) return '';
  const d = toUtcDate(ts);
  // Local calendar-day diff — same basis as the bubble times (fmtTime), so the
  // separator never disagrees with the local time shown on the messages.
  const diff = localDayDiff(ts);
  if (diff <= 0) return "Aujourd'hui";
  if (diff === 1) return 'Hier';
  if (diff < 7) return d.toLocaleDateString('fr-FR', { weekday: 'long' });
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

// ─── Component ────────────────────────────────────────────────────────────────

export const MessagesList: React.FC<MessagesListProps> = ({
  conversationId,
  vms,
  isLoading,
  hasOlder,
  isLoadingOlder,
  onLoadOlder,
  highlightTerm,
  activeMatchId,
  scrollTargetId,
  onScrollTargetConsumed,
  onReply,
  onInfo,
  onImageClick,
  onQuoteClick,
  onForward,
  selectable = false,
  selectedIds,
  onToggleSelect,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [contentEl, setContentEl] = useState<HTMLDivElement | null>(null);
  /** True while the view sits at the bottom — drives auto-follow. */
  const pinnedRef = useRef(true);
  const [showJump, setShowJump] = useState(false);
  const [newCount, setNewCount] = useState(0);
  /**
   * Briefly outlines the message the view just jumped to. Without it the
   * scroll lands silently and the eye has nothing to catch.
   */
  const [flashId, setFlashId] = useState<string | null>(null);

  // Day groups, each holding runs of same-author messages. Grouping is done
  // here (not in the bubble) so a bubble stays a pure function of its props.
  const groups = useMemo<DayGroup[]>(() => {
    const out: DayGroup[] = [];
    let current: DayGroup | null = null;
    let prev: MessageViewModel | null = null;

    for (const vm of vms) {
      const ts = tsOf(vm);
      const label = formatDateSep(ts);
      if (!current || label !== current.label) {
        current = { key: `${label}-${out.length}`, label, items: [] };
        out.push(current);
        prev = null; // a new day always starts a new run
      }

      const sameAuthor =
        prev !== null &&
        prev.isOutbound === vm.isOutbound &&
        (prev.senderName ?? '') === (vm.senderName ?? '');
      const prevTs = prev ? tsOf(prev) : null;
      const closeInTime =
        !!prevTs && !!ts && new Date(ts).getTime() - new Date(prevTs).getTime() < GROUP_GAP_MS;

      current.items.push({ vm, isFirstOfGroup: !(sameAuthor && closeInTime) });
      prev = vm;
    }
    return out;
  }, [vms]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'auto') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

  const handleJump = useCallback(() => {
    pinnedRef.current = true;
    setNewCount(0);
    scrollToBottom('smooth');
  }, [scrollToBottom]);

  // ── Anchoring across a prepend ─────────────────────────────────────────────
  // Older pages are inserted *above* the viewport, which would otherwise push
  // the read position down by the height of the new block. The scroll height
  // is snapshotted the moment a page is requested and the delta re-applied as
  // soon as the taller content is laid out, so the message under the cursor
  // stays exactly where it was.
  const anchorRef = useRef<{ scrollHeight: number; scrollTop: number } | null>(null);
  const firstId = vms.length ? vms[0].id : null;
  const prevFirstIdRef = useRef<string | null>(null);

  const requestOlder = useCallback(() => {
    if (!hasOlder || isLoadingOlder) return;
    const el = scrollRef.current;
    if (el) anchorRef.current = { scrollHeight: el.scrollHeight, scrollTop: el.scrollTop };
    onLoadOlder();
  }, [hasOlder, isLoadingOlder, onLoadOlder]);

  useLayoutEffect(() => {
    if (firstId === prevFirstIdRef.current) return;
    const hadPrevious = prevFirstIdRef.current !== null;
    prevFirstIdRef.current = firstId;
    const anchor = anchorRef.current;
    anchorRef.current = null;
    if (!hadPrevious || !anchor) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight - anchor.scrollHeight + anchor.scrollTop;
  }, [firstId]);

  // Coalesced into one read per frame — the raw scroll event fires far more
  // often than that, and each run measures layout.
  const scrollFrameRef = useRef<number | null>(null);
  const handleScroll = useCallback(() => {
    if (scrollFrameRef.current !== null) return;
    scrollFrameRef.current = requestAnimationFrame(() => {
      scrollFrameRef.current = null;
      const el = scrollRef.current;
      if (!el) return;
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
      pinnedRef.current = distance < PIN_THRESHOLD_PX;
      setShowJump(distance > JUMP_THRESHOLD_PX);
      if (pinnedRef.current) setNewCount(0);
      if (el.scrollTop < LOAD_OLDER_THRESHOLD_PX) requestOlder();
    });
  }, [requestOlder]);

  useEffect(
    () => () => {
      if (scrollFrameRef.current !== null) cancelAnimationFrame(scrollFrameRef.current);
    },
    [],
  );

  const lastId = vms.length ? vms[vms.length - 1].id : null;

  // Landing at the bottom on open: the messages arrive after the first render,
  // so the jump waits for a non-empty list rather than firing on mount.
  const initRef = useRef<{ conv: string | null; done: boolean }>({ conv: null, done: false });
  const prevLastIdRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    if (initRef.current.conv !== conversationId) {
      initRef.current = { conv: conversationId, done: false };
      prevLastIdRef.current = null;
      prevFirstIdRef.current = null;
      anchorRef.current = null;
      pinnedRef.current = true;
      autoFillsRef.current = 0;
      setNewCount(0);
      setShowJump(false);
    }
    if (!initRef.current.done && !isLoading && vms.length > 0) {
      initRef.current.done = true;
      prevLastIdRef.current = lastId;
      scrollToBottom('auto');
      // Images and audio players settle a frame later; re-pin once they have.
      requestAnimationFrame(() => scrollToBottom('auto'));
    }
  }, [conversationId, isLoading, vms.length, lastId, scrollToBottom]);

  // A genuinely new last message (sent, received, or arrived over SignalR).
  // Keyed on the id — not on vms.length — so a prepended older page or a
  // re-render never yanks the view, which is what made scrolling feel abrupt.
  useEffect(() => {
    if (!initRef.current.done || lastId === null) return;
    if (lastId === prevLastIdRef.current) return;
    prevLastIdRef.current = lastId;
    if (pinnedRef.current) scrollToBottom('smooth');
    else setNewCount((c) => c + 1);
  }, [lastId, scrollToBottom]);

  // Media resolving its height, the composer growing, the window resizing —
  // all change the geometry after the fact. Stay glued to the bottom only
  // while pinned, so someone reading history is never yanked down.
  // The content node only mounts once messages exist, hence the callback ref:
  // a plain ref would leave the observer unattached on a conversation that
  // started out empty or still loading.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !contentEl || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      if (pinnedRef.current) el.scrollTop = el.scrollHeight;
    });
    ro.observe(contentEl); // content grew (media, new bubble)
    ro.observe(el); // viewport shrank (composer/reply bar expanded)
    return () => ro.disconnect();
  }, [contentEl]);

  // A conversation shorter than the viewport never fires a scroll event, so
  // the first "load older" has to be kicked off explicitly. Strictly bounded:
  // it triggers only while there is genuinely nothing to scroll, and at most
  // MAX_AUTO_FILL_PAGES times per conversation.
  const autoFillsRef = useRef(0);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || isLoading || !hasOlder || isLoadingOlder) return;
    if (el.clientHeight === 0) return; // not laid out yet
    if (autoFillsRef.current >= MAX_AUTO_FILL_PAGES) return;
    if (el.scrollHeight > el.clientHeight) return;
    autoFillsRef.current += 1;
    requestOlder();
  }, [isLoading, hasOlder, isLoadingOlder, vms.length, requestOlder]);

  // ── Scroll to a search hit / a date ────────────────────────────────────────
  // A date jump can set the target in the same commit that inserts the older
  // page, so the node may not be laid out yet — retry for a few frames rather
  // than dropping the request.
  useEffect(() => {
    if (!scrollTargetId) return;
    let frame = 0;
    let attempts = 0;

    const tryScroll = () => {
      const el = scrollRef.current;
      if (!el) return;
      const node = el.querySelector<HTMLElement>(
        `[data-msg-id="${CSS.escape(scrollTargetId)}"]`,
      );
      if (!node) {
        if (attempts++ < 10) frame = requestAnimationFrame(tryScroll);
        else onScrollTargetConsumed?.();
        return;
      }
      // Not `scrollIntoView`: it would also scroll the page behind the app.
      const top = node.offsetTop - el.clientHeight / 2 + node.offsetHeight / 2;
      el.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      pinnedRef.current = false;
      setFlashId(scrollTargetId);
      onScrollTargetConsumed?.();
    };

    frame = requestAnimationFrame(tryScroll);
    return () => cancelAnimationFrame(frame);
  }, [scrollTargetId, onScrollTargetConsumed]);

  useEffect(() => {
    if (!flashId) return;
    const timer = setTimeout(() => setFlashId(null), 1600);
    return () => clearTimeout(timer);
  }, [flashId]);

  return (
    <div className="relative flex-1 min-h-0 flex flex-col">
      {/* Native scroll anchoring is left on: it keeps the view steady when an
          image above the viewport resolves its height while reading history. */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-[5%] lg:px-[6.5%] [scrollbar-width:thin] [scrollbar-color:rgba(0,0,0,0.2)_transparent]"
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-wa-green" />
          </div>
        ) : vms.length === 0 ? (
          <div className="text-center text-wa-muted text-sm py-12">Aucun message</div>
        ) : (
          <div ref={setContentEl} className="pt-2 pb-3">
            {/* Older-messages indicator, pinned above the first bubble */}
            {(isLoadingOlder || hasOlder) && (
              <div className="flex justify-center py-3">
                {isLoadingOlder ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs text-wa-icon shadow-[0_1px_0.5px_rgba(11,20,26,0.13)]">
                    <Loader2 size={14} className="animate-spin text-wa-green" />
                    Chargement des messages…
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={requestOlder}
                    className="rounded-full bg-white/90 px-3 py-1.5 text-xs text-wa-icon shadow-[0_1px_0.5px_rgba(11,20,26,0.13)] hover:bg-white transition-colors"
                  >
                    Charger les messages plus anciens
                  </button>
                )}
              </div>
            )}

            {groups.map((group) => (
              // Each day is its own stacking context so its pill sticks only
              // for the span of that day, instead of every pill piling up.
              <div key={group.key} className="relative">
                <div className="sticky top-1 z-20 flex justify-center py-1.5">
                  <span className="bg-white px-3 py-[5px] rounded-lg text-[12.5px] text-wa-icon shadow-[0_1px_0.5px_rgba(11,20,26,0.13)] first-letter:uppercase">
                    {group.label}
                  </span>
                </div>
                {group.items.map((item) => (
                  <MessageBubble
                    key={item.vm.id}
                    vm={item.vm}
                    isFirstOfGroup={item.isFirstOfGroup}
                    highlight={highlightTerm}
                    isActiveMatch={item.vm.id === activeMatchId}
                    isFlashing={item.vm.id === flashId}
                    selectable={selectable}
                    selected={selectedIds?.has(item.vm.id) ?? false}
                    onToggleSelect={onToggleSelect}
                    onQuoteClick={onQuoteClick}
                    onForward={onForward}
                    onReply={onReply}
                    onInfo={onInfo}
                    onImageClick={onImageClick}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Jump to the latest message — mirrors WhatsApp's floating chevron,
          badged with how many messages landed while scrolled up. */}
      {showJump && (
        <button
          type="button"
          onClick={handleJump}
          aria-label="Aller au dernier message"
          className="absolute bottom-4 right-5 z-30 size-10 rounded-full bg-white text-wa-icon shadow-[0_1px_3px_rgba(11,20,26,0.25)] flex items-center justify-center hover:bg-wa-hover transition-colors"
        >
          <ChevronDown size={22} />
          {newCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-wa-green text-white text-[11px] font-medium flex items-center justify-center">
              {newCount > 99 ? '99+' : newCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
};
