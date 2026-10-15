from typing import Annotated

from fastapi import APIRouter, Query, status

from app.api.deps import AdminUser, DbSession, PaginationParams
from app.models.article import ArticleStatus
from app.schemas.admin import AdminArticleCreate, AdminArticleUpdate, AdminStats
from app.schemas.article import ArticleListItem, ArticleRead
from app.schemas.common import Page
from app.services import admin_service, article_service, storage_service

router = APIRouter(prefix="/admin", tags=["Administración"])


@router.get("/stats", response_model=AdminStats, summary="Métricas del panel (admin)")
def get_stats(db: DbSession, _: AdminUser):
    return admin_service.stats(db)


@router.get("/articles", response_model=Page[ArticleListItem], summary="Todos los artículos (admin)")
def list_all_articles(
    db: DbSession,
    _: AdminUser,
    p: PaginationParams,
    status_: Annotated[ArticleStatus | None, Query(alias="status")] = None,
    author: Annotated[str | None, Query(description="Username del autor")] = None,
    q: Annotated[str | None, Query(min_length=2, max_length=100)] = None,
):
    items, total = article_service.admin_list(
        db, page=p.page, size=p.size, status=status_, author=author, q=q
    )
    return Page.create(items, total, p.page, p.size)


@router.get("/articles/{article_id}", response_model=ArticleRead, summary="Detalle de artículo (admin)")
def get_article(article_id: int, db: DbSession, _: AdminUser):
    return article_service.get_or_404(db, article_id)


@router.post(
    "/articles",
    response_model=ArticleRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear y publicar artículo (admin)",
)
def create_article(data: AdminArticleCreate, db: DbSession, admin: AdminUser):
    return article_service.create(db, data, admin, status=data.status)


@router.patch("/articles/{article_id}", response_model=ArticleRead, summary="Editar artículo (admin)")
def update_article(article_id: int, data: AdminArticleUpdate, db: DbSession, admin: AdminUser):
    article = article_service.get_or_404(db, article_id)
    return article_service.admin_update(db, article, data, admin)


@router.delete(
    "/articles/{article_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Eliminar artículo (admin)"
)
def delete_article(article_id: int, db: DbSession, admin: AdminUser):
    article = article_service.get_or_404(db, article_id)
    cover = article.cover_image_url
    article_service.delete(db, article, admin)
    storage_service.delete_cover_image(cover)
