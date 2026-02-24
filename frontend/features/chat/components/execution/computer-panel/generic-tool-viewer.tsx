"use client";

import * as React from "react";
import { CheckCircle2, XCircle } from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { SkeletonCircle, SkeletonItem } from "@/components/ui/skeleton-shimmer";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/client";
import type { ToolExecutionResponse } from "@/features/chat/types";
import { SyntaxHighlighter } from "@/lib/markdown/prism";

const TOOL_NAME_TRANSLATION_KEY_MAP: Record<string, string> = {
  bash: "bash",
  edit: "edit",
  read: "read",
  write: "write",
  glob: "glob",
  grep: "grep",
};

const codeTheme: Record<string, React.CSSProperties> = {
  'pre[class*="language-"]': {
    color: "var(--foreground)",
    background: "transparent",
  },
  'code[class*="language-"]': {
    color: "var(--foreground)",
    background: "transparent",
  },
  comment: {
    color: "var(--muted-foreground)",
    fontStyle: "italic",
  },
  punctuation: {
    color: "var(--muted-foreground)",
  },
  keyword: {
    color: "var(--primary)",
  },
  builtin: {
    color: "var(--primary)",
  },
  string: {
    color: "var(--primary)",
  },
  number: {
    color: "var(--chart-4)",
  },
  function: {
    color: "var(--chart-2)",
  },
  operator: {
    color: "var(--muted-foreground)",
  },
  variable: {
    color: "var(--foreground)",
  },
};

type GenericToolViewerProps = {
  execution: ToolExecutionResponse;
};

function normalizeToolName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[\s_-]/g, "");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parseJsonLike(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed) return "";
  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}

function stringifyForDisplay(value: unknown): string {
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function extractTextParts(value: unknown): string[] {
  if (typeof value === "string") return [value];

  if (Array.isArray(value)) {
    return value.flatMap((item) => extractTextParts(item));
  }

  if (!isRecord(value)) return [];

  const parts: string[] = [];
  if (typeof value.text === "string") parts.push(value.text);
  if (Array.isArray(value.content)) {
    parts.push(...extractTextParts(value.content));
  }
  return parts;
}

function parseToolOutputPayload(execution: ToolExecutionResponse): unknown {
  const raw = execution.tool_output?.["content"];
  const textParts = extractTextParts(raw);
  if (textParts.length > 0) {
    const joined = textParts.join("\n").trim();
    if (joined) return parseJsonLike(joined);
  }
  return parseJsonLike(raw);
}

function stripReadLineMarkers(text: string): string {
  const lineMarkerPattern = /^\s*\d+\s*(?:→|➜|->)\s?/;
  if (!lineMarkerPattern.test(text)) return text;
  return text
    .split("\n")
    .map((line) => line.replace(lineMarkerPattern, ""))
    .join("\n");
}

function guessCodeLanguage(filePath?: string | null): string {
  if (!filePath) return "text";
  const extension = filePath.split(".").pop()?.toLowerCase();
  if (!extension) return "text";
  const map: Record<string, string> = {
    ts: "typescript",
    tsx: "tsx",
    js: "javascript",
    jsx: "jsx",
    py: "python",
    go: "go",
    rs: "rust",
    java: "java",
    c: "c",
    cpp: "cpp",
    h: "cpp",
    css: "css",
    html: "html",
    md: "markdown",
    json: "json",
    yaml: "yaml",
    yml: "yaml",
    toml: "toml",
    sh: "bash",
    zsh: "bash",
    sql: "sql",
    txt: "text",
  };
  return map[extension] ?? "text";
}

function FieldRow({
  label,
  value,
}: {
  label: string;
  value: string | number | boolean | null | undefined;
}) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex items-start gap-2 text-xs">
      <span className="text-muted-foreground shrink-0">{label}:</span>
      <span className="break-all [overflow-wrap:anywhere]">
        {String(value)}
      </span>
    </div>
  );
}

function ToolOutputSkeleton({ label }: { label: string }) {
  return (
    <SkeletonItem className="h-20 min-h-0 w-full">
      <span className="sr-only">{label}</span>
    </SkeletonItem>
  );
}

