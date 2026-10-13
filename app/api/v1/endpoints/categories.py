from fastapi import APIRouter, status

from app.api.deps import AdminUser, DbSession
from app.core.exceptions import NotFoundError
from app.schemas.category import CategoryCreate, CategoryDetail, CategoryRead, CategoryUpdate
from app.services import category_service

router = APIRouter(prefix="/categories", tags=["Categorías"])


@router.get("", response_model=list[CategoryRead])
def list_categories(db: DbSession):
    return category_service.list_all(db)


@router.get("/{slug}", response_model=CategoryDetail)
def get_category(slug: str, db: DbSession):
    category = category_service.get_by_slug(db, slug)
    if not category:
        raise NotFoundError("Categoría no encontrada")
    return category


@router.post("", response_model=CategoryDetail, status_code=status.HTTP_201_CREATED)
def create_category(data: CategoryCreate, db: DbSession, _: AdminUser):
    return category_service.create(db, data)


@router.put("/{category_id}", response_model=CategoryDetail)
def update_category(category_id: int, data: CategoryUpdate, db: DbSession, _: AdminUser):
    category = category_service.get_or_404(db, category_id)
    return category_service.update(db, category, data)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(category_id: int, db: DbSession, _: AdminUser):
    category = category_service.get_or_404(db, category_id)
    category_service.delete(db, category)
