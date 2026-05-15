import io
import uuid
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File
from sqlalchemy.orm import Session
from PIL import Image

from app.api.dependencies import get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.core.limiter import limiter
from app.models.user import User as UserModel
from app.schemas.user import UserCreate, UserResponse, UserUpdate, LoginRequest
from app.services import users as service

router = APIRouter(prefix="/users", tags=["users"])

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "static" / "uploads" / "avatars"


@router.get("/", response_model=list[UserResponse])
def read_users(db: Session = Depends(get_db)):
    return service.get_users(db)


@router.get("/id/{user_id}", response_model=UserResponse)
def read_user_by_id(user_id: int, db: Session = Depends(get_db)):
    user = service.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return user


@router.get("/email/{email}", response_model=UserResponse)
def read_user_by_email(email: str, db: Session = Depends(get_db)):
    user = service.get_user_by_email(db, email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return user


@router.get("/username/{username}", response_model=UserResponse)
def read_user_by_username(username: str, db: Session = Depends(get_db)):
    user = service.get_user_by_username(db, username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return user


@router.post("/login", response_model=UserResponse)
@limiter.limit(settings.rate_limit_login)
def login_user(
    request: Request,
    login_in: LoginRequest,
    db: Session = Depends(get_db),
):
    user = service.authenticate_user(db, login_in.username, login_in.password)
    if not user:
        raise HTTPException(status_code=401, detail="Credenciales inválidas.")
    return user


@router.post("/", response_model=UserResponse, status_code=201)
@limiter.limit(settings.rate_limit_register)
def create_user(
    request: Request,
    user_in: UserCreate,
    db: Session = Depends(get_db),
):
    return service.create_user(db, user_in)


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_in: UserUpdate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="No puedes modificar otro usuario.")
    return service.update_user(db, user_id, user_in)


@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="No puedes eliminar otro usuario.")
    service.delete_user(db, user_id)
    return {"message": "User deleted."}


@router.post("/me/avatar", response_model=UserResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="El archivo debe ser una imagen.")

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    ext = Path(file.filename).suffix if file.filename else ".jpg"
    filename = f"{current_user.id}_{uuid.uuid4().hex}{ext}"
    filepath = UPLOAD_DIR / filename

    contents = await file.read()

    try:
        img = Image.open(io.BytesIO(contents))
        img.thumbnail((300, 300))
        img.save(filepath, optimize=True, quality=85)
    except Exception:
        raise HTTPException(status_code=400, detail="No se pudo procesar la imagen.")

    image_url = f"/media/uploads/avatars/{filename}"
    current_user.image_url = image_url
    db.commit()
    db.refresh(current_user)

    return current_user
