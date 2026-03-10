import type {
  CredentialState,
  ModelConfigResponse,
  ModelDefinition,
  ModelProvider,
} from "@/features/chat/types";

export interface ModelCatalogOption {
  modelId: string;
  displayName: string;
  providerId: string;
  providerName: string;
  credentialState: CredentialState;
  isAvailable: boolean;
  isDefault: boolean;
}

function buildProviderMap(
  providers: ModelConfigResponse["providers"] | undefined,
): Map<string, ModelProvider> {
  return new Map(
    (providers ?? []).map((provider) => [provider.provider_id, provider]),
  );
}

function getOrderedModels(
  modelConfig: ModelConfigResponse,
): ModelDefinition[] {
  const orderedModels: ModelDefinition[] = [];
  const seen = new Set<string>();
  const modelMap = new Map(
    modelConfig.models.map((model) => [model.model_id, model]),
  );

  const push = (modelId: string | null | undefined) => {
    const cleaned = (modelId || "").trim();
    if (!cleaned || seen.has(cleaned)) {
      return;
    }
    const model = modelMap.get(cleaned);
    if (!model) {
      return;
    }
    seen.add(cleaned);
    orderedModels.push(model);
  };

  push(modelConfig.default_model);
  modelConfig.model_list.forEach(push);
  modelConfig.models.forEach((model) => push(model.model_id));

  return orderedModels;
}

export function buildModelCatalogOptions(
  modelConfig: ModelConfigResponse | null | undefined,
): ModelCatalogOption[] {
  if (!modelConfig) {
    return [];
  }

  const defaultModel = (modelConfig.default_model || "").trim();
  const providerMap = buildProviderMap(modelConfig.providers);

  return getOrderedModels(modelConfig).map((model) => {
    const provider = providerMap.get(model.provider_id);
    const credentialState = provider?.credential_state ?? "none";

    return {
      modelId: model.model_id,
      displayName: model.display_name,
      providerId: model.provider_id,
      providerName: provider?.display_name ?? model.provider_id,
      credentialState,
      isAvailable: !model.requires_credentials || credentialState !== "none",
      isDefault: model.model_id === defaultModel,
    };
  });
}

export function findModelCatalogOption(
  modelConfig: ModelConfigResponse | null | undefined,
  modelId: string | null | undefined,
): ModelCatalogOption | null {
  const cleanModelId = (modelId || "").trim();
  if (!cleanModelId) {
    return null;
  }

  return (
    buildModelCatalogOptions(modelConfig).find(
      (option) => option.modelId === cleanModelId,
    ) ?? null
  );
}
