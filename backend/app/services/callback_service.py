import logging
import uuid
from typing import Any

from sqlalchemy.orm import Session

from app.repositories.message_repository import MessageRepository
from app.repositories.tool_execution_repository import ToolExecutionRepository
from app.schemas.callback import (
    AgentCallbackRequest,
    CallbackResponse,
    CallbackStatus,
)
from app.schemas.session import SessionUpdateRequest
from app.services.session_service import SessionService

logger = logging.getLogger(__name__)


class CallbackService:
    """Service layer for processing executor callbacks."""

    def _extract_role_from_message(self, message: dict[str, Any]) -> str:
        message_type = message.get("_type", "")

        if "AssistantMessage" in message_type:
            return "assistant"
        elif "UserMessage" in message_type:
            return "user"
        elif "SystemMessage" in message_type:
            return "system"

        logger.warning(
            f"Unknown message type: {message_type}, defaulting to 'assistant'"
        )
        return "assistant"

    def _extract_tool_executions(
        self,
        session_db: Session,
        message: dict[str, Any],
        session_id: uuid.UUID,
        message_id: int,
    ) -> None:
        content = message.get("content", [])
        if not isinstance(content, list):
            return

        for block in content:
            if not isinstance(block, dict):
                continue

            block_type = block.get("_type", "")

            if "ToolUseBlock" in block_type:
                tool_name = block.get("name")
                tool_input = block.get("input")

                if tool_name:
                    ToolExecutionRepository.create(
                        session_db=session_db,
                        session_id=session_id,
                        message_id=message_id,
                        tool_name=tool_name,
                        tool_input=tool_input,
                    )
                    logger.debug(
                        f"Created tool execution for tool '{tool_name}' in message {message_id}"
                    )

            elif "ToolResultBlock" in block_type:
                tool_use_id = block.get("tool_use_id")
                result_content = block.get("content")
                is_error = block.get("is_error", False)

                if tool_use_id:
                    ToolExecutionRepository.create(
                        session_db=session_db,
                        session_id=session_id,
                        message_id=message_id,
                        tool_name=tool_use_id,
                        tool_output={"content": result_content}
                        if result_content
                        else None,
                        is_error=is_error,
                    )
                    logger.debug(
                        f"Created tool result execution for '{tool_use_id}' in message {message_id}"
                    )

    def _persist_message_and_tools(
        self, db: Session, session_id: uuid.UUID, message: dict[str, Any]
    ) -> None:
        role = self._extract_role_from_message(message)

        text_preview = None
        content = message.get("content", [])
        if isinstance(content, list) and len(content) > 0:
            for block in content:
                if isinstance(block, dict) and "TextBlock" in block.get("_type", ""):
                    text_preview = block.get("text", "")[:500]
                    break

        db_message = MessageRepository.create(
            session_db=db,
            session_id=session_id,
            role=role,
            content=message,
            text_preview=text_preview,
        )

        db.flush()

        self._extract_tool_executions(db, message, session_id, db_message.id)

        db.commit()
        logger.info(
            f"Persisted message {db_message.id} (role={role}) for session {session_id}"
        )

    def process_agent_callback(
        self, db: Session, callback: AgentCallbackRequest
    ) -> CallbackResponse:
        session_service = SessionService()
        db_session = session_service.find_session_by_sdk_id_or_uuid(
            db, callback.session_id
        )

        if not db_session:
            logger.warning(f"Session not found for callback: {callback.session_id}")
            return CallbackResponse(
                session_id=callback.session_id,
                status="callback_received",
                message="Session not found yet",
            )

        if callback.status in [CallbackStatus.COMPLETED, CallbackStatus.FAILED]:
            session_service.update_session(
                db, db_session.id, SessionUpdateRequest(status=callback.status.value)
            )
            logger.info(
                f"Updated session {db_session.id} status to {callback.status.value} "
                f"via callback from {callback.session_id}"
            )

        if callback.new_message:
            self._persist_message_and_tools(db, db_session.id, callback.new_message)

        # TODO: Persist state_patch

        return CallbackResponse(
            session_id=str(db_session.id),
            status=db_session.status,
            callback_status=callback.status,
        )
