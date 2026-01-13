import { useState, useCallback, useEffect } from "react";
import { tasksApi } from "@/lib/api/projects"; // Using same file for now as they are closely related in mocks
import type { TaskHistoryItem } from "@/lib/api-types";
import { useT } from "@/app/i18n/client";

export function useTaskHistory() {
  const { t } = useT("translation");
  const [taskHistory, setTaskHistory] = useState<TaskHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      const data = await tasksApi.listHistory(t);
      setTaskHistory(data);
    } catch (error) {
      console.error("Failed to fetch task history", error);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = useCallback(
    (
      title: string,
      options?: {
        timestamp?: string;
        status?: TaskHistoryItem["status"];
        projectId?: string;
      },
    ) => {
      const newTask: TaskHistoryItem = {
        id: `task-${Date.now()}`,
        title,
        timestamp: options?.timestamp || "Just now",
        status: options?.status || "pending",
        projectId: options?.projectId,
      };
      setTaskHistory((prev) => [newTask, ...prev]);
      return newTask;
    },
    [],
  );

  const removeTask = useCallback((taskId: string) => {
    setTaskHistory((prev) => prev.filter((task) => task.id !== taskId));
  }, []);

  const moveTask = useCallback((taskId: string, projectId: string | null) => {
    // Implement move logic
    console.log(`Moving task ${taskId} to project ${projectId}`);
  }, []);

  return {
    taskHistory,
    isLoading,
    addTask,
    removeTask,
    moveTask,
  };
}
