import re
import unicodedata


def slugify(text: str, max_length: int = 120) -> str:
    """'Inteligencia Artificial: ¡Nueva era!' -> 'inteligencia-artificial-nueva-era'."""
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text.lower()).strip("-")
    return text[:max_length].strip("-") or "item"


def escape_like(value: str) -> str:
    """Escapa %, _ y \\ para búsquedas LIKE seguras."""
    return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
