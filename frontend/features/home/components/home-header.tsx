"use client";

import * as React from "react";
import { ChevronDown, Coins } from "lucide-react";

import { useT } from "@/lib/i18n/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreditsPopover } from "./credits-popover";
import { UserMenu } from "@/features/user/components/user-menu";
import { RepoLinkButton } from "@/components/shared/repo-link-button";
import { PageHeaderShell } from "@/components/shared/page-header-shell";
import type { SettingsTabId } from "@/features/settings/types";
import type { ModelConfigResponse } from "@/features/chat/types";
import {
  buildModelCatalogOptions,
  findModelCatalogOption,
} from "@/features/chat/lib/model-catalog";

interface HomeHeaderProps {
  onOpenSettings?: (tab?: SettingsTabId) => void;
  modelConfig?: ModelConfigResponse | null;
  selectedModel?: string | null;
  onSelectModel?: (model: string | null) => void;
}

export function HomeHeader({
  onOpenSettings,
  modelConfig,
  selectedModel,
  onSelectModel,
}: HomeHeaderProps) {
  const { t } = useT("translation");

  const defaultModel = (modelConfig?.default_model || "").trim();
  const modelOptions = React.useMemo(
    () => buildModelCatalogOptions(modelConfig),
    [modelConfig],
  );
  const defaultOption = React.useMemo(
    () => findModelCatalogOption(modelConfig, defaultModel),
    [defaultModel, modelConfig],
  );
  const effectiveOption = React.useMemo(
    () =>
      findModelCatalogOption(modelConfig, selectedModel || defaultModel) ??
      null,
    [defaultModel, modelConfig, selectedModel],
  );
  const hasSelectableModel = React.useMemo(
    () => modelOptions.some((option) => option.isAvailable),
    [modelOptions],
  );

  const isSelectorReady = Boolean(defaultModel && onSelectModel && hasSelectableModel);

  return (
    <PageHeaderShell
      left={
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-10 gap-2 px-2"
                title={t("header.switchModel")}
                disabled={!isSelectorReady}
              >
                <span className="min-w-0 max-w-[220px] truncate text-base font-medium font-serif">
                  {effectiveOption?.displayName ||
                    defaultModel ||
                    t("status.loading")}
                </span>
                <ChevronDown className="size-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-60">
              {defaultModel ? (
                <>
                  <DropdownMenuItem
                    onClick={() => onSelectModel?.(null)}
                    disabled={!defaultOption?.isAvailable}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-medium">
                        {defaultOption?.displayName || defaultModel}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {t("models.defaultTag")}
                        <span>/</span>
                        <span>{defaultOption?.providerName || "-"}</span>
                        <span>/</span>
                        <span>
                          {defaultOption?.credentialState === "user"
                            ? t("settings.providerStatusUser")
                            : defaultOption?.credentialState === "system"
                              ? t("settings.providerStatusSystem")
                              : t("settings.providerStatusNone")}
                        </span>
                      </div>
                    </div>
                    {!selectedModel ? (
                      <div className="text-primary text-sm">✓</div>
                    ) : null}
                  </DropdownMenuItem>
                  {modelOptions.filter((option) => !option.isDefault).length >
                  0 ? (
                    <DropdownMenuSeparator />
                  ) : null}
                </>
              ) : null}

              {modelOptions
                .filter((option) => !option.isDefault)
                .map((option) => (
                  <DropdownMenuItem
                    key={option.modelId}
                    onClick={() => onSelectModel?.(option.modelId)}
                    disabled={!option.isAvailable}
                    className="flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-medium">
                        {option.displayName}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{option.providerName}</span>
                        <Badge
                          variant="outline"
                          className="h-5 px-1.5 text-[10px]"
                        >
                          {option.credentialState === "user"
                            ? t("settings.providerStatusUser")
                            : option.credentialState === "system"
                              ? t("settings.providerStatusSystem")
                              : t("settings.providerStatusNone")}
                        </Badge>
                      </div>
                    </div>
                    {option.modelId === selectedModel ? (
                      <div className="text-primary text-sm">✓</div>
                    ) : null}
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      }
      right={
        <div className="flex items-center gap-1">
          <RepoLinkButton
            size="sm"
            className="flex size-8 items-center justify-center rounded-full p-0"
          />
          <CreditsPopover
            trigger={
              <Button
                variant="ghost"
                size="sm"
                className="mx-1 flex size-8 items-center justify-center rounded-full p-0 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <Coins className="size-3.5" />
              </Button>
            }
            onViewUsage={() => onOpenSettings?.("usage")}
          />
          <UserMenu onOpenSettings={(tab) => onOpenSettings?.(tab)} />
        </div>
      }
    />
  );
}
