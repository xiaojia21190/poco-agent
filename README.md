# OpenCoWork

OpenCoWork is a cloud-based AI agent execution platform inspired by Anthropic's [Cowork](https://claude.ai/code). It orchestrates Claude AI agents to perform autonomous tasks beyond coding, organizing files, writing documents, analyzing data, and more in a distributed cloud environment.

## What is Cowork?

When Anthropic launched Claude Code (an AI coding assistant), they discovered something unexpected: developers weren't just using it to write code. They were using it to organize materials, write documentation, generate reports, analyze data, and even as a "digital colleague" for all kinds of work.

This insight led to **Cowork**, a product that extends Claude's capabilities from "chat assistant" to "digital colleague." Unlike traditional conversational AI that simply responds to prompts, Cowork:

- **Executes tasks autonomously** - Claude plans, executes, and syncs progress continuously
- **Operates on real files** - With user permission, directly access, read, edit, and create files
- **Works in parallel** - Queue multiple tasks without waiting for completion
- **Keeps you in control** - Confirms before any important operations

OpenCoWork brings this powerful collaboration paradigm to the cloud, enabling teams to deploy AI agents at scale.

## Overview

OpenCoWork moves beyond simple chat, embedding Claude into your actual working environment. Whether it's organizing a messy downloads folder, extracting data from screenshots, compiling meeting notes into reports, or automating browser workflows, OpenCoWork handles it like assigning tasks to a capable colleague.

## Architecture

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

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Python 3.12+, FastAPI, SQLAlchemy 2.0
- **Executor:** claude-agent-sdk
- **Database:** PostgreSQL

## Acknowledgments

Inspired by [Anthropic's Cowork](https://claude.ai/code), an AI-powered collaboration platform for everyone.
