import uuid

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.response import Response, ResponseSchema
from app.schemas.session import (
    SessionCreateRequest,
    SessionResponse,
    SessionUpdateRequest,
)
from app.services.session_service import SessionService

router = APIRouter(prefix="/sessions", tags=["sessions"])

session_service = SessionService()


@router.post("", response_model=ResponseSchema[SessionResponse])
async def create_session(
    request: SessionCreateRequest,
    db: Session = Depends(get_db),
) -> JSONResponse:
    """Creates a new session."""
    db_session = session_service.create_session(db, request)
    return Response.success(
        data=SessionResponse.model_validate(db_session),
        message="Session created successfully",
    )


@router.get("/{session_id}", response_model=ResponseSchema[SessionResponse])
async def get_session(
    session_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> JSONResponse:
    """Gets session details."""
    db_session = session_service.get_session(db, session_id)
    return Response.success(
        data=SessionResponse.model_validate(db_session),
        message="Session retrieved successfully",
    )


@router.patch("/{session_id}", response_model=ResponseSchema[SessionResponse])
async def update_session(
    session_id: uuid.UUID,
    request: SessionUpdateRequest,
    db: Session = Depends(get_db),
) -> JSONResponse:
    """Updates a session."""
    db_session = session_service.update_session(db, session_id, request)
    return Response.success(
        data=SessionResponse.model_validate(db_session),
        message="Session updated successfully",
    )


@router.get("", response_model=ResponseSchema[list[SessionResponse]])
async def list_sessions(
    user_id: str | None = None,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db),
) -> JSONResponse:
    """Lists sessions."""
    sessions = session_service.list_sessions(db, user_id, limit, offset)
    return Response.success(
        data=[SessionResponse.model_validate(s) for s in sessions],
        message="Sessions retrieved successfully",
    )