function ToolHeader({
  execution,
  title,
  sectionLabel,
}: {
  execution: ToolExecutionResponse;
  title: string;
  sectionLabel: string;
}) {
  const isDone = Boolean(execution.tool_output);
  const isError = execution.is_error;

  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {sectionLabel}
      </span>
      <span className="truncate text-xs font-medium text-foreground">
        {title}
      </span>
      <span className="ml-auto shrink-0">
        {!isDone ? (
          <SkeletonCircle className="size-3.5" />
        ) : isError ? (
          <XCircle className="size-3.5 text-destructive" />
        ) : (
          <CheckCircle2 className="size-3.5 text-primary" />
        )}
      </span>
    </div>
  );
}

function ContentCodeBlock({
  content,
  language = "text",
}: {
  content: string;
  language?: string;
}) {
  return (
    <SyntaxHighlighter
      language={language}
      style={codeTheme}
      wrapLongLines
      customStyle={{
        margin: 0,
        padding: "0.75rem",
        background: "transparent",
        fontSize: "0.75rem",
        lineHeight: "1.5",
      }}
      codeTagProps={{
        style: {
          background: "transparent",
          fontFamily: "inherit",
        },
      }}
    >
      {content}
    </SyntaxHighlighter>
  );
}

function WriteToolViewer({
  execution,
  title,
}: {
  execution: ToolExecutionResponse;
  title: string;
}) {
  const { t } = useT("translation");
  const input = execution.tool_input ?? {};
  const outputPayload = React.useMemo(
    () => parseToolOutputPayload(execution),
    [execution],
  );
  const output = isRecord(outputPayload) ? outputPayload : null;
  const filePath =
    (typeof input["file_path"] === "string" && input["file_path"]) ||
    (typeof input["path"] === "string" && input["path"]) ||
    (typeof output?.["file_path"] === "string" &&
      (output["file_path"] as string)) ||
    "";
  const writtenContent =
    typeof input["content"] === "string" ? (input["content"] as string) : "";
  const outputText = stringifyForDisplay(outputPayload);
  const hasOutput = Boolean(execution.tool_output);

  return (
    <div className="space-y-3">
      <ToolHeader
        execution={execution}
        title={title}
        sectionLabel={t("chat.toolCards.tools.tool")}
      />

      <div className="space-y-1 rounded-md border bg-background p-3">
        <FieldRow
          label={t("chat.toolCards.fields.filePath")}
          value={filePath}
        />
        <FieldRow
          label={t("chat.toolCards.fields.bytes")}
          value={
            typeof output?.["bytes_written"] === "number"
              ? output["bytes_written"]
              : null
          }
        />
      </div>

      <div className="space-y-2">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {t("chat.toolCards.fields.content")}
        </div>
        <div className="w-full min-w-0 max-w-full overflow-hidden rounded-md border bg-background">
          {writtenContent ? (
            <ContentCodeBlock
              content={writtenContent}
              language={guessCodeLanguage(filePath)}
            />
          ) : (
            <div className="p-3 text-xs text-muted-foreground">
              {t("chat.toolCards.text.empty")}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {t("chat.output")}
        </div>
        {hasOutput ? (
          <div
            className={cn(
              "w-full min-w-0 max-w-full overflow-hidden rounded-md border p-3",
              execution.is_error
                ? "border-destructive/30 bg-destructive/5"
                : "border-border bg-background",
            )}
          >
            <pre className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] [word-break:break-word] text-xs">
              {outputText.trim() ? outputText : t("chat.toolCards.text.empty")}
            </pre>
          </div>
        ) : (
          <ToolOutputSkeleton label={t("computer.terminal.running")} />
        )}
      </div>
    </div>
  );
}

function ReadToolViewer({
  execution,
  title,
}: {
  execution: ToolExecutionResponse;
  title: string;
}) {
  const { t } = useT("translation");
  const input = execution.tool_input ?? {};
  const outputPayload = React.useMemo(
    () => parseToolOutputPayload(execution),
    [execution],
  );
  const output = isRecord(outputPayload) ? outputPayload : null;
  const filePath =
    (typeof input["file_path"] === "string" && input["file_path"]) ||
    (typeof input["path"] === "string" && input["path"]) ||
    "";

  const contentText =
    typeof output?.["content"] === "string" ? output["content"] : null;
  const imageBase64 =
    typeof output?.["image"] === "string" ? output["image"] : null;
  const imageMimeType =
    typeof output?.["mime_type"] === "string"
      ? output["mime_type"]
      : "image/png";
  const hasOutput = Boolean(execution.tool_output);

  return (
    <div className="space-y-3">
      <ToolHeader
        execution={execution}
        title={title}
        sectionLabel={t("chat.toolCards.tools.tool")}
      />

      <div className="space-y-1 rounded-md border bg-background p-3">
        <FieldRow
          label={t("chat.toolCards.fields.filePath")}
          value={filePath}
        />
        <FieldRow
          label={t("chat.toolCards.fields.totalLines")}
          value={
            typeof output?.["total_lines"] === "number"
              ? output["total_lines"]
              : null
          }
        />
        <FieldRow
          label={t("chat.toolCards.fields.linesReturned")}
          value={
            typeof output?.["lines_returned"] === "number"
              ? output["lines_returned"]
              : null
          }
        />
      </div>

      <div className="space-y-2">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {t("chat.output")}
        </div>
        {!hasOutput ? (
          <ToolOutputSkeleton label={t("computer.terminal.running")} />
        ) : imageBase64 ? (
          <div className="rounded-md border bg-background p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`data:${imageMimeType};base64,${imageBase64}`}
              alt={t("computer.browser.screenshotAlt")}
              className="mx-auto max-h-[340px] w-auto rounded-sm object-contain"
            />
          </div>
        ) : (
          <div
            className={cn(
              "w-full min-w-0 max-w-full overflow-hidden rounded-md border",
              execution.is_error
                ? "border-destructive/30 bg-destructive/5"
                : "border-border bg-background",
            )}
          >
            <ContentCodeBlock
              content={
                (contentText ? stripReadLineMarkers(contentText) : "") ||
                stripReadLineMarkers(
                  stringifyForDisplay(outputPayload).trim(),
                ) ||
                t("chat.toolCards.text.empty")
              }
              language={guessCodeLanguage(filePath)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function EditToolViewer({
  execution,
  title,
}: {
  execution: ToolExecutionResponse;
  title: string;
}) {
  const { t } = useT("translation");
  const input = execution.tool_input ?? {};
  const outputPayload = React.useMemo(
    () => parseToolOutputPayload(execution),
    [execution],
  );
  const output = isRecord(outputPayload) ? outputPayload : null;
  const filePath =
    (typeof input["file_path"] === "string" && input["file_path"]) ||
    (typeof input["path"] === "string" && input["path"]) ||
    (typeof output?.["file_path"] === "string" &&
      (output["file_path"] as string)) ||
    "";
  const oldString =
    typeof input["old_string"] === "string"
      ? (input["old_string"] as string)
      : "";
  const newString =
    typeof input["new_string"] === "string"
      ? (input["new_string"] as string)
      : "";
  const hasOutput = Boolean(execution.tool_output);
  const outputText = stringifyForDisplay(outputPayload);

  return (
    <div className="space-y-3">
      <ToolHeader
        execution={execution}
        title={title}
        sectionLabel={t("chat.toolCards.tools.tool")}
      />

      <div className="space-y-1 rounded-md border bg-background p-3">
        <FieldRow
          label={t("chat.toolCards.fields.filePath")}
          value={filePath}
        />
        <FieldRow
          label={t("chat.toolCards.fields.replaceAll")}
          value={
            typeof input["replace_all"] === "boolean"
              ? input["replace_all"]
              : null
          }
        />
        <FieldRow
          label={t("chat.toolCards.fields.replacements")}
          value={
            typeof output?.["replacements"] === "number"
              ? output["replacements"]
              : null
          }
        />
      </div>

      <div className="space-y-2">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {t("chat.input")}
        </div>
        <div className="grid grid-cols-1 gap-2">
          <div className="overflow-hidden rounded-md border bg-background">
            <div className="border-b px-3 py-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
              {t("chat.toolCards.fields.oldString")}
            </div>
            <ContentCodeBlock
              content={oldString || t("chat.toolCards.text.empty")}
              language={guessCodeLanguage(filePath)}
            />
          </div>
          <div className="overflow-hidden rounded-md border bg-background">
            <div className="border-b px-3 py-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
              {t("chat.toolCards.fields.newString")}
            </div>
            <ContentCodeBlock
              content={newString || t("chat.toolCards.text.empty")}
              language={guessCodeLanguage(filePath)}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {t("chat.output")}
        </div>
        {hasOutput ? (
          <div
            className={cn(
              "w-full min-w-0 max-w-full overflow-hidden rounded-md border p-3",
              execution.is_error
                ? "border-destructive/30 bg-destructive/5"
                : "border-border bg-background",
            )}
          >
            <pre className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] [word-break:break-word] text-xs">
              {outputText.trim() ? outputText : t("chat.toolCards.text.empty")}
            </pre>
          </div>
        ) : (
          <ToolOutputSkeleton label={t("computer.terminal.running")} />
        )}
      </div>
    </div>
  );
}

function GlobToolViewer({
  execution,
  title,
}: {
  execution: ToolExecutionResponse;
  title: string;
}) {
  const { t } = useT("translation");
  const input = execution.tool_input ?? {};
  const outputPayload = React.useMemo(
    () => parseToolOutputPayload(execution),
    [execution],
  );
  const output = isRecord(outputPayload) ? outputPayload : null;
  const matches = Array.isArray(output?.["matches"])
    ? (output?.["matches"] as unknown[]).filter(
        (item): item is string => typeof item === "string",
      )
    : [];

  return (
    <div className="space-y-3">
      <ToolHeader
        execution={execution}
        title={title}
        sectionLabel={t("chat.toolCards.tools.tool")}
      />

      <div className="space-y-1 rounded-md border bg-background p-3">
        <FieldRow
          label={t("chat.toolCards.fields.pattern")}
          value={typeof input["pattern"] === "string" ? input["pattern"] : null}
        />
        <FieldRow
          label={t("chat.toolCards.fields.path")}
          value={typeof input["path"] === "string" ? input["path"] : null}
        />
        <FieldRow
          label={t("chat.toolCards.fields.total")}
          value={
            typeof output?.["count"] === "number"
              ? output["count"]
              : matches.length
          }
        />
        <FieldRow
          label={t("chat.toolCards.fields.searchPath")}
          value={
            typeof output?.["search_path"] === "string"
              ? output["search_path"]
              : null
          }
        />
      </div>

      <div className="space-y-2">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {t("chat.toolCards.fields.matches")}
        </div>
        <div className="rounded-md border bg-background p-3">
          {matches.length > 0 ? (
            <ul className="space-y-1 text-xs font-mono">
              {matches.map((item) => (
                <li key={item} className="break-all [overflow-wrap:anywhere]">
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <pre className="text-xs whitespace-pre-wrap break-words [overflow-wrap:anywhere] [word-break:break-word]">
              {stringifyForDisplay(outputPayload).trim() ||
                t("chat.toolCards.text.empty")}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

function GrepToolViewer({
  execution,
  title,
}: {
  execution: ToolExecutionResponse;
  title: string;
}) {
  const { t } = useT("translation");
  const input = execution.tool_input ?? {};
  const outputPayload = React.useMemo(
    () => parseToolOutputPayload(execution),
    [execution],
  );
  const output = isRecord(outputPayload) ? outputPayload : null;
  const matchItems = Array.isArray(output?.["matches"])
    ? output?.["matches"]
    : [];
  const fileItems = Array.isArray(output?.["files"]) ? output?.["files"] : [];

  return (
    <div className="space-y-3">
      <ToolHeader
        execution={execution}
        title={title}
        sectionLabel={t("chat.toolCards.tools.tool")}
      />

      <div className="space-y-1 rounded-md border bg-background p-3">
        <FieldRow
          label={t("chat.toolCards.fields.pattern")}
          value={typeof input["pattern"] === "string" ? input["pattern"] : null}
        />
        <FieldRow
          label={t("chat.toolCards.fields.path")}
          value={typeof input["path"] === "string" ? input["path"] : null}
        />
        <FieldRow
          label={t("chat.toolCards.fields.outputMode")}
          value={
            typeof input["output_mode"] === "string"
              ? input["output_mode"]
              : null
          }
        />
        <FieldRow
          label={t("chat.toolCards.fields.totalMatches")}
          value={
            typeof output?.["total_matches"] === "number"
              ? output["total_matches"]
              : typeof output?.["count"] === "number"
                ? output["count"]
                : null
          }
        />
      </div>

      <div className="space-y-2">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {t("chat.output")}
        </div>
        <div className="rounded-md border bg-background p-3">
          {matchItems.length > 0 ? (
            <ul className="space-y-2 text-xs">
              {matchItems.map((item, index) => {
                if (!isRecord(item)) {
                  return (
                    <li key={`m-${index}`} className="font-mono break-all">
                      {stringifyForDisplay(item)}
                    </li>
                  );
                }
                const file =
                  typeof item["file"] === "string"
                    ? (item["file"] as string)
                    : "";
                const lineNumber =
                  typeof item["line_number"] === "number"
                    ? (item["line_number"] as number)
                    : null;
                const line =
                  typeof item["line"] === "string"
                    ? (item["line"] as string)
                    : "";
                return (
                  <li key={`m-${index}`} className="space-y-1">
                    <div className="font-mono text-muted-foreground break-all">
                      {file}
                      {lineNumber !== null ? `:${lineNumber}` : ""}
                    </div>
                    <div className="font-mono break-all [overflow-wrap:anywhere]">
                      {line || t("chat.toolCards.text.empty")}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : fileItems.length > 0 ? (
            <ul className="space-y-1 text-xs font-mono">
              {fileItems.map((item, index) => (
                <li
                  key={`f-${index}`}
                  className="break-all [overflow-wrap:anywhere]"
                >
                  {typeof item === "string" ? item : stringifyForDisplay(item)}
                </li>
              ))}
            </ul>
          ) : (
            <pre className="text-xs whitespace-pre-wrap break-words [overflow-wrap:anywhere] [word-break:break-word]">
              {stringifyForDisplay(outputPayload).trim() ||
                t("chat.toolCards.text.empty")}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

function DefaultToolViewer({
  execution,
  title,
}: {
  execution: ToolExecutionResponse;
  title: string;
}) {
  const { t } = useT("translation");
  const isDone = Boolean(execution.tool_output);
  const inputText = stringifyForDisplay(execution.tool_input ?? {});
  const outputPayload = React.useMemo(
    () => parseToolOutputPayload(execution),
    [execution],
  );
  const outputText = stringifyForDisplay(outputPayload);

  return (
    <div className="space-y-3">
      <ToolHeader
        execution={execution}
        title={title}
        sectionLabel={t("chat.toolCards.tools.tool")}
      />
      <div className="space-y-2">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {t("chat.input")}
        </div>
        <div className="rounded-md border bg-background p-3">
          <pre className="text-xs whitespace-pre-wrap break-words [overflow-wrap:anywhere] [word-break:break-word]">
            {inputText}
          </pre>
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {t("chat.output")}
        </div>
        {isDone ? (
          <div
            className={cn(
              "rounded-md border p-3",
              execution.is_error
                ? "border-destructive/30 bg-destructive/5"
                : "border-border bg-background",
            )}
          >
            <pre className="text-xs whitespace-pre-wrap break-words [overflow-wrap:anywhere] [word-break:break-word]">
              {outputText.trim() ? outputText : t("chat.toolCards.text.empty")}
            </pre>
          </div>
        ) : (
          <ToolOutputSkeleton label={t("computer.terminal.running")} />
        )}
      </div>
    </div>
  );
}

export function GenericToolViewer({ execution }: GenericToolViewerProps) {
  const { t } = useT("translation");

  const normalizedToolName = normalizeToolName(execution.tool_name || "");
  const translationKey = TOOL_NAME_TRANSLATION_KEY_MAP[normalizedToolName];
  const title = translationKey
    ? t(`chat.toolCards.tools.${translationKey}`).trim()
    : (execution.tool_name || t("chat.toolCards.tools.tool")).trim();

  const body = (() => {
    switch (normalizedToolName) {
      case "write":
        return <WriteToolViewer execution={execution} title={title} />;
      case "read":
        return <ReadToolViewer execution={execution} title={title} />;
      case "edit":
        return <EditToolViewer execution={execution} title={title} />;
      case "glob":
        return <GlobToolViewer execution={execution} title={title} />;
      case "grep":
        return <GrepToolViewer execution={execution} title={title} />;
      default:
        return <DefaultToolViewer execution={execution} title={title} />;
    }
  })();

  return (
    <div className="h-full w-full bg-card">
      <ScrollArea className="h-full">
        <div className="p-4 font-mono text-xs space-y-3 min-w-0 max-w-full">
          {body}
        </div>
      </ScrollArea>
    </div>
  );
}
