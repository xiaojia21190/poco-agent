"use client";

import * as React from "react";

import { MessageContent } from "./message-content";
import { TypingIndicator } from "./typing-indicator";
import type { ChatMessage } from "@/lib/api-types";

interface AssistantMessageProps {
  message: ChatMessage;
}

export function AssistantMessage({ message }: AssistantMessageProps) {
  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[80%] border border-border text-foreground rounded-lg px-4 py-2">
        <MessageContent content={message.content} />
        {message.status === "streaming" && <TypingIndicator />}
      </div>
    </div>
  );
}
