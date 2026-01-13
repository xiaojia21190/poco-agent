"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { FileNode } from "./file-browser";
import { File, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

// TODO: fix document viewer

// Dynamically import DocViewer to avoid SSR issues
const DocViewer = dynamic(() => import("react-doc-viewer"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">加载文档查看器...</p>
      </div>
    </div>
  ),
});

interface DocumentViewerProps {
  file?: FileNode;
}

// Supported file types for react-doc-viewer
const SUPPORTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "text/plain",
  "text/html",
];

// File types that need special handling or are not supported
const UNSUPPORTED_TYPES = [
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

export function DocumentViewer({ file }: DocumentViewerProps) {
  if (!file) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-muted-foreground">
          <File className="size-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">请从文件浏览器选择文件</p>
          <p className="text-xs mt-1">支持 PDF、Word、Excel、图片等格式</p>
        </div>
      </div>
    );
  }

  if (!file.url) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-muted-foreground">
          <File className="size-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">文件无可用URL</p>
          <p className="text-xs mt-1">文件名: {file.name}</p>
        </div>
      </div>
    );
  }

  const mimeType = file.mimeType || getFileTypeFromUrl(file.url);

  // Handle unsupported file types (like PowerPoint)
  if (UNSUPPORTED_TYPES.includes(mimeType)) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-muted-foreground max-w-md px-6">
          <File className="size-16 mx-auto mb-4 opacity-50" />
          <p className="text-base font-medium mb-2">不支持的文件格式</p>
          <p className="text-sm mb-4">
            当前不支持预览 {file.name.split(".").pop()?.toUpperCase()}{" "}
            格式的文件
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(file.url, "_blank")}
              className="gap-2"
            >
              <ExternalLink className="size-4" />
              在新窗口打开
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const link = document.createElement("a");
                link.href = file.url!;
                link.download = file.name;
                link.click();
              }}
              className="gap-2"
            >
              <Download className="size-4" />
              下载文件
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Check if file type is supported
  if (!SUPPORTED_TYPES.includes(mimeType)) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-muted-foreground max-w-md px-6">
          <File className="size-16 mx-auto mb-4 opacity-50" />
          <p className="text-base font-medium mb-2">不支持的文件格式</p>
          <p className="text-sm mb-4">文件类型 {mimeType} 暂不支持预览</p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(file.url, "_blank")}
              className="gap-2"
            >
              <ExternalLink className="size-4" />
              在新窗口打开
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const link = document.createElement("a");
                link.href = file.url!;
                link.download = file.name;
                link.click();
              }}
              className="gap-2"
            >
              <Download className="size-4" />
              下载文件
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const documents = [
    {
      uri: file.url,
      fileName: file.name,
      fileType: mimeType,
    },
  ];

  return (
    <div className="h-full w-full flex flex-col">
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-2 text-sm border-b border-border">
          加载错误: {error}
        </div>
      )}
      <div className="flex-1 min-h-0">
        <DocViewer
          documents={documents}
          pluginRenderers={[]}
          config={{
            header: {
              disableHeader: false,
              disableFileName: false,
              retainURLParams: false,
            },
          }}
          style={{ height: "100%" }}
        />
      </div>
    </div>
  );
}

function getFileTypeFromUrl(url: string): string {
  const extension = url.split(".").pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
  };
  return mimeTypes[extension || ""] || "application/octet-stream";
}
