import { apiClient, API_ENDPOINTS } from "@/lib/api-client";
import type {
  SlashCommand,
  SlashCommandCreateInput,
  SlashCommandSuggestion,
  SlashCommandUpdateInput,
} from "@/features/capabilities/slash-commands/types";

export const slashCommandsService = {
  list: async (options?: { revalidate?: number }): Promise<SlashCommand[]> => {
    return apiClient.get<SlashCommand[]>(API_ENDPOINTS.slashCommands, {
      next: { revalidate: options?.revalidate },
    });
  },

  listSuggestions: async (options?: {
    revalidate?: number;
  }): Promise<SlashCommandSuggestion[]> => {
    return apiClient.get<SlashCommandSuggestion[]>(
      API_ENDPOINTS.slashCommandSuggestions,
      {
        next: { revalidate: options?.revalidate },
      },
    );
  },

  get: async (
    commandId: number,
    options?: { revalidate?: number },
  ): Promise<SlashCommand> => {
    return apiClient.get<SlashCommand>(API_ENDPOINTS.slashCommand(commandId), {
      next: { revalidate: options?.revalidate },
    });
  },

  create: async (input: SlashCommandCreateInput): Promise<SlashCommand> => {
    return apiClient.post<SlashCommand>(API_ENDPOINTS.slashCommands, input);
  },

  update: async (
    commandId: number,
    input: SlashCommandUpdateInput,
  ): Promise<SlashCommand> => {
    return apiClient.patch<SlashCommand>(
      API_ENDPOINTS.slashCommand(commandId),
      input,
    );
  },

  remove: async (commandId: number): Promise<Record<string, unknown>> => {
    return apiClient.delete<Record<string, unknown>>(
      API_ENDPOINTS.slashCommand(commandId),
    );
  },
};
