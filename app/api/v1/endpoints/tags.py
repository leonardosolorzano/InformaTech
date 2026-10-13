from typing import Annotated

from fastapi import APIRouter, Query

from app.api.deps import DbSession
from app.schemas.tag import TagWithCount
from app.services import tag_service

router = APIRouter(prefix="/tags", tags=["Etiquetas"])


@router.get("", response_model=list[TagWithCount], summary="Etiquetas más populares")
def popular_tags(db: DbSession, limit: Annotated[int, Query(ge=1, le=100)] = 20):
    return [
        TagWithCount(id=t.id, name=t.name, slug=t.slug, articles_count=n)
        for t, n in tag_service.popular(db, limit)
    ]
