from typing import Optional
from pydantic import BaseModel, Field


class UserBase(BaseModel):
    username: str = Field(
        ...,
        min_length=3,
        max_length=50,
        pattern=r"^[a-zA-Z0-9_]+$",
        description="Nombre de usuario, entre 3 y 50 caracteres alfanuméricos"
    )
    email: str = Field(
        ...,
        min_length=5,
        max_length=100,
        pattern=r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$",
        description="Correo electrónico del usuario"
    )


class UserResponse(UserBase):
    id: int
    full_name: str
    image_url: Optional[str] = None

    model_config = {"from_attributes": True}


class UserCreate(UserBase):
    full_name: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Nombre completo del usuario, entre 2 y 100 caracteres"
    )
    password: str = Field(
        ...,
        min_length=6,
        max_length=100,
        description="Contraseña del usuario, entre 6 y 100 caracteres"
    )
    image_url: Optional[str] = Field(
        None,
        description="URL de la imagen de perfil del usuario"
    )


class LoginRequest(BaseModel):
    username: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Username o email del usuario"
    )
    password: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Contraseña del usuario"
    )


class UserUpdate(BaseModel):
    username: Optional[str] = Field(
        None,
        min_length=3,
        max_length=50,
        pattern=r"^[a-zA-Z0-9_]+$",
    )
    email: Optional[str] = Field(
        None,
        min_length=5,
        max_length=100,
        pattern=r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$",
    )
    password: Optional[str] = Field(
        None,
        min_length=6,
        max_length=100,
    )
    full_name: Optional[str] = Field(
        None,
        min_length=2,
        max_length=100,
    )
    image_url: Optional[str] = Field(
        None,
        description="URL de la imagen de perfil del usuario"
    )
