from datetime import date

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.user import User
from app.schemas.article import ArticleCreate, ArticleResponse
from app.schemas.category import CategoryCreate
from app.services import articles as article_service
from app.services import category as category_service


def test_category_crud(client, db: Session):
	created = client.post(
		"/category/",
		json={"name": "Robótica", "description": "Noticias sobre robots"},
	)
	assert created.status_code == 201
	category_id = created.json()["id"]

	assert client.get("/category/").json()[0]["name"] == "Robótica"
	assert client.get(f"/category/{category_id}").status_code == 200

	updated = client.put(
		f"/category/{category_id}",
		json={"name": "Robótica avanzada"},
	)
	assert updated.status_code == 200
	assert updated.json()["name"] == "Robótica avanzada"

	assert client.delete(f"/category/{category_id}").status_code == 204
	assert client.get(f"/category/{category_id}").status_code == 404


def test_article_category_relationship_and_delete_protection(
	db: Session,
	client,
):
	user = User(
		username="category-author",
		email="category-author@example.com",
		full_name="Category Author",
		hashed_password="dummyhash",
	)
	category = category_service.create_category(
		db,
		CategoryCreate(name="Inteligencia artificial"),
	)
	db.add(user)
	db.commit()
	db.refresh(user)

	article = article_service.create(
		db,
		ArticleCreate(
			title="Un artículo sobre inteligencia artificial",
			content=(
				"Contenido de prueba suficientemente extenso para superar "
				"la validación mínima del esquema de artículos."
			),
			user_id=user.id,
			minutes_to_read=4,
			fecha_publication=date(2026, 10, 7),
			category_id=category.id,
		),
	)

	response = ArticleResponse.model_validate(article)
	assert response.category is not None
	assert response.category.id == category.id
	assert response.category.name == category.name

	deletion = client.delete(f"/category/{category.id}")
	assert deletion.status_code == 409
	assert db.query(Category).filter(Category.id == category.id).first() is not None
