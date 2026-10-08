from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.category import Category as CategoryModel
from app.schemas.category import CategoryCreate, CategoryUpdate


def get_all(db: Session) -> list[CategoryModel]:
    return db.query(CategoryModel).all()


def get_by_id(db: Session, category_id: int) -> CategoryModel | None:
    return db.query(CategoryModel).filter(CategoryModel.id == category_id).first()


def create_category(db: Session, category_in: CategoryCreate) -> CategoryModel:
    category = CategoryModel(
        name=category_in.name,
        description=category_in.description,
    )
    db.add(category)
    db.commit()
    db.refresh(category)

    return category


def update_category(
    db: Session,
    category_id: int,
    category_in: CategoryUpdate,
) -> CategoryModel:
    category = get_by_id(db, category_id)

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    for field, value in category_in.model_dump(exclude_unset=True).items():
        if field == "name" and value is not None:
            category.name = value
        elif field == "description":
            category.description = value

    db.commit()
    db.refresh(category)

    return category


def delete_category(db: Session, category_id: int) -> None:
    category = get_by_id(db, category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )
    if category.articles:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Category is assigned to articles and cannot be deleted.",
        )
    db.delete(category)
    db.commit()

