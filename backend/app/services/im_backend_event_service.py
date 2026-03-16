from __future__ import annotations

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.settings import get_settings
from app.models.im_channel import Channel
from app.repositories.im_active_session_repository import ActiveSessionRepository
from app.repositories.im_channel_delivery_repository import ChannelDeliveryRepository
from app.repositories.im_channel_repository import ChannelRepository
from app.repositories.im_dedup_repository import DedupRepository
from app.repositories.im_watch_repository import WatchRepository
from app.schemas.im_event import ImBackendEvent
from app.services.im_message_formatter import MessageFormatter
from app.services.im_notification_gateway import NotificationGateway


class BackendEventService:
    def __init__(self) -> None:
        self.settings = get_settings()
        self.formatter = MessageFormatter()
        self.gateway = NotificationGateway()

    async def process_event(self, db: Session, *, event: ImBackendEvent) -> int:
        expected_user_id = (
            self.settings.backend_user_id.strip() or "default"
            if self.settings.backend_user_id
            else "default"
        )
        if event.user_id != expected_user_id:
            return 0

        session_id = event.session.id.strip()
        if not session_id:
            return 0

        target_channel_ids = self._get_target_channel_ids(db, session_id=session_id)
        if not target_channel_ids:
            return 0

        if event.type == "assistant_message.created":
            message = event.message
            if message is None or not message.text.strip():
                return 0
            delivered = 0
            for channel_id in target_channel_ids:
                key = f"msg:{channel_id}:{session_id}:{message.id}"
                if DedupRepository.exists(db, key=key):
                    continue
                rendered = self.formatter.format_assistant_text_update(
                    session_id=session_id,
                    text=message.text,
                    title=event.session.title,
                )
                if not rendered:
                    self._commit_processed_key(db, key=key)
                    continue
                if not await self._send_to_channel(
                    db,
                    channel_id=channel_id,
                    text=rendered,
                ):
                    raise RuntimeError(
                        f"failed to deliver assistant message event to channel {channel_id}"
                    )
                self._commit_processed_key(db, key=key)
                delivered += 1
            return delivered

        if event.type == "run.terminal":
            run = event.run
            raw_status = run.status if run is not None else event.session.status
            status = (raw_status or "").strip()
            if status not in {"completed", "failed", "canceled"}:
                return 0
            run_ref = (
                run.id.strip()
                if run is not None and isinstance(run.id, str) and run.id.strip()
                else session_id
            )
            delivered = 0
            for channel_id in target_channel_ids:
                key = f"run:{channel_id}:{run_ref}:{status}"
                if DedupRepository.exists(db, key=key):
                    continue
                rendered = self.formatter.format_terminal_notification(
                    session_id=session_id,
                    title=event.session.title,
                    status=status,
                    run_id=run.id if run is not None else None,
                    last_error=(run.error_message if run is not None else None),
                )
                if not await self._send_to_channel(
                    db,
                    channel_id=channel_id,
                    text=rendered,
                ):
                    raise RuntimeError(
                        f"failed to deliver run terminal event to channel {channel_id}"
                    )
                self._commit_processed_key(db, key=key)
                delivered += 1
            return delivered

        if event.type == "user_input_request.created":
            request = event.user_input_request
            if request is None or request.status != "pending":
                return 0
            delivered = 0
            for channel_id in target_channel_ids:
                key = f"ui:{channel_id}:{request.id}"
                if DedupRepository.exists(db, key=key):
                    continue
                rendered = self.formatter.format_user_input_request(
                    request_id=request.id,
                    session_id=session_id,
                    tool_name=request.tool_name,
                    tool_input=request.tool_input,
                    expires_at=request.expires_at.isoformat(),
                    title=event.session.title,
                )
                if not await self._send_to_channel(
                    db,
                    channel_id=channel_id,
                    text=rendered,
                ):
                    raise RuntimeError(
                        f"failed to deliver user input event to channel {channel_id}"
                    )
                self._commit_processed_key(db, key=key)
                delivered += 1
            return delivered

        return 0

    def _commit_processed_key(self, db: Session, *, key: str) -> None:
        try:
            self._mark_processed_key(db, key=key)
            db.commit()
        except Exception:
            db.rollback()
            raise

    def _mark_processed_key(self, db: Session, *, key: str) -> None:
        if DedupRepository.exists(db, key=key):
            return
        row = DedupRepository.create(db, key=key)
        try:
            with db.begin_nested():
                db.flush([row])
        except IntegrityError:
            return

    def _get_target_channel_ids(self, db: Session, *, session_id: str) -> set[int]:
        target: set[int] = set()

        for channel in ChannelRepository.list_enabled(db):
            if channel.subscribe_all:
                target.add(channel.id)

        for watch in WatchRepository.list_by_session(db, session_id=session_id):
            target.add(watch.channel_id)

        for active in ActiveSessionRepository.list_by_session(db, session_id=session_id):
            target.add(active.channel_id)

        return target

    async def _send_to_channel(
        self,
        db: Session,
        *,
        channel_id: int,
        text: str,
    ) -> bool:
        channel: Channel | None = ChannelRepository.get_by_id(db, channel_id=channel_id)
        if channel is None or not channel.enabled:
            return True

        if channel.provider == "dingtalk":
            destination = channel.destination
        else:
            destination = (
                ChannelDeliveryRepository.get_send_address(db, channel_id=channel_id)
                or channel.destination
            )

        return await self.gateway.send_text(
            provider=channel.provider,
            destination=destination,
            text=text,
        )
