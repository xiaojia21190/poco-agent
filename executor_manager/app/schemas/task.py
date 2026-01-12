from datetime import datetime

from pydantic import BaseModel, Field


class TaskConfig(BaseModel):
    """Task configuration."""

    repo_url: str | None = None
    git_branch: str = "main"
    mcp_config: dict = Field(default_factory=dict)
    skill_files: dict = Field(default_factory=dict)


class TaskCreateRequest(BaseModel):
    """Create task request."""

    prompt: str
    config: TaskConfig
    user_id: str
    scheduled_at: datetime | None = None  # Optional scheduled execution


class TaskCreateResponse(BaseModel):
    """Create task response."""

    task_id: str
    session_id: str
    status: str  # "pending" | "scheduled" | "running" | "completed" | "failed"


class TaskStatusResponse(BaseModel):
    """Task status response."""

    task_id: str
    status: str  # "scheduled" | "running" | "completed" | "failed"
    next_run_time: str | None = None


class SessionStatusResponse(BaseModel):
    """Session status response (proxied from backend)."""

    session_id: str
    user_id: str
    sdk_session_id: str | None = None
    config_snapshot: dict | None = None
    workspace_archive_url: str | None = None
    status: str
    created_at: datetime
    updated_at: datetime
