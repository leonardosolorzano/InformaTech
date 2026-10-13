import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.category import Category
from app.models.mixins import TimestampMixin
from app.models.tag import Tag, article_tags
from app.models.user import User


class ArticleStatus(str, enum.Enum):
    DRAFT = "draft"          # borrador, solo visible para el autor
    PENDING = "pending"      # enviado a revisión
    PUBLISHED = "published"  # visible públicamente
    REJECTED = "rejected"    # rechazado por un editor (con motivo)


class Article(TimestampMixin, Base):
    __tablename__ = "articles"
    __table_args__ = (Index("ix_articles_status_published_at", "status", "published_at"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    summary: Mapped[str] = mapped_column(String(500))
    content: Mapped[str] = mapped_column(Text)
    cover_image_url: Mapped[str | None] = mapped_column(String(500))
    status: Mapped[ArticleStatus] = mapped_column(
        Enum(ArticleStatus, native_enum=False, length=20),
        default=ArticleStatus.DRAFT,
        nullable=False,
        index=True,
    )
    rejection_reason: Mapped[str | None] = mapped_column(Text)
    views_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    author_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), index=True)
    category_id: Mapped[int] = mapped_column(
        ForeignKey("categories.id", ondelete="RESTRICT"), index=True
    )

    author: Mapped[User] = relationship(back_populates="articles")
    category: Mapped[Category] = relationship(back_populates="articles")
    tags: Mapped[list[Tag]] = relationship(secondary=article_tags, back_populates="articles")
    comments: Mapped[list["Comment"]] = relationship(  # noqa: F821
        back_populates="article", cascade="all, delete-orphan"
    )
