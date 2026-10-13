"""Guardado seguro de imágenes de portada en disco local.
Para producción a escala se puede reemplazar por S3/GCS manteniendo la misma interfaz."""
import io
import logging
import uuid
from pathlib import Path

from fastapi import UploadFile
from PIL import Image, UnidentifiedImageError

from app.core.config import settings
from app.core.exceptions import BadRequestError

logger = logging.getLogger(__name__)

# formato real detectado por Pillow -> extensión
_ALLOWED_FORMATS = {"JPEG": ".jpg", "PNG": ".png", "WEBP": ".webp"}
_MAX_PIXELS = 25_000_000  # protección contra "decompression bombs"
COVERS_SUBDIR = "covers"


def _covers_dir() -> Path:
    path = Path(settings.UPLOAD_DIR) / COVERS_SUBDIR
    path.mkdir(parents=True, exist_ok=True)
    return path


async def save_cover_image(file: UploadFile) -> str:
    """Valida (tamaño + contenido real) y guarda la imagen. Devuelve la URL pública."""
    data = await file.read(settings.max_upload_bytes + 1)
    if len(data) > settings.max_upload_bytes:
        raise BadRequestError(f"La imagen supera el máximo de {settings.MAX_UPLOAD_SIZE_MB} MB")
    if not data:
        raise BadRequestError("El archivo está vacío")

    try:
        with Image.open(io.BytesIO(data)) as img:
            fmt = img.format
            if img.width * img.height > _MAX_PIXELS:
                raise BadRequestError("La imagen tiene demasiados píxeles")
            img.verify()
    except UnidentifiedImageError as exc:
        raise BadRequestError("El archivo no es una imagen válida") from exc
    except Image.DecompressionBombError as exc:
        raise BadRequestError("La imagen es demasiado grande") from exc

    if fmt not in _ALLOWED_FORMATS:
        raise BadRequestError("Formato no permitido. Usa JPEG, PNG o WEBP")

    # Nombre generado por el servidor: nunca se usa el nombre que envía el cliente.
    filename = f"{uuid.uuid4().hex}{_ALLOWED_FORMATS[fmt]}"
    (_covers_dir() / filename).write_bytes(data)
    return f"{settings.MEDIA_URL}/{COVERS_SUBDIR}/{filename}"


def delete_cover_image(url: str | None) -> None:
    if not url or not url.startswith(f"{settings.MEDIA_URL}/{COVERS_SUBDIR}/"):
        return
    path = _covers_dir() / Path(url).name  # .name evita path traversal
    try:
        path.unlink(missing_ok=True)
    except OSError:
        logger.warning("No se pudo borrar %s", path)
