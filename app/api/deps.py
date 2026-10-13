"""Dependencias reutilizables (inyección de dependencias de FastAPI)."""
from typing import Annotated

from fastapi import Depends, Query
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import PermissionDeniedError, UnauthorizedError
from app.core.security import decode_token
from app.db.session import get_db
from app.models.user import User, UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_PREFIX}/auth/login")
oauth2_scheme_optional = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_PREFIX}/auth/login", auto_error=False
)

DbSession = Annotated[Session, Depends(get_db)]


def _user_from_token(db: Session, token: str) -> User:
    user_id = decode_token(token, expected_type="access")
    user = db.get(User, int(user_id)) if user_id.isdigit() else None
    if user is None:
        raise UnauthorizedError("Usuario no encontrado")
    if not user.is_active:
        raise PermissionDeniedError("Usuario desactivado")
    return user


def get_current_user(db: DbSession, token: Annotated[str, Depends(oauth2_scheme)]) -> User:
    return _user_from_token(db, token)


def get_optional_user(
    db: DbSession, token: Annotated[str | None, Depends(oauth2_scheme_optional)]
) -> User | None:
    return _user_from_token(db, token) if token else None


def require_roles(*roles: UserRole):
    def checker(user: Annotated[User, Depends(get_current_user)]) -> User:
        if user.role not in roles:
            raise PermissionDeniedError("No tienes el rol necesario para esta acción")
        return user
    return checker


CurrentUser = Annotated[User, Depends(get_current_user)]
OptionalUser = Annotated[User | None, Depends(get_optional_user)]
Moderator = Annotated[User, Depends(require_roles(UserRole.EDITOR, UserRole.ADMIN))]
AdminUser = Annotated[User, Depends(require_roles(UserRole.ADMIN))]


class Pagination:
    def __init__(
        self,
        page: Annotated[int, Query(ge=1, description="Número de página")] = 1,
        size: Annotated[int, Query(ge=1, le=100, description="Elementos por página")] = 20,
    ):
        self.page = page
        self.size = size


PaginationParams = Annotated[Pagination, Depends()]
