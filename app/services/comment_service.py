from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.core.exceptions import NotFoundError, PermissionDeniedError
from app.models.article import Article
from app.models.comment import Comment
from app.models.user import User


def list_for_article(db: Session, article: Article, page: int, size: int) -> tuple[list[Comment], int]:
    total = db.scalar(select(func.count(Comment.id)).where(Comment.article_id == article.id)) or 0
    stmt = (
        select(Comment).where(Comment.article_id == article.id)
        .options(joinedload(Comment.author))
        .order_by(Comment.created_at.asc(), Comment.id.asc())
        .offset((page - 1) * size).limit(size)
    )
    return list(db.scalars(stmt).all()), total


def create(db: Session, article: Article, author: User, content: str) -> Comment:
    comment = Comment(article_id=article.id, author_id=author.id, content=content.strip())
    db.add(comment)
    db.commit()
    return db.scalar(select(Comment).where(Comment.id == comment.id).options(joinedload(Comment.author)))


def delete(db: Session, comment_id: int, user: User) -> None:
    comment = db.get(Comment, comment_id)
    if not comment:
        raise NotFoundError("Comentario no encontrado")
    if comment.author_id != user.id and not user.is_moderator:
        raise PermissionDeniedError("Solo el autor o un editor pueden eliminar este comentario")
    db.delete(comment)
    db.commit()
