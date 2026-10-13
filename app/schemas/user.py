import re
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.models.user import UserRole


def _validate_password_strength(value: str) -> str:
    if not re.search(r"[A-Za-z]", value) or not re.search(r"\d", value):
        raise ValueError("La contraseña debe contener al menos una letra y un número")
    return value


class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=30, pattern=r"^[a-zA-Z0-9_]+$")
    password: str = Field(min_length=8, max_length=128)
    full_name: str | None = Field(default=None, max_length=100)

    _check_password = field_validator("password")(_validate_password_strength)

    @field_validator("email")
    @classmethod
    def _lower_email(cls, v: str) -> str:
        return v.lower()


class UserUpdate(BaseModel):
    full_name: str | None = Field(default=None, max_length=100)
    bio: str | None = Field(default=None, max_length=1000)


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8, max_length=128)

    _check_password = field_validator("new_password")(_validate_password_strength)


class UserAdminUpdate(BaseModel):
    role: UserRole | None = None
    is_active: bool | None = None


class UserPublic(BaseModel):
    """Datos que cualquiera puede ver (nunca email ni hash)."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    full_name: str | None = None
    bio: str | None = None


class UserRead(UserPublic):
    email: EmailStr
    role: UserRole
    is_active: bool
    created_at: datetime
