from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.article import Article as ArticleModel
from app.models.user import User as UserModel
from app.schemas.article import ArticleCreate, ArticleUpdate


def get_all(db: Session) -> list[ArticleModel]:
    return db.query(ArticleModel).all()


def get_by_id(db: Session, article_id: int) -> ArticleModel | None:
    return db.query(ArticleModel).filter(ArticleModel.id == article_id).first()


def get_by_author(db: Session, author_name: str) -> list[ArticleModel]:
    return (
        db.query(ArticleModel)
        .join(UserModel)
        .filter(UserModel.full_name == author_name)
        .all()
    )


def create(db: Session, article_in: ArticleCreate) -> ArticleModel:
    user = db.query(UserModel).filter(UserModel.id == article_in.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found. A registered user is required to create an article.",
        )

    article = ArticleModel(
        title=article_in.title,
        content=article_in.content,
        minutes_to_read=article_in.minutes_to_read,
        fecha_publication=article_in.fecha_publication,
        category=article_in.category,
        image_url=article_in.image_url,
        user_id=article_in.user_id,
    )
    db.add(article)
    db.commit()
    db.refresh(article)
    return article


def update(db: Session, article_id: int, article_in: ArticleUpdate) -> ArticleModel | None:
    article = db.query(ArticleModel).filter(ArticleModel.id == article_id).first()
    if not article:
        return None
    for key, value in article_in.model_dump(exclude_unset=True).items():
        setattr(article, key, value)
    db.commit()
    db.refresh(article)
    return article


def delete(db: Session, article_id: int) -> bool:
    article = db.query(ArticleModel).filter(ArticleModel.id == article_id).first()
    if not article:
        return False
    db.delete(article)
    db.commit()
    return True
