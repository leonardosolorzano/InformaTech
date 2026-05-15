from pydantic import BaseModel, Field
from typing import Optional
from datetime import date


CATEGORIES = [
    "Inteligencia Artificial",
    "Ciberseguridad",
    "Cloud Computing",
    "Blockchain",
    "DevOps",
    "Desarrollo Web",
    "Data Science",
    "IoT",
]


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
    category: Optional[str] = Field(
        None,
        description="Categoría del artículo",
    )


class ArticleCreate(ArticleBase):
    user_id: int = Field(..., ge=1, description="ID del autor")
    image_url: Optional[str] = Field(
        None,
        description="URL de la imagen asociada al artículo"
    )


class ArticleCreateRequest(ArticleBase):
    image_url: Optional[str] = Field(
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
    category: Optional[str] = None
    image_url: Optional[str] = Field(
        None,
        description="URL de la imagen asociada al artículo"
    )


class ArticleResponse(ArticleBase):
    id: int
    user_id: int
    author_name: str
    image_url: Optional[str] = None
    author_image_url: Optional[str] = None

    model_config = {"from_attributes": True}
