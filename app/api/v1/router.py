from fastapi import APIRouter

from app.api.v1.endpoints import articles, auth, categories, comments, tags, users

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(categories.router)
api_router.include_router(tags.router)
api_router.include_router(articles.router)
api_router.include_router(comments.router)
