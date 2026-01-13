"use client";

import * as React from "react";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { LibraryHeader } from "./components/library-header";
import { LibraryGrid } from "./components/library-grid";

import { useProjects } from "@/hooks/use-projects";
import { useTaskHistory } from "@/hooks/use-task-history";

import { SettingsDialog } from "@/components/settings/settings-dialog";

export default function LibraryPage() {
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const { projects, addProject } = useProjects();
  const { taskHistory, removeTask } = useTaskHistory();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-svh w-full overflow-hidden bg-background">
        <AppSidebar
          projects={projects}
          taskHistory={taskHistory}
          // Passing undefined will trigger the default navigation in AppSidebar
          onNewTask={undefined}
          onDeleteTask={removeTask}
          onCreateProject={addProject}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        <SidebarInset className="flex flex-col bg-muted/30">
          <LibraryHeader />

          <div className="flex flex-1 flex-col px-6 py-10">
            <div className="w-full max-w-6xl mx-auto">
              <LibraryGrid />
            </div>
          </div>
        </SidebarInset>

        <SettingsDialog
          open={isSettingsOpen}
          onOpenChange={setIsSettingsOpen}
        />
      </div>
    </SidebarProvider>
  );
}
