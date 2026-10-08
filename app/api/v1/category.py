
from fastapi import APIRouter, Depends, Response, status
from typing_extensions import Annotated
from sqlalchemy.orm import Session
from app.schemas.category import (
    CategoryResponse,
    CategoryCreate,
    CategoryUpdate,
)

from app.services import category as service

from app.core.database import get_db

router = APIRouter(prefix="/category", tags=["category"])


@router.get("/", response_model=list[CategoryResponse])
def read_categories(db: Annotated[Session, Depends(get_db)]):
    return service.get_all(db)


@router.get("/{category_id}", response_model=CategoryResponse)
def read_category(category_id: int, db: Annotated[Session, Depends(get_db)]):
    category = service.get_by_id(db, category_id)
    if not category:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="Category not found")
    return category


@router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    category_in: CategoryCreate,
    db: Annotated[Session, Depends(get_db)],
):
    return service.create_category(db, category_in)


@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    category_in: CategoryUpdate,
    db: Annotated[Session, Depends(get_db)],
):
    return service.update_category(db, category_id, category_in)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(category_id: int, db: Annotated[Session, Depends(get_db)]):
    service.delete_category(db, category_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
