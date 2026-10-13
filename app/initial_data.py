"""Datos iniciales idempotentes: admin + categorías base.
Uso:  python -m app.initial_data"""
import logging

from app.core.config import settings
from app.db.session import SessionLocal
from app.models.user import UserRole
from app.schemas.category import CategoryCreate
from app.schemas.user import UserCreate
from app.services import category_service, user_service

logger = logging.getLogger(__name__)

DEFAULT_CATEGORIES = {
    "Inteligencia Artificial": "Modelos, herramientas y avances en IA",
    "Ciberseguridad": "Vulnerabilidades, brechas y buenas prácticas",
    "Hardware": "Procesadores, GPUs, dispositivos y componentes",
    "Software": "Lanzamientos, sistemas operativos y aplicaciones",
    "Programación": "Lenguajes, frameworks y herramientas para devs",
    "Startups": "Emprendimiento y financiamiento tecnológico",
    "Cloud": "Infraestructura, DevOps y servicios en la nube",
    "Gadgets": "Smartphones, wearables y electrónica de consumo",
}


def init_data() -> None:
    with SessionLocal() as db:
        if not user_service.get_by_email(db, settings.FIRST_ADMIN_EMAIL):
            user_service.create(
                db,
                UserCreate(
                    email=settings.FIRST_ADMIN_EMAIL,
                    username=settings.FIRST_ADMIN_USERNAME,
                    password=settings.FIRST_ADMIN_PASSWORD,
                    full_name="Administrador",
                ),
                role=UserRole.ADMIN,
            )
            print(f"✔ Admin creado: {settings.FIRST_ADMIN_EMAIL}")
        for name, description in DEFAULT_CATEGORIES.items():
            try:
                category_service.create(db, CategoryCreate(name=name, description=description))
                print(f"✔ Categoría creada: {name}")
            except Exception:  # ya existe
                db.rollback()


if __name__ == "__main__":
    init_data()
