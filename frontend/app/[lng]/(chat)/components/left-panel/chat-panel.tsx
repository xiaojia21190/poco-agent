"use client";

import * as React from "react";
import { ChatMessageList } from "../chat-message-list";
import { MessageSquare } from "lucide-react";
import { TodoList } from "./todo-list";
import { StatusBar } from "./status-bar";
import type {
  ExecutionSession,
  ChatMessage,
  StatePatch,
} from "@/lib/api-types";

interface ChatPanelProps {
  session: ExecutionSession | null;
  statePatch?: StatePatch;
  progress?: number;
  currentStep?: string;
}

export function ChatPanel({
  session,
  statePatch,
  progress = 0,
  currentStep,
}: ChatPanelProps) {
  const [inputValue, setInputValue] = React.useState("");
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);

  // 当 session 有 user_prompt 时，显示用户的消息
  React.useEffect(() => {
    if (session?.user_prompt && messages.length === 0) {
      const userMessage: ChatMessage = {
        id: `msg-initial-${session.session_id}`,
        role: "user",
        content: session.user_prompt,
        status: "sent",
        timestamp: session.time,
      };
      setMessages([userMessage]);
    }
  }, [
    session?.user_prompt,
    session?.time,
    session?.session_id,
    messages.length,
  ]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    // Create a new user message
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: inputValue,
      status: "sent",
      timestamp: new Date().toISOString(),
    };

    // Add the message to the list
    setMessages((prev) => [...prev, newMessage]);

    // Clear the input
    setInputValue("");

    // TODO: Send message to API and get response
    console.log("Sending message:", inputValue);
  };

  const hasSkills =
    statePatch?.skills_used && statePatch.skills_used.length > 0;
  const hasMcp = statePatch?.mcp_status && statePatch.mcp_status.length > 0;
  const hasTodos = statePatch?.todos && statePatch.todos.length > 0;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-card shrink-0 min-h-[85px] flex flex-col justify-center">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-lg bg-muted shrink-0">
            <MessageSquare className="size-5 text-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold text-foreground truncate">
              {session?.task_name || session?.new_message?.title || "对话"}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              与 AI 助手交互，提出问题和需求
            </p>
          </div>
        </div>
      </div>

      {/* Top Section: Todo List (full width) */}
      {hasTodos && (
        <div className="px-4 pt-4 pb-2 shrink-0">
          <TodoList
            todos={statePatch.todos!}
            progress={progress}
            currentStep={currentStep}
          />
        </div>
      )}

      {/* Message list */}
      <div className="flex-1 min-h-0 px-4">
        <ChatMessageList messages={messages} />
      </div>

      {/* Status Bar - Skills and MCP */}
      {(hasSkills || hasMcp) && (
        <StatusBar
          skills={statePatch?.skills_used}
          mcpStatuses={statePatch?.mcp_status}
        />
      )}

      {/* Simplified Input */}
      <div className="shrink-0 px-4 pb-4 pt-2">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && inputValue.trim()) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="输入消息..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="flex items-center justify-center size-8 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground transition-colors"
          >
            <MessageSquare className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
