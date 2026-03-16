import logging

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.im_channel import Channel
from app.repositories.im_channel_delivery_repository import ChannelDeliveryRepository
from app.repositories.im_channel_repository import ChannelRepository
from app.repositories.im_dedup_repository import DedupRepository
from app.schemas.im_message import InboundMessage
from app.services.im_command_service import CommandService
from app.services.im_notification_gateway import NotificationGateway

logger = logging.getLogger(__name__)


class InboundMessageService:
    def __init__(self) -> None:
        self.commands = CommandService()
        self.gateway = NotificationGateway()

    async def handle_message(self, *, message: InboundMessage) -> None:
        db = SessionLocal()
        responses: list[str] = []
        send_address: str | None = None
        try:
            if message.message_id:
                dedup_key = f"in:{message.provider}:{message.message_id}"
                if not self._register_inbound_dedup(db, key=dedup_key):
                    return

            channel = self._get_or_create_channel(
                db,
                provider=message.provider,
                destination=message.destination,
            )
            if not channel.enabled:
                logger.info(
                    "im_channel_disabled_ignoring_inbound",
                    extra={
                        "provider": message.provider,
                        "destination": message.destination,
                        "channel_id": channel.id,
                    },
                )
                db.commit()
                return

            send_address = self._resolve_send_address(
                db,
                channel=channel,
                message=message,
            )
            responses = await self.commands.handle_text(
                db=db,
                channel=channel,
                text=message.text,
            )
            db.commit()
        except Exception:
            db.rollback()
            raise
        finally:
            db.close()

        if not responses:
            return

        target = send_address or message.destination
        for resp in responses:
            sent = await self.gateway.send_text(
                provider=message.provider,
                destination=target,
                text=resp,
            )
            if not sent:
                logger.warning(
                    "im_inbound_reply_failed",
                    extra={
                        "provider": message.provider,
                        "destination": target,
                    },
                )

    def _register_inbound_dedup(self, db: Session, *, key: str) -> bool:
        row = DedupRepository.create(db, key=key)
        try:
            with db.begin_nested():
                db.flush([row])
        except IntegrityError:
            return False
        return True

    def _get_or_create_channel(
        self,
        db: Session,
        *,
        provider: str,
        destination: str,
    ) -> Channel:
        existing = ChannelRepository.get_by_provider_destination(
            db,
            provider=provider,
            destination=destination,
        )
        if existing is not None:
            return existing

        channel = ChannelRepository.create(
            db,
            provider=provider,
            destination=destination,
        )
        try:
            with db.begin_nested():
                db.flush([channel])
        except IntegrityError:
            existing = ChannelRepository.get_by_provider_destination(
                db,
                provider=provider,
                destination=destination,
            )
            if existing is not None:
                return existing
            raise
        return channel

    def _resolve_send_address(
        self,
        db: Session,
        *,
        channel: Channel,
        message: InboundMessage,
    ) -> str:
        candidate = (message.send_address or "").strip()
        if candidate:
            current = ChannelDeliveryRepository.get_by_channel(db, channel_id=channel.id)
            if current is not None:
                current.send_address = candidate
                return candidate

            delivery = ChannelDeliveryRepository.create(
                db,
                channel_id=channel.id,
                send_address=candidate,
            )
            try:
                with db.begin_nested():
                    db.flush([delivery])
            except IntegrityError:
                current = ChannelDeliveryRepository.get_by_channel(
                    db,
                    channel_id=channel.id,
                )
                if current is None:
                    raise
                current.send_address = candidate
            return candidate

        stored = ChannelDeliveryRepository.get_send_address(db, channel_id=channel.id)
        return (stored or "").strip() or channel.destination
