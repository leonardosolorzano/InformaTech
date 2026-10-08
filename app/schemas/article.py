from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

from app.schemas.category import CategoryResponse


class ArticleBase(BaseModel):
    title: str = Field(
        ...,
        min_length=10,
        max_length=150,
        description="Título del artículo, entre 10 y 150 caracteres"
    )
    content: str = Field(
        ...,
        min_length=50,
        max_length=10000,
        description="Contenido completo del artículo, entre 50 y 10000 caracteres"
    )
    minutes_to_read: int = Field(
        ...,
        ge=1,
        le=999,
        description="Tiempo estimado para leer el artículo, en minutos (1-999)"
    )
    fecha_publication: date = Field(
        ...,
        description="Fecha de publicación del artículo"
    )
    category_id: int | None = Field(
        None,
        ge=1,
        description="ID de la categoría del artículo",
    )


class ArticleCreate(ArticleBase):
    user_id: int = Field(..., ge=1, description="ID del autor")
    image_url: str | None = Field(
        None,
        description="URL de la imagen asociada al artículo"
    )


class ArticleCreateRequest(ArticleBase):
    image_url: str | None = Field(
        None,
        description="URL de la imagen asociada al artículo"
    )


class ArticleUpdate(BaseModel):
    title: Optional[str] = Field(
        None, min_length=10, max_length=150
    )
    content: Optional[str] = Field(
        None, min_length=50, max_length=10000
    )
    minutes_to_read: Optional[int] = Field(
        None, ge=1, le=999
    )
    fecha_publication: Optional[date] = None
    category_id: int | None = Field(None, ge=1)
    image_url: str | None = Field(
        None,
        description="URL de la imagen asociada al artículo"
    )


class ArticleResponse(ArticleBase):
    id: int
    user_id: int
    author_name: str
    category: CategoryResponse | None = None
    image_url: str | None = None
    author_image_url: str | None = None

    model_config = {"from_attributes": True}
