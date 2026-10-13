from typing import Annotated

from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm

from app.api.deps import DbSession
from app.core.exceptions import PermissionDeniedError, UnauthorizedError
from app.core.security import create_token, decode_token
from app.schemas.token import RefreshRequest, Token
from app.schemas.user import UserCreate, UserRead
from app.services import user_service

router = APIRouter(prefix="/auth", tags=["Autenticación"])


def _tokens_for(user_id: int) -> Token:
    return Token(access_token=create_token(user_id, "access"), refresh_token=create_token(user_id, "refresh"))


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(data: UserCreate, db: DbSession):
    """Registro público. Todos los usuarios nuevos tienen rol `user`."""
    return user_service.create(db, data)


@router.post("/login", response_model=Token)
def login(form: Annotated[OAuth2PasswordRequestForm, Depends()], db: DbSession):
    """Login con email **o** username (campo `username` del formulario OAuth2)."""
    user = user_service.authenticate(db, form.username, form.password)
    return _tokens_for(user.id)


@router.post("/refresh", response_model=Token)
def refresh(data: RefreshRequest, db: DbSession):
    user_id = decode_token(data.refresh_token, expected_type="refresh")
    user = user_service.get_by_id(db, int(user_id)) if user_id.isdigit() else None
    if user is None:
        raise UnauthorizedError("Usuario no encontrado")
    if not user.is_active:
        raise PermissionDeniedError("Usuario desactivado")
    return _tokens_for(user.id)
