import { ExecutionSession } from "../api-types";
import { simulateSessionProgress } from "@/app/[lng]/(chat)/model/execution-mocks";

export const chatApi = {
  getSession: async (
    sessionId: string,
    currentProgress: number = 0,
  ): Promise<ExecutionSession> => {
    // In a real app: return fetchApi<ExecutionSession>(`/chat/sessions/${sessionId}`);

    // Using the existing mock simulation logic
    return new Promise((resolve) => {
      setTimeout(() => {
        const session = simulateSessionProgress(sessionId, currentProgress);
        resolve(session);
      }, 300);
    });
  },
};
