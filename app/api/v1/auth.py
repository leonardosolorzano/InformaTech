from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.limiter import limiter
from app.core.security import create_access_token
from app.schemas.auth import TokenResponse
from app.schemas.user import UserCreate, LoginRequest
from app.services import users as service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
@limiter.limit(settings.rate_limit_register)
def register(
    request: Request,
    user_in: UserCreate,
    db: Session = Depends(get_db),
):
    user = service.create_user(db, user_in)
    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token, user=user)


@router.post("/login", response_model=TokenResponse)
@limiter.limit(settings.rate_limit_login)
def login(
    request: Request,
    login_in: LoginRequest,
    db: Session = Depends(get_db),
):
    user = service.authenticate_user(db, login_in.username, login_in.password)
    if not user:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token, user=user)
