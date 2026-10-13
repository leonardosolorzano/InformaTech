from fastapi import APIRouter, status

from app.api.deps import CurrentUser, DbSession, OptionalUser, PaginationParams
from app.schemas.comment import CommentCreate, CommentRead
from app.schemas.common import Page
from app.services import article_service, comment_service

router = APIRouter(tags=["Comentarios"])


@router.get("/articles/{slug}/comments", response_model=Page[CommentRead])
def list_comments(slug: str, db: DbSession, viewer: OptionalUser, p: PaginationParams):
    article = article_service.get_visible_by_slug(db, slug, viewer)
    items, total = comment_service.list_for_article(db, article, p.page, p.size)
    return Page.create(items, total, p.page, p.size)


@router.post("/articles/{slug}/comments", response_model=CommentRead, status_code=status.HTTP_201_CREATED)
def create_comment(slug: str, data: CommentCreate, db: DbSession, user: CurrentUser):
    article = article_service.get_visible_by_slug(db, slug, user)
    return comment_service.create(db, article, user, data.content)


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(comment_id: int, db: DbSession, user: CurrentUser):
    comment_service.delete(db, comment_id, user)
