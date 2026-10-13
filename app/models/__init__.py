"""Importar todos los modelos aquí garantiza que Alembic/SQLAlchemy los registren."""
from app.models.article import Article, ArticleStatus
from app.models.category import Category
from app.models.comment import Comment
from app.models.tag import Tag, article_tags
from app.models.user import User, UserRole

__all__ = [
    "Article", "ArticleStatus", "Category", "Comment", "Tag", "User", "UserRole", "article_tags",
]
