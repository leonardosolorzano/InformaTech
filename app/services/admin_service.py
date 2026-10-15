from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.article import Article, ArticleStatus
from app.models.category import Category
from app.models.tag import Tag
from app.models.user import User


def stats(db: Session) -> dict:
    """Métricas agregadas para el panel de administración."""
    article_counts = dict(
        db.execute(select(Article.status, func.count(Article.id)).group_by(Article.status)).all()
    )
    return {
        "users": db.scalar(select(func.count(User.id))) or 0,
        "active_users": db.scalar(select(func.count(User.id)).where(User.is_active.is_(True))) or 0,
        "articles_total": db.scalar(select(func.count(Article.id))) or 0,
        "articles_draft": article_counts.get(ArticleStatus.DRAFT, 0),
        "articles_pending": article_counts.get(ArticleStatus.PENDING, 0),
        "articles_published": article_counts.get(ArticleStatus.PUBLISHED, 0),
        "articles_rejected": article_counts.get(ArticleStatus.REJECTED, 0),
        "total_views": db.scalar(select(func.coalesce(func.sum(Article.views_count), 0))) or 0,
        "categories": db.scalar(select(func.count(Category.id))) or 0,
        "tags": db.scalar(select(func.count(Tag.id))) or 0,
    }
