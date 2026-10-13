from datetime import UTC, datetime
from typing import Literal

from sqlalchemy import func, or_, select, update
from sqlalchemy.orm import Session, joinedload, selectinload

from app.core.exceptions import ConflictError, NotFoundError, PermissionDeniedError, BadRequestError
from app.core.utils import escape_like, slugify
from app.models.article import Article, ArticleStatus
from app.models.category import Category
from app.models.tag import Tag
from app.models.user import User
from app.schemas.article import ArticleCreate, ArticleReview, ArticleUpdate
from app.services import category_service, tag_service

SortOption = Literal["newest", "popular"]

# Carga ansiosa: evita el problema N+1 al serializar listas.
_LOAD = (
    joinedload(Article.author),
    joinedload(Article.category),
    selectinload(Article.tags),
)


def _unique_slug(db: Session, title: str) -> str:
    base = slugify(title, max_length=200)
    slug, n = base, 2
    while db.scalar(select(Article.id).where(Article.slug == slug)) is not None:
        slug = f"{base}-{n}"
        n += 1
    return slug


def _paginate(db: Session, conditions: list, order, page: int, size: int) -> tuple[list[Article], int]:
    total = db.scalar(select(func.count(Article.id)).where(*conditions)) or 0
    stmt = (
        select(Article).where(*conditions).options(*_LOAD)
        .order_by(*order).offset((page - 1) * size).limit(size)
    )
    return list(db.scalars(stmt).unique().all()), total


# ---------- Lecturas ----------
def get_by_id(db: Session, article_id: int) -> Article | None:
    return db.scalar(select(Article).where(Article.id == article_id).options(*_LOAD))


def get_by_slug(db: Session, slug: str) -> Article | None:
    return db.scalar(select(Article).where(Article.slug == slug).options(*_LOAD))


def get_or_404(db: Session, article_id: int) -> Article:
    article = get_by_id(db, article_id)
    if not article:
        raise NotFoundError("Artículo no encontrado")
    return article


def can_manage(article: Article, user: User) -> bool:
    return article.author_id == user.id or user.is_moderator


def get_visible_by_slug(db: Session, slug: str, viewer: User | None) -> Article:
    """Publicados: todos. Otros estados: solo autor y moderadores (el resto recibe 404)."""
    article = get_by_slug(db, slug)
    if not article:
        raise NotFoundError("Artículo no encontrado")
    if article.status != ArticleStatus.PUBLISHED and not (viewer and can_manage(article, viewer)):
        raise NotFoundError("Artículo no encontrado")
    return article


def register_view(db: Session, article: Article) -> None:
    """Incremento atómico en SQL (evita condiciones de carrera con lecturas concurrentes)."""
    db.execute(update(Article).where(Article.id == article.id).values(views_count=Article.views_count + 1))
    db.commit()
    db.refresh(article, ["views_count"])  # valor real desde la BD


def list_published(
    db: Session, *, page: int, size: int, category: str | None = None, tag: str | None = None,
    author: str | None = None, q: str | None = None, sort: SortOption = "newest",
) -> tuple[list[Article], int]:
    conditions = [Article.status == ArticleStatus.PUBLISHED]
    if category:
        conditions.append(Article.category.has(Category.slug == category))
    if tag:
        conditions.append(Article.tags.any(Tag.slug == tag))
    if author:
        conditions.append(Article.author.has(User.username == author))
    if q:
        pattern = f"%{escape_like(q.strip())}%"
        conditions.append(or_(
            Article.title.ilike(pattern, escape="\\"),
            Article.summary.ilike(pattern, escape="\\"),
        ))
    order = (
        [Article.views_count.desc(), Article.published_at.desc()]
        if sort == "popular" else [Article.published_at.desc(), Article.id.desc()]
    )
    return _paginate(db, conditions, order, page, size)


def list_by_author(
    db: Session, author: User, *, page: int, size: int, status: ArticleStatus | None = None
) -> tuple[list[Article], int]:
    conditions = [Article.author_id == author.id]
    if status:
        conditions.append(Article.status == status)
    return _paginate(db, conditions, [Article.created_at.desc(), Article.id.desc()], page, size)


def list_for_moderation(
    db: Session, *, page: int, size: int, status: ArticleStatus = ArticleStatus.PENDING
) -> tuple[list[Article], int]:
    return _paginate(db, [Article.status == status], [Article.created_at.asc()], page, size)


# ---------- Escrituras ----------
def create(db: Session, data: ArticleCreate, author: User) -> Article:
    category_service.get_or_404(db, data.category_id)
    article = Article(
        title=data.title,
        slug=_unique_slug(db, data.title),
        summary=data.summary,
        content=data.content,
        category_id=data.category_id,
        author_id=author.id,
        status=ArticleStatus.DRAFT,
        tags=tag_service.get_or_create_many(db, data.tags),
    )
    db.add(article)
    db.commit()
    return get_or_404(db, article.id)


def update_article(db: Session, article: Article, data: ArticleUpdate, user: User) -> Article:
    if not can_manage(article, user):
        raise PermissionDeniedError("Solo el autor o un editor pueden modificar este artículo")
    values = data.model_dump(exclude_unset=True)
    if values.get("category_id") is not None:
        category_service.get_or_404(db, values["category_id"])
    if "tags" in values and values["tags"] is not None:
        article.tags = tag_service.get_or_create_many(db, values.pop("tags"))
    else:
        values.pop("tags", None)
    for field, value in values.items():
        if value is not None:
            setattr(article, field, value)  # el slug NO cambia: se preservan las URLs (SEO)
    # Si un autor edita algo ya publicado, vuelve a revisión.
    if article.status == ArticleStatus.PUBLISHED and not user.is_moderator:
        article.status = ArticleStatus.PENDING
    db.commit()
    return get_or_404(db, article.id)


def submit_for_review(db: Session, article: Article, user: User) -> Article:
    if article.author_id != user.id:
        raise PermissionDeniedError("Solo el autor puede enviar el artículo a revisión")
    if article.status not in (ArticleStatus.DRAFT, ArticleStatus.REJECTED):
        raise ConflictError(f"Un artículo en estado '{article.status.value}' no se puede enviar a revisión")
    article.status = ArticleStatus.PENDING
    article.rejection_reason = None
    db.commit()
    return get_or_404(db, article.id)


def review(db: Session, article: Article, data: ArticleReview) -> Article:
    if article.status != ArticleStatus.PENDING:
        raise ConflictError("Solo se pueden revisar artículos en estado 'pending'")
    if data.action == "approve":
        article.status = ArticleStatus.PUBLISHED
        article.rejection_reason = None
        article.published_at = article.published_at or datetime.now(UTC)
    else:
        if not data.reason:
            raise BadRequestError("Debes indicar un motivo al rechazar el artículo")
        article.status = ArticleStatus.REJECTED
        article.rejection_reason = data.reason
    db.commit()
    return get_or_404(db, article.id)


def set_cover(db: Session, article: Article, url: str) -> Article:
    article.cover_image_url = url
    db.commit()
    return get_or_404(db, article.id)


def delete(db: Session, article: Article, user: User) -> None:
    if not can_manage(article, user):
        raise PermissionDeniedError("Solo el autor o un editor pueden eliminar este artículo")
    db.delete(article)
    db.commit()
