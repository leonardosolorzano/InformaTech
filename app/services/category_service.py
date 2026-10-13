from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError
from app.core.utils import slugify
from app.models.article import Article
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate


def list_all(db: Session) -> list[Category]:
    return list(db.scalars(select(Category).order_by(Category.name)).all())


def get_by_id(db: Session, category_id: int) -> Category | None:
    return db.get(Category, category_id)


def get_by_slug(db: Session, slug: str) -> Category | None:
    return db.scalar(select(Category).where(Category.slug == slug))


def _ensure_unique(db: Session, name: str, slug: str, exclude_id: int | None = None) -> None:
    stmt = select(Category.id).where((Category.name == name) | (Category.slug == slug))
    if exclude_id:
        stmt = stmt.where(Category.id != exclude_id)
    if db.scalar(stmt) is not None:
        raise ConflictError("Ya existe una categoría con ese nombre")


def create(db: Session, data: CategoryCreate) -> Category:
    slug = slugify(data.name)
    _ensure_unique(db, data.name, slug)
    category = Category(name=data.name, slug=slug, description=data.description)
    db.add(category)
    db.commit()
    return category


def update(db: Session, category: Category, data: CategoryUpdate) -> Category:
    values = data.model_dump(exclude_unset=True)
    if "name" in values and values["name"]:
        slug = slugify(values["name"])
        _ensure_unique(db, values["name"], slug, exclude_id=category.id)
        category.name, category.slug = values["name"], slug
    if "description" in values:
        category.description = values["description"]
    db.commit()
    return category


def delete(db: Session, category: Category) -> None:
    in_use = db.scalar(select(func.count(Article.id)).where(Article.category_id == category.id))
    if in_use:
        raise ConflictError(f"No se puede eliminar: tiene {in_use} artículo(s) asociado(s)")
    db.delete(category)
    db.commit()


def get_or_404(db: Session, category_id: int) -> Category:
    category = get_by_id(db, category_id)
    if not category:
        raise NotFoundError("Categoría no encontrada")
    return category
