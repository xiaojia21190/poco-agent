"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getToolExecutionsAction,
  getToolExecutionsDeltaAction,
} from "@/features/chat/actions/query-actions";
import type { ToolExecutionResponse } from "@/features/chat/types";

interface UseToolExecutionsOptions {
  sessionId?: string;
  isActive?: boolean;
  pollingIntervalMs?: number;
  limit?: number;
}

export function useToolExecutions({
  sessionId,
  isActive = false,
  pollingIntervalMs = 2000,
  limit = 500,
}: UseToolExecutionsOptions) {
  const [executions, setExecutions] = useState<ToolExecutionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const lastSessionIdRef = useRef<string | null>(null);
  const hasLoadedOnceRef = useRef(false);
  const requestSeqRef = useRef(0);
  const prevIsActiveRef = useRef(isActive);
  const cursorRef = useRef<{ afterCreatedAt?: string; afterId?: string }>({});

  const mergeUniqueById = useCallback(
    (base: ToolExecutionResponse[], incoming: ToolExecutionResponse[]) => {
      if (incoming.length === 0) return base;
      const merged = [...base];
      const seen = new Set(base.map((item) => item.id));
      for (const item of incoming) {
        if (seen.has(item.id)) continue;
        seen.add(item.id);
        merged.push(item);
      }
      merged.sort((a, b) => {
        if (a.created_at === b.created_at) {
          return a.id.localeCompare(b.id);
        }
        return a.created_at.localeCompare(b.created_at);
      });
      return merged;
    },
    [],
  );

  const updateCursor = useCallback((items: ToolExecutionResponse[]) => {
    const last = items.at(-1);
    if (!last) {
      cursorRef.current = {};
      return;
    }
    cursorRef.current = {
      afterCreatedAt: last.created_at,
      afterId: last.id,
    };
  }, []);

  const fetchSnapshot = useCallback(
    async (replace = false) => {
      if (!sessionId) return;
      const seq = (requestSeqRef.current += 1);
      const shouldShowLoading = !hasLoadedOnceRef.current && replace;
      if (shouldShowLoading) {
        setIsLoading(true);
      }

      const offset = replace ? 0 : executions.length;

      try {
        const data = await getToolExecutionsAction({
          sessionId,
          limit,
          offset,
        });
        if (seq !== requestSeqRef.current) return;

        if (replace) {
          setExecutions(data);
          updateCursor(data);
        } else {
          const merged = mergeUniqueById(executions, data);
          setExecutions(merged);
          updateCursor(merged);
        }

        setHasMore(data.length === limit);
        setError(null);
      } catch (err) {
        if (seq !== requestSeqRef.current) return;
        setError(err as Error);
      } finally {
        if (seq !== requestSeqRef.current) return;
        setIsLoading(false);
        setIsLoadingMore(false);
        hasLoadedOnceRef.current = true;
      }
    },
    [executions, limit, mergeUniqueById, sessionId, updateCursor],
  );

  const fetchDelta = useCallback(async () => {
    if (!sessionId) return;
    const seq = requestSeqRef.current;
    const { afterCreatedAt, afterId } = cursorRef.current;
    if (!afterCreatedAt) {
      await fetchSnapshot(true);
      return;
    }

    try {
      const appended: ToolExecutionResponse[] = [];
      let currentCreatedAt = afterCreatedAt;
      let currentId = afterId;
      let hasMore = true;
      let guard = 0;

      // Drain a few pages in one poll cycle to catch up quickly after bursts.
      while (hasMore && guard < 5) {
        const payload = await getToolExecutionsDeltaAction({
          sessionId,
          afterCreatedAt: currentCreatedAt,
          afterId: currentId,
          limit,
        });
        appended.push(...payload.items);
        hasMore = payload.has_more;
        currentCreatedAt =
          payload.next_after_created_at ?? payload.items.at(-1)?.created_at;
        currentId = payload.next_after_id ?? payload.items.at(-1)?.id;
        if (!currentCreatedAt || !currentId) break;
        guard += 1;
      }

      if (seq !== requestSeqRef.current) return;
      if (appended.length === 0) return;

      setExecutions((prev) => {
        const merged = mergeUniqueById(prev, appended);
        updateCursor(merged);
        return merged;
      });
      setError(null);
    } catch (err) {
      if (seq !== requestSeqRef.current) return;
      setError(err as Error);
    }
  }, [fetchSnapshot, limit, mergeUniqueById, sessionId, updateCursor]);

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore || !sessionId) return;
    setIsLoadingMore(true);
    void fetchSnapshot(false);
  }, [fetchSnapshot, hasMore, isLoadingMore, sessionId]);

  // Reset state when session changes.
  useEffect(() => {
    if (!sessionId) return;
    if (lastSessionIdRef.current === sessionId) return;
    lastSessionIdRef.current = sessionId;
    hasLoadedOnceRef.current = false;
    requestSeqRef.current += 1;
    setExecutions([]);
    setError(null);
    setIsLoading(false);
    setIsLoadingMore(false);
    setHasMore(true);
    cursorRef.current = {};
    void fetchSnapshot(true);
  }, [fetchSnapshot, sessionId]);

  // Poll while active.
  useEffect(() => {
    if (!sessionId) return;
    if (!isActive) return;
    const id = setInterval(() => {
      void fetchDelta();
    }, pollingIntervalMs);
    return () => clearInterval(id);
  }, [fetchDelta, isActive, pollingIntervalMs, sessionId]);

  // When a session transitions from active -> terminal, fetch once more so the UI
  // can pick up the final tool_output written during cancellation/failure.
  useEffect(() => {
    if (!sessionId) return;
    const wasActive = prevIsActiveRef.current;
    prevIsActiveRef.current = isActive;
    if (wasActive && !isActive) {
      void fetchDelta();
    }
  }, [fetchDelta, isActive, sessionId]);

  return {
    executions,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    refetch: () => fetchSnapshot(true),
    loadMore,
  };
}
