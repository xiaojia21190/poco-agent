"use client";

import * as React from "react";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";

import { SkillsHeader } from "./components/skills-header";
import { SkillsGrid } from "./components/skills-grid";

import { useProjects } from "@/hooks/use-projects";
import { useTaskHistory } from "@/hooks/use-task-history";

export default function SkillsPage() {
  const { projects, addProject } = useProjects();
  const { taskHistory, removeTask } = useTaskHistory();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-svh w-full overflow-hidden bg-background">
        <AppSidebar
          projects={projects}
          taskHistory={taskHistory}
          onNewTask={() => {}}
          onDeleteTask={removeTask}
          onCreateProject={addProject}
        />

        <SidebarInset className="flex flex-col bg-muted/30">
          <SkillsHeader />

          <div className="flex flex-1 flex-col px-6 py-10">
            <div className="w-full max-w-6xl mx-auto">
              <SkillsGrid />
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
