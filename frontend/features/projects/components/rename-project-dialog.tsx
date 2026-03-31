"use client";

import * as React from "react";
import { useT } from "@/lib/i18n/client";
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
import { Textarea } from "@/components/ui/textarea";

interface RenameProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  projectDescription?: string | null;
  onRename: (newName: string, newDescription?: string | null) => void;
  allowDescriptionEdit?: boolean;
}

export function RenameProjectDialog({
  open,
  onOpenChange,
  projectName,
  projectDescription,
  onRename,
  allowDescriptionEdit = false,
}: RenameProjectDialogProps) {
  const { t } = useT("translation");
  const [name, setName] = React.useState(projectName);
  const [description, setDescription] = React.useState(
    projectDescription ?? "",
  );
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setName(projectName);
    setDescription(projectDescription ?? "");
  }, [projectDescription, projectName]);

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
    const currentDescription = projectDescription?.trim() ?? "";
    const nextDescription = trimmedDescription || null;
    const hasNameChange = trimmed !== projectName;
    const hasDescriptionChange =
      allowDescriptionEdit && trimmedDescription !== currentDescription;
    if (!trimmed || (!hasNameChange && !hasDescriptionChange)) return;
    if (allowDescriptionEdit) {
      onRename(trimmed, nextDescription);
    } else {
      onRename(trimmed);
    }
    onOpenChange(false);
  };

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
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              {t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
