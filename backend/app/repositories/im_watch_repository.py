from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.models.im_watched_session import WatchedSession


class WatchRepository:
    @staticmethod
    def create(db: Session, *, channel_id: int, session_id: str) -> WatchedSession:
        entry = WatchedSession(channel_id=channel_id, session_id=session_id)
        db.add(entry)
        return entry

    @staticmethod
    def delete_by_channel_session(db: Session, *, channel_id: int, session_id: str) -> int:
        stmt = (
            delete(WatchedSession)
            .where(WatchedSession.channel_id == channel_id)
            .where(WatchedSession.session_id == session_id)
        )
        result = db.execute(stmt)
        return int(result.rowcount or 0)

    @staticmethod
    def get_watch(
        db: Session,
        *,
        channel_id: int,
        session_id: str,
    ) -> WatchedSession | None:
        stmt = (
            select(WatchedSession)
            .where(WatchedSession.channel_id == channel_id)
            .where(WatchedSession.session_id == session_id)
        )
        return db.execute(stmt).scalars().first()

    @staticmethod
    def list_by_session(db: Session, *, session_id: str) -> list[WatchedSession]:
        stmt = select(WatchedSession).where(WatchedSession.session_id == session_id)
        return list(db.execute(stmt).scalars().all())

    @staticmethod
    def list_by_channel(db: Session, *, channel_id: int) -> list[WatchedSession]:
        stmt = (
            select(WatchedSession)
            .where(WatchedSession.channel_id == channel_id)
            .order_by(WatchedSession.created_at.desc(), WatchedSession.id.desc())
        )
        return list(db.execute(stmt).scalars().all())
