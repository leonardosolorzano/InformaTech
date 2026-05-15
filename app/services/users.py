import hashlib

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.models.user import User as UserModel
from app.schemas.user import UserCreate, UserUpdate


def _verify_password_legacy(plain_password: str, hashed_password: str) -> bool:
    try:
        salt, stored_hash = hashed_password.split("$", 1)
        pwd_hash = hashlib.pbkdf2_hmac(
            "sha256", plain_password.encode(), salt.encode(), 100000
        )
        return pwd_hash.hex() == stored_hash
    except ValueError:
        return False


def _verify_password_compat(plain_password: str, hashed_password: str) -> bool:
    if hashed_password.startswith("$2"):
        return verify_password(plain_password, hashed_password)
    if _verify_password_legacy(plain_password, hashed_password):
        return True
    return False


def get_user_by_username_or_email(db: Session, login: str) -> UserModel | None:
    return get_user_by_username(db, login) or get_user_by_email(db, login)


def authenticate_user(db: Session, username: str, password: str) -> UserModel | None:
    user = get_user_by_username_or_email(db, username)
    if not user:
        return None
    if verify_password(password, user.hashed_password):
        return user
    if _verify_password_legacy(password, user.hashed_password):
        user.hashed_password = hash_password(password)
        db.commit()
        return user
    return None


def get_users(db: Session) -> list[UserModel]:
    return db.query(UserModel).all()


def get_user_by_id(db: Session, user_id: int) -> UserModel | None:
    return db.query(UserModel).filter(UserModel.id == user_id).first()


def get_user_by_email(db: Session, email: str) -> UserModel | None:
    return db.query(UserModel).filter(UserModel.email == email).first()


def get_user_by_username(db: Session, username: str) -> UserModel | None:
    return db.query(UserModel).filter(UserModel.username == username).first()


def create_user(db: Session, user_in: UserCreate) -> UserModel:
    if get_user_by_email(db, user_in.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists.",
        )
    if get_user_by_username(db, user_in.username):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this username already exists.",
        )

    hashed = hash_password(user_in.password)

    user = UserModel(
        username=user_in.username,
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=hashed,
        image_url=user_in.image_url,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user(db: Session, user_id: int, user_in: UserUpdate) -> UserModel:
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    update_data = user_in.model_dump(exclude_unset=True)

    if "email" in update_data and update_data["email"] != user.email:
        if get_user_by_email(db, update_data["email"]):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this email already exists.",
            )

    if "username" in update_data and update_data["username"] != user.username:
        if get_user_by_username(db, update_data["username"]):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this username already exists.",
            )

    for key, value in update_data.items():
        if key == "password":
            setattr(user, "hashed_password", hash_password(value))
        else:
            setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user_id: int) -> None:
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )
    db.delete(user)
    db.commit()
