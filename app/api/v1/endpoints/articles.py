from typing import Annotated

from fastapi import APIRouter, File, Query, UploadFile, status

from app.core.exceptions import PermissionDeniedError
from app.api.deps import CurrentUser, DbSession, Moderator, OptionalUser, PaginationParams
from app.models.article import ArticleStatus
from app.schemas.article import (
    ArticleCreate, ArticleListItem, ArticleRead, ArticleReview, ArticleUpdate,
)
from app.schemas.common import Page
from app.services import article_service, storage_service

router = APIRouter(prefix="/articles", tags=["Artículos"])


# ----- Rutas estáticas primero (antes de /{slug}) -----
@router.get("", response_model=Page[ArticleListItem], summary="Listado público de artículos publicados")
def list_articles(
    db: DbSession,
    p: PaginationParams,
    category: Annotated[str | None, Query(description="Slug de la categoría")] = None,
    tag: Annotated[str | None, Query(description="Slug de la etiqueta")] = None,
    author: Annotated[str | None, Query(description="Username del autor")] = None,
    q: Annotated[str | None, Query(min_length=2, max_length=100, description="Búsqueda en título/resumen")] = None,
    sort: Annotated[article_service.SortOption, Query()] = "newest",
    exclude_featured: Annotated[bool, Query(description="Excluir artículos mostrados en la portada")] = False,
):
    items, total = article_service.list_published(
        db,
        page=p.page,
        size=p.size,
        category=category,
        tag=tag,
        author=author,
        q=q,
        sort=sort,
        exclude_featured=exclude_featured,
    )
    return Page.create(items, total, p.page, p.size)


@router.get("/featured", response_model=list[ArticleListItem], summary="Artículos destacados para portada (máximo 3)")
def featured_articles(
    db: DbSession,
    limit: Annotated[int, Query(ge=1, le=10, description="Máximo de artículos destacados a devolver")] = 3,
):
    items = article_service.list_featured(db, limit=limit)
    return items


@router.get("/me", response_model=Page[ArticleListItem], summary="Mis artículos (todos los estados)")
def my_articles(
    db: DbSession, user: CurrentUser, p: PaginationParams,
    status_: Annotated[ArticleStatus | None, Query(alias="status")] = None,
):
    items, total = article_service.list_by_author(db, user, page=p.page, size=p.size, status=status_)
    return Page.create(items, total, p.page, p.size)


@router.get("/moderation/queue", response_model=Page[ArticleListItem], summary="Cola de moderación (editor/admin)")
def moderation_queue(
    db: DbSession, _: Moderator, p: PaginationParams,
    status_: Annotated[ArticleStatus, Query(alias="status")] = ArticleStatus.PENDING,
):
    items, total = article_service.list_for_moderation(db, page=p.page, size=p.size, status=status_)
    return Page.create(items, total, p.page, p.size)


@router.post("", response_model=ArticleRead, status_code=status.HTTP_201_CREATED, summary="Crear artículo (borrador)")
def create_article(data: ArticleCreate, db: DbSession, user: CurrentUser):
    return article_service.create(db, data, user)


# ----- Rutas por slug / id -----
@router.get("/{slug}", response_model=ArticleRead, summary="Detalle de un artículo")
def get_article(slug: str, db: DbSession, viewer: OptionalUser):
    article = article_service.get_visible_by_slug(db, slug, viewer)
    if article.status == ArticleStatus.PUBLISHED:
        article_service.register_view(db, article)
    return article


@router.patch("/{article_id}", response_model=ArticleRead, summary="Editar artículo")
def update_article(article_id: int, data: ArticleUpdate, db: DbSession, user: CurrentUser):
    article = article_service.get_or_404(db, article_id)
    return article_service.update_article(db, article, data, user)


@router.delete("/{article_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Eliminar artículo")
def delete_article(article_id: int, db: DbSession, user: CurrentUser):
    article = article_service.get_or_404(db, article_id)
    cover = article.cover_image_url
    article_service.delete(db, article, user)
    storage_service.delete_cover_image(cover)


@router.post("/{article_id}/submit", response_model=ArticleRead, summary="Enviar a revisión")
def submit_article(article_id: int, db: DbSession, user: CurrentUser):
    article = article_service.get_or_404(db, article_id)
    return article_service.submit_for_review(db, article, user)


@router.post("/{article_id}/review", response_model=ArticleRead, summary="Aprobar o rechazar (editor/admin)")
def review_article(article_id: int, data: ArticleReview, db: DbSession, _: Moderator):
    article = article_service.get_or_404(db, article_id)
    return article_service.review(db, article, data)


@router.post("/{article_id}/cover", response_model=ArticleRead, summary="Subir imagen de portada")
async def upload_cover(article_id: int, db: DbSession, user: CurrentUser, file: Annotated[UploadFile, File()]):
    article = article_service.get_or_404(db, article_id)
    if not article_service.can_manage(article, user):
        raise PermissionDeniedError("Solo el autor o un editor pueden cambiar la portada")
    old = article.cover_image_url
    url = await storage_service.save_cover_image(file)
    article = article_service.set_cover(db, article, url)
    storage_service.delete_cover_image(old)
    return article
