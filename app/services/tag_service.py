from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.utils import slugify
from app.models.article import Article, ArticleStatus
from app.models.tag import Tag, article_tags


def get_or_create_many(db: Session, names: list[str]) -> list[Tag]:
    """Resuelve nombres de etiquetas a objetos Tag, creando los que falten."""
    tags: list[Tag] = []
    for name in names:
        slug = slugify(name, max_length=60)
        tag = db.scalar(select(Tag).where(Tag.slug == slug))
        if tag is None:
            tag = Tag(name=name, slug=slug)
            db.add(tag)
            db.flush()
        if tag not in tags:
            tags.append(tag)
    return tags


def popular(db: Session, limit: int = 20) -> list[tuple[Tag, int]]:
    """Etiquetas más usadas en artículos publicados."""
    count = func.count(article_tags.c.article_id)
    stmt = (
        select(Tag, count.label("n"))
        .join(article_tags, article_tags.c.tag_id == Tag.id)
        .join(Article, Article.id == article_tags.c.article_id)
        .where(Article.status == ArticleStatus.PUBLISHED)
        .group_by(Tag.id)
        .order_by(count.desc(), Tag.name)
        .limit(limit)
    )
    return [(tag, n) for tag, n in db.execute(stmt).all()]
