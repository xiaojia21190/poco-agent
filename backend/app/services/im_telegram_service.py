import logging
from typing import Any

from app.schemas.im_message import InboundMessage
from app.services.im_inbound_message_service import InboundMessageService
from app.services.im_telegram_client import TelegramClient

logger = logging.getLogger(__name__)


class TelegramService:
    """Handle Telegram webhook updates and route commands."""

    def __init__(self) -> None:
        self.client = TelegramClient()
        self.inbound = InboundMessageService()

    async def handle_update(self, payload: dict[str, Any]) -> None:
        if not self.client.enabled:
            return

        inbound = _parse_telegram_update(payload)
        if inbound is None:
            return

        await self.inbound.handle_message(message=inbound)


def _parse_telegram_update(payload: dict[str, Any]) -> InboundMessage | None:
    message = payload.get("message") or payload.get("edited_message")
    if not isinstance(message, dict):
        return None

    chat = message.get("chat")
    if not isinstance(chat, dict):
        return None

    chat_id = chat.get("id")
    if chat_id is None:
        return None

    text = message.get("text")
    if not isinstance(text, str):
        return None

    raw_message_id = message.get("message_id")
    update_id = payload.get("update_id")
    message_id = str(raw_message_id or update_id or "")

    sender_id = None
    sender = message.get("from")
    if isinstance(sender, dict):
        raw_sender_id = sender.get("id")
        if raw_sender_id is not None:
            sender_id = str(raw_sender_id)

    return InboundMessage(
        provider="telegram",
        destination=str(chat_id),
        message_id=message_id,
        sender_id=sender_id,
        text=text,
        raw=payload,
    )
