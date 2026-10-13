from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.exceptions import (
    BadRequestError,
    ConflictError,
    NotFoundError,
    PermissionDeniedError,
    UnauthorizedError,
)
from app.core.security import DUMMY_HASH, hash_password, verify_password
from app.models.user import User, UserRole
from app.schemas.user import PasswordChange, UserAdminUpdate, UserCreate, UserUpdate


def get_by_id(db: Session, user_id: int) -> User | None:
    return db.get(User, user_id)


def get_by_username(db: Session, username: str) -> User | None:
    return db.scalar(select(User).where(func.lower(User.username) == username.lower()))


def get_by_email(db: Session, email: str) -> User | None:
    return db.scalar(select(User).where(User.email == email.lower()))


def create(db: Session, data: UserCreate, role: UserRole = UserRole.USER) -> User:
    if get_by_email(db, data.email):
        raise ConflictError("El email ya está registrado")
    if get_by_username(db, data.username):
        raise ConflictError("El nombre de usuario ya está en uso")
    user = User(
        email=data.email.lower(),
        username=data.username,
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
        role=role,
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError as exc:  # carrera entre dos registros simultáneos
        db.rollback()
        raise ConflictError("El email o el usuario ya existen") from exc
    return user


def authenticate(db: Session, identifier: str, password: str) -> User:
    """Acepta email o username. Mensaje genérico para no filtrar qué usuarios existen."""
    user = get_by_email(db, identifier) if "@" in identifier else get_by_username(db, identifier)
    if user is None:
        verify_password(password, DUMMY_HASH)  # iguala tiempos de respuesta
        raise UnauthorizedError("Credenciales incorrectas")
    if not verify_password(password, user.hashed_password):
        raise UnauthorizedError("Credenciales incorrectas")
    if not user.is_active:
        raise PermissionDeniedError("Usuario desactivado")
    return user


def update_profile(db: Session, user: User, data: UserUpdate) -> User:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    db.commit()
    return user


def change_password(db: Session, user: User, data: PasswordChange) -> None:
    if not verify_password(data.current_password, user.hashed_password):
        raise BadRequestError("La contraseña actual es incorrecta")
    user.hashed_password = hash_password(data.new_password)
    db.commit()


def list_users(db: Session, page: int, size: int) -> tuple[list[User], int]:
    total = db.scalar(select(func.count(User.id))) or 0
    items = db.scalars(select(User).order_by(User.id).offset((page - 1) * size).limit(size)).all()
    return list(items), total


def admin_update(db: Session, target_id: int, data: UserAdminUpdate, acting: User) -> User:
    user = get_by_id(db, target_id)
    if not user:
        raise NotFoundError("Usuario no encontrado")
    if user.id == acting.id and (data.role is not None or data.is_active is False):
        raise BadRequestError("No puedes cambiar tu propio rol ni desactivarte")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    db.commit()
    return user
