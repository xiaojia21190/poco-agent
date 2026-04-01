"use client";

import * as React from "react";
import { ChevronDown, HardDrive, Sparkles } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ModelSelector } from "@/features/chat/components/chat/model-selector";
import { useModelCatalog } from "@/features/chat/hooks/use-model-catalog";
import type { ModelSelection } from "@/features/chat/lib/model-catalog";

interface RenameProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  projectDescription?: string | null;
  projectDefaultModel?: string | null;
  projectMountEnabled?: boolean;
  projectMountPath?: string | null;
  onRename: (
    newName: string,
    newDescription?: string | null,
    defaultModel?: string | null,
    mountEnabled?: boolean,
    mountPath?: string | null,
  ) => void;
  allowDescriptionEdit?: boolean;
}

export function RenameProjectDialog({
  open,
  onOpenChange,
  projectName,
  projectDescription,
  projectDefaultModel,
  projectMountEnabled = false,
  projectMountPath,
  onRename,
  allowDescriptionEdit = false,
}: RenameProjectDialogProps) {
  const { t } = useT("translation");
  const { modelOptions, isLoading: isLoadingModelCatalog } = useModelCatalog({
    enabled: open,
  });
  const [name, setName] = React.useState(projectName);
  const [description, setDescription] = React.useState(
    projectDescription ?? "",
  );
  const [advancedOpen, setAdvancedOpen] = React.useState(false);
  const [modelSelection, setModelSelection] =
    React.useState<ModelSelection | null>(null);
  const [mountEnabled, setMountEnabled] = React.useState(projectMountEnabled);
  const [mountPath, setMountPath] = React.useState(projectMountPath ?? "");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const defaultSelection = React.useMemo(() => {
    const defaultOption = modelOptions.find((option) => option.isDefault);
    return defaultOption
      ? {
          modelId: defaultOption.modelId,
          providerId: defaultOption.providerId,
        }
      : null;
  }, [modelOptions]);

  const projectModelSelection = React.useMemo(() => {
    const modelId = (projectDefaultModel || "").trim();
    if (!modelId) {
      return null;
    }
    const matchingOption = modelOptions.find((option) => option.modelId === modelId);
    return {
      modelId,
      providerId: matchingOption?.providerId ?? null,
    };
  }, [modelOptions, projectDefaultModel]);

  React.useEffect(() => {
    setName(projectName);
    setDescription(projectDescription ?? "");
    setModelSelection(projectModelSelection);
    setMountEnabled(projectMountEnabled);
    setMountPath(projectMountPath ?? "");
    setAdvancedOpen(false);
  }, [
    projectDefaultModel,
    projectDescription,
    projectModelSelection,
    projectMountEnabled,
    projectMountPath,
    projectName,
  ]);

  React.useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [open]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    const trimmedDescription = description.trim();
    const trimmedMountPath = mountPath.trim();
    const currentDescription = projectDescription?.trim() ?? "";
    const currentDefaultModel = projectDefaultModel?.trim() ?? "";
    const currentMountPath = projectMountPath?.trim() ?? "";
    const nextDescription = trimmedDescription || null;
    const nextDefaultModel = modelSelection?.modelId?.trim() || null;
    const nextMountPath = trimmedMountPath || null;
    const hasNameChange = trimmed !== projectName;
    const hasDescriptionChange =
      allowDescriptionEdit && trimmedDescription !== currentDescription;
    const hasDefaultModelChange = nextDefaultModel !== (currentDefaultModel || null);
    const hasMountEnabledChange = mountEnabled !== projectMountEnabled;
    const hasMountPathChange = nextMountPath !== (currentMountPath || null);
    if (
      !trimmed ||
      (!hasNameChange &&
        !hasDescriptionChange &&
        !hasDefaultModelChange &&
        !hasMountEnabledChange &&
        !hasMountPathChange)
    ) {
      return;
    }
    if (allowDescriptionEdit) {
      onRename(
        trimmed,
        nextDescription,
        nextDefaultModel,
        mountEnabled,
        nextMountPath,
      );
    } else {
      onRename(trimmed, undefined, nextDefaultModel, mountEnabled, nextMountPath);
    }
    onOpenChange(false);
  };

  const isMountPathInvalid = mountEnabled && !mountPath.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t("project.rename")}</DialogTitle>
            <DialogDescription>
              {t("project.renameDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="project-name">{t("project.nameLabel")}</Label>
              <Input
                ref={inputRef}
                id="project-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("project.namePlaceholder")}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    onOpenChange(false);
                  }
                }}
              />
            </div>
            {allowDescriptionEdit ? (
              <div className="grid gap-2">
                <Label htmlFor="project-description">
                  {t("project.descriptionLabel")}
                </Label>
                <Textarea
                  id="project-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t("project.detail.descriptionPlaceholder")}
                  rows={4}
                />
              </div>
            ) : null}

            <Collapsible
              open={advancedOpen}
              onOpenChange={setAdvancedOpen}
              className="rounded-2xl border border-border/60 bg-muted/20"
            >
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {t("project.advanced.title")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("project.advanced.description")}
                    </p>
                  </div>
                  <ChevronDown
                    className="size-4 shrink-0 text-muted-foreground transition-transform data-[state=open]:rotate-180"
                    data-state={advancedOpen ? "open" : "closed"}
                  />
                </button>
              </CollapsibleTrigger>

              <CollapsibleContent className="border-t border-border/60 px-4 py-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="project-default-model">
                      {t("project.advanced.defaultModelLabel")}
                    </Label>
                    <div className="flex min-h-10 items-center rounded-xl border border-border bg-background px-1">
                      <Sparkles className="ml-2 size-4 shrink-0 text-muted-foreground" />
                      <ModelSelector
                        options={modelOptions}
                        selection={modelSelection}
                        defaultSelection={defaultSelection}
                        fallbackLabel={
                          projectModelSelection?.modelId ||
                          t("project.advanced.defaultModelPlaceholder")
                        }
                        onChange={setModelSelection}
                        disabled={isLoadingModelCatalog}
                        triggerClassName="h-9 flex-1 justify-between px-2"
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/60 bg-background px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <Label
                          htmlFor="project-mount-enabled"
                          className="flex items-center gap-2 text-sm font-medium"
                        >
                          <HardDrive className="size-4 text-muted-foreground" />
                          {t("project.advanced.mountTitle")}
                        </Label>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {t("project.advanced.mountDescription")}
                        </p>
                      </div>
                      <Switch
                        id="project-mount-enabled"
                        checked={mountEnabled}
                        onCheckedChange={setMountEnabled}
                      />
                    </div>

                    {mountEnabled ? (
                      <div className="mt-4 grid gap-2">
                        <Label htmlFor="project-mount-path">
                          {t("project.advanced.mountPathLabel")}
                        </Label>
                        <Input
                          id="project-mount-path"
                          value={mountPath}
                          onChange={(e) => setMountPath(e.target.value)}
                          placeholder={t("project.advanced.mountPathPlaceholder")}
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={!name.trim() || isMountPathInvalid}>
              {t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
