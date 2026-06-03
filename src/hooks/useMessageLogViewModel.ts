import { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  postApiMessageSearchOptions,
  postApiMessageEventSearchOptions,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";
import type { MessageDto } from "@/api/generated/types";

/**
 * ViewModel for the global Message Log page.
 */
export function useMessageLogViewModel() {
  const { handleRequestError } = useErrorHandling();

  // --- List State ---
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // New Filters
  const [createFrom, setCreateFrom] = useState("");
  const [createTo, setCreateTo] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [channelId, setChannelId] = useState("");
  const [campaignId, setCampaignId] = useState("");

  // --- Detail State ---
  const [activeMsg, setActiveMsg] = useState<MessageDto | null>(null);
  const [detailTab, setDetailTab] = useState<"detail" | "events" | "content">(
    "detail",
  );

  // --- Queries ---
  const messagesQuery = useQuery({
    ...postApiMessageSearchOptions({
      body: {
        pageNumber: page,
        pageSize,
        searchTerm: search || undefined,
        status: filter !== "all" ? filter : undefined,
        channelId: channelId || undefined,
        campaignId: campaignId || undefined,
        // createFrom: createFrom || undefined,
        // createTo: createTo || undefined,
        sortBy: sort || undefined,
        // sortOrder: sortOrder || undefined,
      },
    }),
    select: (res) => {
      const items = Array.isArray(res?.data) ? res.data : res?.data?.items || [];
      const totalCount =
        res?.metadata?.totalCount ||
        (Array.isArray(res?.data) ? res.data.length : res?.data?.totalCount || 0);

      return { items, totalCount };
    },
  });

  useEffect(() => {
    if (messagesQuery.isError && messagesQuery.error) {
      handleRequestError(messagesQuery.error);
    }
  }, [messagesQuery.isError, messagesQuery.error, handleRequestError]);

  const messages = messagesQuery.data?.items || [];
  const listTotalCount = messagesQuery.data?.totalCount || 0;

  // --- Derived State (Counting by status for the whole list) ---
  const counts = useMemo(
    () => ({
      all: listTotalCount,
      delivered: messages.filter(
        (m: MessageDto) => m.status === "sent" || m.status === "delivered",
      ).length,
      failed: messages.filter((m: MessageDto) => m.status === "failed").length,
      pending: messages.filter((m: MessageDto) => m.status === "pending")
        .length,
    }),
    [messages, listTotalCount],
  );

  const eventsQuery = useQuery({
    ...postApiMessageEventSearchOptions({
      body: {
        messageId: activeMsg?.id || "",
        pageNumber: 1,
        pageSize: 50,
      },
    }),
    select: (res) => res?.data?.items || [],
    enabled: !!activeMsg && detailTab === "events",
  });

  // --- Handlers ---
  const handleSelectMessage = useCallback((msg: MessageDto) => {
    setActiveMsg(msg);
    setDetailTab("detail");
  }, []);

  const handleSearch = useCallback((val: string) => {
    setSearch(val);
    setPage(1);
  }, []);

  const handleFilter = useCallback((val: string) => {
    setFilter(val);
    setPage(1);
  }, []);

  return {
    // Data
    messages,
    totalCount: listTotalCount,
    counts,
    events: eventsQuery.data || [],
    isLoading: messagesQuery.isLoading,
    isEventsLoading: eventsQuery.isLoading,

    // State
    search,
    filter,
    page,
    pageSize,
    activeMsg,
    detailTab,
    createFrom,
    createTo,
    sort,
    sortOrder,
    channelId,
    campaignId,

    // Handlers
    handleSearch,
    handleFilter,
    setPage,
    setPageSize,
    setActiveMsg,
    setDetailTab,
    handleSelectMessage,
    setCreateFrom,
    setCreateTo,
    setSort,
    setSortOrder,
    setChannelId,
    setCampaignId,
  };
}
