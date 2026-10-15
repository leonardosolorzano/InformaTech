from pydantic import BaseModel, Field

from app.models.article import ArticleStatus
from app.schemas.article import ArticleCreate, ArticleUpdate


class AdminStats(BaseModel):
    users: int
    active_users: int
    articles_total: int
    articles_draft: int
    articles_pending: int
    articles_published: int
    articles_rejected: int
    total_views: int
    categories: int
    tags: int


class AdminArticleCreate(ArticleCreate):
    """Creación de artículo desde el panel: el admin elige el estado final."""

    status: ArticleStatus = ArticleStatus.PUBLISHED


class AdminArticleUpdate(ArticleUpdate):
    status: ArticleStatus | None = Field(
        default=None, description="Permite publicar, despublicar o archivar directamente"
    )
