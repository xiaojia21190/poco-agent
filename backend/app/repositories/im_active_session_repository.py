from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.models.im_active_session import ActiveSession


class ActiveSessionRepository:
    @staticmethod
    def get_by_channel(db: Session, *, channel_id: int) -> ActiveSession | None:
        stmt = select(ActiveSession).where(ActiveSession.channel_id == channel_id)
        return db.execute(stmt).scalars().first()

    @staticmethod
    def create(db: Session, *, channel_id: int, session_id: str) -> ActiveSession:
        entry = ActiveSession(channel_id=channel_id, session_id=session_id)
        db.add(entry)
        return entry

    @staticmethod
    def delete_by_channel(db: Session, *, channel_id: int) -> int:
        stmt = delete(ActiveSession).where(ActiveSession.channel_id == channel_id)
        result = db.execute(stmt)
        return int(result.rowcount or 0)

    @staticmethod
    def list_by_session(db: Session, *, session_id: str) -> list[ActiveSession]:
        stmt = select(ActiveSession).where(ActiveSession.session_id == session_id)
        return list(db.execute(stmt).scalars().all())
