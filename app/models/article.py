from datetime import UTC, datetime

from sqlalchemy import String, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


CATEGORIES = [
    "Inteligencia Artificial",
    "Ciberseguridad",
    "Cloud Computing",
    "Blockchain",
    "DevOps",
    "Desarrollo Web",
    "Data Science",
    "IoT",
]


class Article(Base):
    __tablename__ = "articles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    minutes_to_read: Mapped[int] = mapped_column(Integer, nullable=False)
    fecha_publication: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
    )
    category: Mapped[str | None] = mapped_column(String(50), nullable=True, default=None)

    image_url: Mapped[str | None] = mapped_column(String(255), nullable=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    author: Mapped["User"] = relationship(
        "User",
        back_populates="articles",
    )

    @property
    def author_name(self) -> str:
        return self.author.full_name if self.author else ""

    @property
    def author_image_url(self) -> str | None:
        return self.author.image_url if self.author else None
