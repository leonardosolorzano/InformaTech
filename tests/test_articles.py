from datetime import date

import pytest
from sqlalchemy.orm import Session

from app.models.article import Article as ArticleModel
from app.models.user import User as UserModel
from app.schemas.article import ArticleCreate, ArticleUpdate
from app.schemas.user import UserCreate
from app.services import articles as article_service
from app.services import users as user_service


@pytest.fixture(autouse=True)
def seed_data(db: Session):
    users = [
        UserModel(
            username="john",
            email="john@example.com",
            full_name="John Doe",
            hashed_password="dummyhash",
        ),
        UserModel(
            username="jane",
            email="jane@example.com",
            full_name="Jane Doe",
            hashed_password="dummyhash",
        ),
    ]
    for u in users:
        db.add(u)
    db.commit()

    articles = [
        ArticleModel(
            title="La importancia de la ciberseguridad en la era digital",
            content="La ciberseguridad se ha convertido en una preocupación fundamental en la era digital. Con el aumento de las amenazas cibernéticas, es crucial que tanto individuos como organizaciones tomen medidas para proteger su información y sistemas.",
            user_id=1,
            minutes_to_read=5,
            fecha_publication=date(2024, 4, 1),
        ),
        ArticleModel(
            title="Los desafíos de la privacidad en el entorno digital",
            content="Los desafíos de la privacidad en el entorno digital son cada vez más complejos. Con el crecimiento de la digitalización, es esencial garantizar que los derechos de los usuarios sean respetados y protegidos.",
            user_id=2,
            minutes_to_read=10,
            fecha_publication=date(2024, 5, 1),
        ),
        ArticleModel(
            title="La transformación digital en la educación",
            content="La transformación digital en la educación se ha convertido en un tema de gran importancia. Con el avance tecnológico, es fundamental integrar las herramientas digitales en el proceso de enseñanza-aprendizaje.",
            user_id=1,
            minutes_to_read=5,
            fecha_publication=date(2024, 6, 1),
        ),
    ]
    for a in articles:
        db.add(a)
    db.commit()


def test_get_all(db: Session):
    result = article_service.get_all(db)
    assert len(result) == 3


def test_get_by_id_found(db: Session):
    article = article_service.get_by_id(db, 1)
    assert article is not None
    assert article.title == "La importancia de la ciberseguridad en la era digital"


def test_get_by_id_not_found(db: Session):
    article = article_service.get_by_id(db, 999)
    assert article is None


def test_get_by_author_found(db: Session):
    articles = article_service.get_by_author(db, "John Doe")
    assert len(articles) == 2


def test_get_by_author_not_found(db: Session):
    articles = article_service.get_by_author(db, "Unknown")
    assert len(articles) == 0


def test_create(db: Session):
    payload = ArticleCreate(
        title="Nuevo artículo de prueba",
        content="Este es un artículo de prueba con contenido suficientemente largo para superar la validación de mínimo cincuenta caracteres exigida por el sistema.",
        user_id=1,
        minutes_to_read=3,
        fecha_publication=date(2024, 7, 1),
    )
    created = article_service.create(db, payload)
    assert created.id is not None
    assert created.title == "Nuevo artículo de prueba"
    assert created.author_name == "John Doe"

    all_articles = article_service.get_all(db)
    assert len(all_articles) == 4


def test_create_user_not_found(db: Session):
    payload = ArticleCreate(
        title="Artículo sin autor válido",
        content="Este artículo intenta crearse con un user_id que no existe en la base de datos.",
        user_id=999,
        minutes_to_read=5,
        fecha_publication=date(2024, 8, 1),
    )
    with pytest.raises(Exception) as exc:
        article_service.create(db, payload)
    assert "User not found" in str(exc.value)


def test_update(db: Session):
    payload = ArticleUpdate(title="Updated Title")
    updated = article_service.update(db, 1, payload)
    assert updated is not None
    assert updated.title == "Updated Title"


def test_update_not_found(db: Session):
    payload = ArticleUpdate(title="No matter what")
    updated = article_service.update(db, 999, payload)
    assert updated is None


def test_delete(db: Session):
    assert article_service.delete(db, 2) is True
    assert article_service.get_by_id(db, 2) is None


def test_delete_not_found(db: Session):
    assert article_service.delete(db, 999) is False


def test_create_user(db: Session):
    payload = UserCreate(
        username="newuser",
        email="new@example.com",
        full_name="New User",
        password="secret123",
    )
    user = user_service.create_user(db, payload)
    assert user.id is not None
    assert user.username == "newuser"
    assert user.email == "new@example.com"
    assert user.full_name == "New User"
    assert user.hashed_password != "secret123"

    all_users = user_service.get_users(db)
    assert len(all_users) == 3
