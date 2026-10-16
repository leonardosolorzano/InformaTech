from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.article import ArticleStatus
from app.schemas.category import CategoryRead
from app.schemas.tag import TagRead
from app.schemas.user import UserPublic


def _normalize_tags(tags: list[str] | None) -> list[str] | None:
    if tags is None:
        return None
    cleaned: list[str] = []
    for tag in tags:
        t = tag.strip().lower()
        if not 2 <= len(t) <= 30:
            raise ValueError("Cada etiqueta debe tener entre 2 y 30 caracteres")
        if t not in cleaned:
            cleaned.append(t)
    if len(cleaned) > 8:
        raise ValueError("Máximo 8 etiquetas por artículo")
    return cleaned


class ArticleCreate(BaseModel):
    title: str = Field(min_length=5, max_length=200)
    summary: str = Field(min_length=10, max_length=500)
    content: str = Field(min_length=50)
    category_id: int
    tags: list[str] = Field(default_factory=list)

    _clean_tags = field_validator("tags")(_normalize_tags)

    @field_validator("title", "summary")
    @classmethod
    def _strip(cls, v: str) -> str:
        return v.strip()


class ArticleUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=5, max_length=200)
    summary: str | None = Field(default=None, min_length=10, max_length=500)
    content: str | None = Field(default=None, min_length=50)
    category_id: int | None = None
    tags: list[str] | None = None

    _clean_tags = field_validator("tags")(_normalize_tags)


class ArticleReview(BaseModel):
    action: Literal["approve", "reject"]
    reason: str | None = Field(default=None, max_length=1000)


class ArticleListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    slug: str
    summary: str
    cover_image_url: str | None = None
    status: ArticleStatus
    views_count: int
    published_at: datetime | None = None
    is_featured: bool = False
    created_at: datetime
    author: UserPublic
    category: CategoryRead
    tags: list[TagRead] = []


class ArticleRead(ArticleListItem):
    content: str
    rejection_reason: str | None = None
    updated_at: datetime
