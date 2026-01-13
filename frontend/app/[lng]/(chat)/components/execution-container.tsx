"use client";

import * as React from "react";
import { ChatPanel } from "./left-panel/chat-panel";
import { ArtifactsPanel } from "./center-panel/artifacts-panel";
import { MobileExecutionView } from "./mobile-execution-view";
import { useChat } from "@/hooks/use-chat";
import { useT } from "@/app/i18n/client";
import { useIsMobile } from "@/hooks/use-mobile";

interface ExecutionContainerProps {
  sessionId: string;
}

export function ExecutionContainer({ sessionId }: ExecutionContainerProps) {
  const { t } = useT("translation");
  const { session, isLoading, error } = useChat(sessionId);
  const isMobile = useIsMobile();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">{t("status.loading")}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading session</p>
          <p className="text-muted-foreground text-sm">
            {error.message || "Unknown error"}
          </p>
        </div>
      </div>
    );
  }

  // Mobile view (under 768px)
  if (isMobile) {
    return <MobileExecutionView session={session} />;
  }

  // Desktop two-column layout
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Left panel - Chat with status cards (45%) */}
      <div className="w-[45%] min-w-0 border-r border-border flex flex-col">
        <ChatPanel
          session={session}
          statePatch={session?.state_patch}
          progress={session?.progress}
          currentStep={session?.state_patch.current_step}
        />
      </div>

      {/* Right panel - Artifacts (55%) */}
      <div className="w-[55%] min-w-0 flex flex-col bg-muted/30">
        <ArtifactsPanel artifacts={session?.state_patch.artifacts} />
      </div>
    </div>
  );
}
