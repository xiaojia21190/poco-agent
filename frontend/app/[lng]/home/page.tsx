"use client";

import * as React from "react";
import {
  ArrowUp,
  Bell,
  ChevronDown,
  Code,
  Coins,
  Folder,
  Globe,
  Library,
  MessageSquare,
  Mic,
  MoreHorizontal,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  PenSquare,
  Plus,
  Presentation,
  Search,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import { useT } from "@/app/i18n/client";

interface TaskHistoryItem {
  id: string;
  title: string;
  status: "pending" | "running" | "completed" | "failed";
  timestamp: string;
}

const mockTaskHistory: TaskHistoryItem[] = [
  {
    id: "1",
    title: "帮我重构前端的代码",
    status: "completed",
    timestamp: "2 分钟前",
  },
  {
    id: "2",
    title: "研究一下 claude code",
    status: "running",
    timestamp: "1 小时前",
  },
];

type ProjectItem = {
  id: string;
  name: string;
};

const mockProjects: ProjectItem[] = [{ id: "p-1", name: "新项目" }];

// 快捷操作配置
const quickActions = [
  { id: "slides", label: "制作幻灯片", icon: Presentation },
  { id: "website", label: "创建网站", icon: Globe },
  { id: "app", label: "开发应用", icon: Code },
  { id: "design", label: "设计", icon: Palette },
  { id: "more", label: "更多", icon: MoreHorizontal },
];

// 已连接的工具
const connectedTools = [
  { id: "gmail", name: "Gmail", icon: "📧" },
  { id: "drive", name: "Drive", icon: "📁" },
  { id: "notion", name: "Notion", icon: "📝" },
  { id: "slack", name: "Slack", icon: "💬" },
  { id: "figma", name: "Figma", icon: "🎨" },
];

export default function HomePage() {
  return (
    <SidebarProvider defaultOpen={true}>
      <HomePageContent />
    </SidebarProvider>
  );
}

function HomePageContent() {
  const { t } = useT("translation");
  const { toggleSidebar } = useSidebar();
  const [taskHistory, setTaskHistory] =
    React.useState<TaskHistoryItem[]>(mockTaskHistory);
  const [inputValue, setInputValue] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const setPrompt = React.useCallback((prompt: string) => {
    setInputValue(prompt);
    requestAnimationFrame(() => textareaRef.current?.focus());
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleSendTask = () => {
    if (!inputValue.trim()) return;

    console.log("Task submitted:", inputValue);

    const newTask: TaskHistoryItem = {
      id: Date.now().toString(),
      title: inputValue.slice(0, 50) + (inputValue.length > 50 ? "..." : ""),
      status: "pending",
      timestamp: "刚刚",
    };

    setTaskHistory([newTask, ...taskHistory]);
    setInputValue("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendTask();
    }
  };

  const handleNewTask = () => {
    setInputValue("");
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleDeleteTask = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    setTaskHistory(taskHistory.filter((task) => task.id !== taskId));
  };

  const getStatusDotClassName = (status: TaskHistoryItem["status"]) => {
    switch (status) {
      case "pending":
        return "bg-muted-foreground/40";
      case "running":
        return "bg-chart-2";
      case "completed":
        return "bg-chart-1";
      case "failed":
        return "bg-destructive";
      default:
        return "bg-muted-foreground/40";
    }
  };

  const getStatusLabel = (status: TaskHistoryItem["status"]) => {
    switch (status) {
      case "pending":
        return t("status.pending");
      case "running":
        return t("status.running");
      case "completed":
        return t("status.completed");
      case "failed":
        return t("status.failed");
      default:
        return t("status.pending");
    }
  };

  return (
    <div className="flex min-h-svh w-full overflow-hidden bg-background">
      <Sidebar collapsible="icon" className="border-r-0 bg-sidebar">
        <SidebarHeader className="gap-2 pb-2">
          {/* Logo 和折叠按钮 */}
          <div className="flex items-center justify-between pt-2 mb-3 group-data-[collapsible=icon]:justify-center">
            <div className="flex items-center gap-3 group-data-[collapsible=icon]:gap-0">
              {/* 折叠状态下：默认显示 Logo，悬停显示展开按钮 */}
              <button
                onClick={toggleSidebar}
                className="group/logo flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground transition-colors hover:bg-sidebar-primary/90"
              >
                <MessageSquare className="size-4 group-data-[collapsible=icon]:group-hover/logo:hidden" />
                <PanelLeftOpen className="size-4 hidden group-data-[collapsible=icon]:group-hover/logo:block" />
              </button>
              <span className="text-sm font-semibold tracking-tight text-sidebar-foreground group-data-[collapsible=icon]:hidden">
                OpenCoWork
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="size-8 text-sidebar-foreground hover:bg-sidebar-accent group-data-[collapsible=icon]:hidden"
            >
              <PanelLeftClose className="size-4" />
            </Button>
          </div>

          {/* 新建任务按钮 */}
          <SidebarMenu className="group-data-[collapsible=icon]:px-0">
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleNewTask}
                className="h-9 justify-start gap-3 rounded-lg bg-sidebar-accent hover:bg-sidebar-accent/80"
                tooltip={t("sidebar.newTask")}
              >
                <PenSquare className="size-4" />
                <span className="text-sm">{t("sidebar.newTask")}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          {/* 搜索 */}
          <SidebarMenu className="group-data-[collapsible=icon]:px-0">
            <SidebarMenuItem>
              <SidebarMenuButton
                className="h-9 justify-start gap-3 rounded-lg text-muted-foreground hover:bg-sidebar-accent"
                tooltip={t("sidebar.search")}
              >
                <Search className="size-4" />
                <span className="text-sm">{t("sidebar.search")}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          {/* 库 */}
          <SidebarMenu className="group-data-[collapsible=icon]:px-0">
            <SidebarMenuItem>
              <SidebarMenuButton
                className="h-9 justify-start gap-3 rounded-lg text-muted-foreground hover:bg-sidebar-accent"
                tooltip={t("sidebar.library")}
              >
                <Library className="size-4" />
                <span className="text-sm">{t("sidebar.library")}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent className="group-data-[collapsible=icon]:px-0">
          <ScrollArea className="h-full">
            {/* 项目 */}
            <SidebarGroup className="py-2">
              <div className="flex items-center justify-between pr-2 group-data-[collapsible=icon]:hidden">
                <SidebarGroupLabel className="text-xs font-medium text-muted-foreground">
                  {t("sidebar.projects")}
                </SidebarGroupLabel>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-5 text-muted-foreground hover:bg-sidebar-accent"
                >
                  <Plus className="size-3" />
                </Button>
              </div>
              <SidebarGroupContent className="mt-1 group-data-[collapsible=icon]:mt-0">
                <SidebarMenu>
                  {mockProjects.map((project) => (
                    <SidebarMenuItem key={project.id}>
                      <SidebarMenuButton
                        className="h-8 justify-start gap-3 text-sm hover:bg-sidebar-accent"
                        tooltip={project.name}
                      >
                        <Folder className="size-4 text-muted-foreground" />
                        <span>{project.name}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* 所有任务 */}
            <SidebarGroup className="py-2">
              <div className="flex items-center justify-between pr-2 group-data-[collapsible=icon]:hidden">
                <SidebarGroupLabel className="text-xs font-medium text-muted-foreground">
                  {t("sidebar.allTasks")}
                </SidebarGroupLabel>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-5 text-muted-foreground hover:bg-sidebar-accent"
                >
                  <SlidersHorizontal className="size-3" />
                </Button>
              </div>
              <SidebarGroupContent className="mt-1 group-data-[collapsible=icon]:mt-0">
                <SidebarMenu className="gap-0.5">
                  {taskHistory.map((task) => (
                    <SidebarMenuItem key={task.id}>
                      <SidebarMenuButton
                        className="group relative h-auto w-full justify-start gap-3 rounded-lg py-2 text-left pr-8 hover:bg-sidebar-accent group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:pr-0"
                        tooltip={task.title}
                      >
                        <span
                          className={`size-2 shrink-0 rounded-full ${getStatusDotClassName(task.status)} group-data-[collapsible=icon]:mt-0`}
                          aria-hidden="true"
                        />
                        <span className="sr-only">
                          {getStatusLabel(task.status)}
                        </span>
                        <span className="flex-1 truncate text-sm group-data-[collapsible=icon]:hidden">
                          {task.title}
                        </span>
                      </SidebarMenuButton>
                      <SidebarMenuAction
                        showOnHover={true}
                        onClick={(e) => handleDeleteTask(e, task.id)}
                        className="right-1 group-data-[collapsible=icon]:hidden"
                      >
                        <Trash2 className="size-3.5" />
                      </SidebarMenuAction>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </ScrollArea>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border p-2 group-data-[collapsible=icon]:p-2">
          {/* 底部工具栏 */}
          <div className="flex items-center justify-end px-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:bg-sidebar-accent"
              >
                <SlidersHorizontal className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:bg-sidebar-accent group-data-[collapsible=icon]:hidden"
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </div>
          </div>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <SidebarInset className="flex flex-col bg-muted/30">
        {/* Header */}
        <header className="flex h-12 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 px-2 text-sm font-medium"
            >
              OpenCoWork 1.0
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="size-8">
              <Bell className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 px-2.5 text-sm"
            >
              <Coins className="size-4 text-primary" />
              <span>4,300</span>
            </Button>
            <Avatar className="size-8 cursor-pointer">
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                U
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-10">
          <div className="w-full max-w-2xl">
            {/* 欢迎语 */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-medium tracking-tight text-foreground">
                {t("hero.title")}
              </h1>
            </div>

            {/* 任务输入卡片 */}
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              {/* 输入区域 */}
              <div className="px-4 pt-4 pb-3">
                <Textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={t("hero.placeholder")}
                  className="min-h-[60px] max-h-[40vh] w-full resize-none border-0 bg-transparent p-0 text-base shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/50"
                  rows={2}
                />
              </div>

              {/* 底部工具栏 */}
              <div className="flex items-center justify-between px-3 pb-3">
                {/* 左侧操作按钮 */}
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-9 rounded-xl hover:bg-accent"
                    title={t("hero.attachFile")}
                  >
                    <Plus className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-9 rounded-xl hover:bg-accent"
                    title={t("hero.tools")}
                  >
                    <SlidersHorizontal className="size-4" />
                  </Button>
                </div>

                {/* 右侧操作按钮 */}
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-9 rounded-xl hover:bg-accent"
                    title={t("hero.voiceInput")}
                  >
                    <Mic className="size-4" />
                  </Button>
                  <Button
                    onClick={handleSendTask}
                    disabled={!inputValue.trim()}
                    size="icon"
                    className="size-9 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground disabled:bg-muted disabled:text-muted-foreground"
                    title={t("hero.send")}
                  >
                    <ArrowUp className="size-4" />
                  </Button>
                </div>
              </div>

              {/* 工具连接栏 */}
              <div className="flex items-center justify-between border-t border-border bg-muted/30 px-4 py-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <SlidersHorizontal className="size-3.5" />
                  <span>{t("hero.tools")}</span>
                </div>
                <div className="flex items-center gap-0.5">
                  {connectedTools.slice(0, 6).map((tool) => (
                    <div
                      key={tool.id}
                      className="flex size-6 items-center justify-center rounded-full text-sm hover:bg-accent cursor-pointer transition-colors"
                      title={tool.name}
                    >
                      {tool.icon}
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 rounded-full text-muted-foreground hover:text-foreground"
                  >
                    <MoreHorizontal className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* 快捷操作 */}
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {quickActions.map(({ id, label, icon: Icon }) => (
                <Button
                  key={id}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 rounded-full border border-border bg-card px-3 text-sm text-muted-foreground shadow-sm transition-all hover:bg-accent hover:text-foreground hover:shadow"
                  onClick={() => setPrompt(label)}
                >
                  <Icon className="mr-1.5 size-3.5" />
                  {label}
                </Button>
              ))}
            </div>

            {/* 键盘提示 */}
            <div className="mt-4 text-center text-xs text-muted-foreground/60">
              <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                Enter
              </kbd>
              {" " + t("hints.send") + "，"}
              <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                Shift + Enter
              </kbd>
              {" " + t("hints.newLine")}
            </div>
          </div>
        </div>
      </SidebarInset>
    </div>
  );
}
