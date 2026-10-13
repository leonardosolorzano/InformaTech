import os

# Debe fijarse ANTES de importar la app
os.environ["ENVIRONMENT"] = "testing"
os.environ["DATABASE_URL"] = "sqlite://"
os.environ["UPLOAD_DIR"] = "/tmp/technews_test_uploads"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models import User, UserRole
from app.schemas.user import UserCreate
from app.services import category_service, user_service
from app.schemas.category import CategoryCreate

PASSWORD = "Password123"


@pytest.fixture()
def db_session():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    TestingSession = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
    session = TestingSession()
    yield session
    session.close()
    Base.metadata.drop_all(engine)


@pytest.fixture()
def client(db_session):
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def _make_user(db, username: str, role: UserRole = UserRole.USER) -> User:
    return user_service.create(
        db, UserCreate(email=f"{username}@test.com", username=username, password=PASSWORD), role=role
    )


def _auth_headers(client, username: str) -> dict:
    r = client.post("/api/v1/auth/login", data={"username": username, "password": PASSWORD})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


@pytest.fixture()
def user_headers(client, db_session):
    _make_user(db_session, "alice")
    return _auth_headers(client, "alice")


@pytest.fixture()
def other_headers(client, db_session):
    _make_user(db_session, "bob")
    return _auth_headers(client, "bob")


@pytest.fixture()
def editor_headers(client, db_session):
    _make_user(db_session, "eve", UserRole.EDITOR)
    return _auth_headers(client, "eve")


@pytest.fixture()
def admin_headers(client, db_session):
    _make_user(db_session, "root", UserRole.ADMIN)
    return _auth_headers(client, "root")


@pytest.fixture()
def category(db_session):
    return category_service.create(db_session, CategoryCreate(name="Inteligencia Artificial"))


@pytest.fixture()
def article_payload(category):
    return {
        "title": "OpenAI lanza un nuevo modelo",
        "summary": "Resumen corto del articulo sobre el nuevo modelo.",
        "content": "Contenido largo del artículo " * 5,
        "category_id": category.id,
        "tags": ["IA", "openai", "ia"],
    }
