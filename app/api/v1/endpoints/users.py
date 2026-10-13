from fastapi import APIRouter, HTTPException, status

from app.api.deps import AdminUser, CurrentUser, DbSession, PaginationParams
from app.core.exceptions import NotFoundError
from app.schemas.common import Message, Page
from app.schemas.user import PasswordChange, UserAdminUpdate, UserPublic, UserRead, UserUpdate
from app.services import user_service

router = APIRouter(prefix="/users", tags=["Usuarios"])


@router.get("/me", response_model=UserRead)
def read_me(current_user: CurrentUser):
    return current_user


@router.patch("/me", response_model=UserRead)
def update_me(data: UserUpdate, db: DbSession, current_user: CurrentUser):
    return user_service.update_profile(db, current_user, data)


@router.post("/me/change-password", response_model=Message)
def change_password(data: PasswordChange, db: DbSession, current_user: CurrentUser):
    user_service.change_password(db, current_user, data)
    return Message(detail="Contraseña actualizada correctamente")


@router.get("", response_model=Page[UserRead], summary="Listar usuarios (admin)")
def list_users(db: DbSession, _: AdminUser, p: PaginationParams):
    items, total = user_service.list_users(db, p.page, p.size)
    return Page.create(items, total, p.page, p.size)


@router.get("/{username}", response_model=UserPublic, summary="Perfil público")
def read_user(username: str, db: DbSession):
    user = user_service.get_by_username(db, username)
    if not user or not user.is_active:
        raise NotFoundError("Usuario no encontrado")
    return user


@router.patch("/{user_id}", response_model=UserRead, summary="Cambiar rol / activar (admin)")
def admin_update_user(user_id: int, data: UserAdminUpdate, db: DbSession, admin: AdminUser):
    return user_service.admin_update(db, user_id, data, admin)
