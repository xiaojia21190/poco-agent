from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.im_dedup_event import DedupEvent


class DedupRepository:
    @staticmethod
    def exists(db: Session, *, key: str) -> bool:
        stmt = select(DedupEvent.key).where(DedupEvent.key == key)
        return db.execute(stmt).first() is not None

    @staticmethod
    def create(db: Session, *, key: str) -> DedupEvent:
        row = DedupEvent(key=key)
        db.add(row)
        return row
