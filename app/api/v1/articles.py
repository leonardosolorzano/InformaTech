import io
import uuid
from pathlib import Path
from typing_extensions import Annotated

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from PIL import Image

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.article import (
    ArticleCreate,
    ArticleCreateRequest,
    ArticleResponse,
    ArticleUpdate,
)

from app.services import articles as service

router = APIRouter(prefix="/articles", tags=["articles"])

ARTICLE_UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "static" / "uploads" / "articles"


@router.get("/", response_model=list[ArticleResponse])
def read_articles(db: Annotated[Session, Depends(get_db)]):
    return service.get_all(db)


@router.get("/{article_id}", response_model=ArticleResponse)
def read_article(article_id: int, db: Annotated[Session, Depends(get_db)]):
    article = service.get_by_id(db, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found.")
    return article


@router.get("/author/{author_name}", response_model=list[ArticleResponse])
def read_articles_by_author(author_name: str, db: Annotated[Session, Depends(get_db)]):
    articles = service.get_by_author(db, author_name)
    if not articles:
        raise HTTPException(
            status_code=404,
            detail="No articles found for the given author.",
        )
    return articles


@router.post("/", response_model=ArticleResponse, status_code=201)
def create_article(
    article_in: ArticleCreateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    article_data = ArticleCreate(
        **article_in.model_dump(),
        user_id=current_user.id,
    )
    return service.create(db, article_data)


@router.put("/{article_id}", response_model=ArticleResponse)
def update_article(
    article_id: int,
    article_in: ArticleUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    article = service.get_by_id(db, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found.")
    if article.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permiso para editar este artículo.")
    updated = service.update(db, article_id, article_in)
    return updated


@router.delete("/{article_id}")
def delete_article(
    article_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    article = service.get_by_id(db, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found.")
    if article.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permiso para eliminar este artículo.")
    service.delete(db, article_id)
    return {"message": "Article deleted."}


@router.post("/upload-image")
async def upload_article_image(
    file: UploadFile = File(...),
    current_user: Annotated[User, Depends(get_current_user)] = None,
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="El archivo debe ser una imagen.")

    ARTICLE_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    ext = Path(file.filename).suffix if file.filename else ".jpg"
    filename = f"{current_user.id}_{uuid.uuid4().hex}{ext}"
    filepath = ARTICLE_UPLOAD_DIR / filename

    contents = await file.read()

    try:
        img = Image.open(io.BytesIO(contents))
        img.thumbnail((1200, 1200))
        img.save(filepath, optimize=True, quality=85)
    except Exception:
        raise HTTPException(status_code=400, detail="No se pudo procesar la imagen.")

    image_url = f"/media/uploads/articles/{filename}"
    return {"image_url": image_url}
