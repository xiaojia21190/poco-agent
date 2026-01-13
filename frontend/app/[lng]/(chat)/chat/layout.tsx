"use client";

import * as React from "react";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { LanguageProvider } from "@/app/[lng]/language-provider";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { useProjects } from "@/hooks/use-projects";
import { useTaskHistory } from "@/hooks/use-task-history";

import { useRouter } from "next/navigation";
import { SettingsDialog } from "@/components/settings/settings-dialog";

export function ChatLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lng: string }>;
}) {
  const router = useRouter();
  const [lng, setLng] = React.useState<string>("zh");
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const { projects, addProject } = useProjects();
  const { taskHistory, removeTask, moveTask } = useTaskHistory();

  React.useEffect(() => {
    params.then((p) => setLng(p.lng));
  }, [params]);

  return (
    <LanguageProvider lng={lng}>
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-svh w-full overflow-hidden bg-background">
          <AppSidebar
            projects={projects}
            taskHistory={taskHistory}
            onNewTask={() => router.push("/")}
            onDeleteTask={removeTask}
            onCreateProject={addProject}
            onMoveTaskToProject={moveTask}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
          <SidebarInset className="flex flex-col bg-muted/30">
            {children}
          </SidebarInset>
          <SettingsDialog
            open={isSettingsOpen}
            onOpenChange={setIsSettingsOpen}
          />
        </div>
      </SidebarProvider>
    </LanguageProvider>
  );
}

export default ChatLayout;
