import { ProjectItem, TaskHistoryItem } from "../api-types";
import type { TFunction } from "i18next";

// Mock Data
const createMockProjects = (t: TFunction): ProjectItem[] => [
  {
    id: "project-1",
    name: t("mocks.projects.newProject") + " 1",
    taskCount: 12,
    icon: "📁",
  },
  {
    id: "project-2",
    name: "OpenCoWork Mobile",
    taskCount: 5,
    icon: "📱",
  },
  {
    id: "project-3",
    name: "AI Research",
    taskCount: 8,
    icon: "🤖",
  },
];

const createMockTaskHistory = (t: TFunction): TaskHistoryItem[] => [
  {
    id: "task-1",
    title: t("mocks.taskHistory.refactorFrontend"),
    timestamp: t("mocks.timestamps.twoMinutesAgo"),
    status: "completed",
  },
  {
    id: "task-2",
    title: t("mocks.taskHistory.researchClaude"),
    timestamp: t("mocks.timestamps.oneHourAgo"),
    status: "running",
  },
  {
    id: "task-3",
    title: "Update Documentation",
    timestamp: "1 day ago",
    status: "failed",
  },
  {
    id: "task-4",
    title: "Fix Login Bug",
    timestamp: "2 days ago",
    status: "completed",
  },
  {
    id: "task-5",
    title: "Optimize Database Queries",
    timestamp: "3 days ago",
    status: "pending",
  },
];

export const projectsApi = {
  list: async (t: TFunction): Promise<ProjectItem[]> => {
    // In a real app we wouldn't pass 't' here, the backend would return data and frontend would format date/status
    return new Promise((resolve) => {
      setTimeout(() => resolve(createMockProjects(t)), 500);
    });
  },

  create: async (name: string): Promise<ProjectItem> => {
    return new Promise((resolve) => {
      setTimeout(
        () =>
          resolve({
            id: `project-${Date.now()}`,
            name,
            taskCount: 0,
            icon: "📁",
          }),
        300,
      );
    });
  },
};

export const tasksApi = {
  listHistory: async (t: TFunction): Promise<TaskHistoryItem[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(createMockTaskHistory(t)), 500);
    });
  },
};
