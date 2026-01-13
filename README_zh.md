# OpenCoWork

OpenCoWork 是一个云端 AI 智能体执行平台，灵感来自 Anthropic 的 [Cowork](https://claude.ai/code)。它协调 Claude AI 智能体在分布式云环境中执行各类自主任务，包括整理文件、撰写文档、分析数据等。

## 什么是 Cowork？

当 Anthropic 推出 Claude Code（AI 编程助手）时，他们发现了一个意料之外的现象：开发者们不仅仅用它来写代码，还用它来整理资料、撰写文档、生成报告、分析数据，甚至将其视为处理各类工作的"数字同事"。

这一洞察催生了 **Cowork**，它将 Claude 的能力从"对话助手"扩展为"数字同事"。与仅仅响应提示的传统对话式 AI 不同，Cowork 具有以下特点：

- **自主执行任务** - Claude 自行规划、执行，并持续同步进度
- **操作真实文件** - 获得用户授权后，可直接访问、读取、编辑和创建文件
- **并行处理工作** - 可排队多个任务，无需等待完成
- **保持用户控制** - 执行任何重要操作前都会请求确认

OpenCoWork 将这种强大的协作模式带到云端，让团队能够规模化部署 AI 智能体。

## 概述

OpenCoWork 超越了简单的对话，将 Claude 嵌入到你的实际工作环境中。无论是整理杂乱的下载文件夹、从截图中提取数据、将会议笔记整理成报告，还是自动化浏览器工作流，OpenCoWork 都能像给能干的同事分配任务一样处理。

## 架构

```
                    ┌─────────────────┐
                    │    Frontend     │
                    │   (Next.js)     │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Executor Mgr   │
                    │ (APScheduler)   │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼───────┐    ┌──────▼──────┐    ┌───────▼──────┐
│   Backend     │    │  Executor   │    │   Database   │
│   (FastAPI)   │◄───┤  (FastAPI)  │    │ (PostgreSQL) │
└───────────────┘    └─────────────┘    └──────────────┘
```

## 技术栈

- **前端：** Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **后端：** Python 3.12+, FastAPI, SQLAlchemy 2.0
- **执行器：** claude-agent-sdk
- **数据库：** PostgreSQL

## 致谢

灵感来自 [Anthropic 的 Cowork](https://claude.ai/code)，一个面向所有人的 AI 驱动协作平台。
