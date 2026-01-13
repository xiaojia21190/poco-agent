import { useState, useEffect, useCallback } from "react";
import { chatApi } from "@/lib/api/chat";
import type { ExecutionSession } from "@/lib/api-types";

const POLLING_INTERVAL = 2500;

export function useChat(sessionId: string) {
  const [session, setSession] = useState<ExecutionSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSession = useCallback(async () => {
    if (!sessionId) return;

    try {
      const currentProgress = session?.progress || 0;
      const updatedSession = await chatApi.getSession(
        sessionId,
        currentProgress,
      );

      // Handle user prompt persistence (logic from original hook)
      if (!session) {
        const storedPrompt = localStorage.getItem(
          `session_prompt_${sessionId}`,
        );
        if (storedPrompt) {
          updatedSession.user_prompt = storedPrompt;
        }
      } else if (session.user_prompt) {
        updatedSession.user_prompt = session.user_prompt;
      }

      setSession(updatedSession);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch session:", err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, session]);

  // Initial load
  useEffect(() => {
    fetchSession();
  }, [fetchSession]); // Run once on mount

  // Polling
  useEffect(() => {
    const shouldPoll =
      session?.status === "running" || session?.status === "accepted";
    if (!shouldPoll) return;

    const interval = setInterval(fetchSession, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchSession, session?.status]);

  return {
    session,
    isLoading,
    error,
    refetch: fetchSession,
  };
}
