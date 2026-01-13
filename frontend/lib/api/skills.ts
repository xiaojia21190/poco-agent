import { Skill } from "../api-types";

// Mock Data
const SKILL_ITEMS: Skill[] = [
  {
    id: "1",
    nameKey: "library.skillsPage.items.webSearch.name",
    descKey: "library.skillsPage.items.webSearch.description",
    source: "Google Search API",
  },
  {
    id: "2",
    nameKey: "library.skillsPage.items.codeExecution.name",
    descKey: "library.skillsPage.items.codeExecution.description",
    source: "Python Sandbox",
  },
  {
    id: "3",
    nameKey: "library.skillsPage.items.imageGeneration.name",
    descKey: "library.skillsPage.items.imageGeneration.description",
    source: "DALL-E 3",
  },
  {
    id: "4",
    nameKey: "library.skillsPage.items.textAnalysis.name",
    descKey: "library.skillsPage.items.textAnalysis.description",
    source: "Natural Language API",
  },
  {
    id: "5",
    nameKey: "library.skillsPage.items.dataVisualization.name",
    descKey: "library.skillsPage.items.dataVisualization.description",
    source: "Matplotlib",
  },
];

export const skillsApi = {
  list: async (): Promise<Skill[]> => {
    // In a real app: return fetchApi<Skill[]>("/skills");
    return new Promise((resolve) => {
      setTimeout(() => resolve(SKILL_ITEMS), 500);
    });
  },
};
