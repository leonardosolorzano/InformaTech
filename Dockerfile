FROM ghcr.io/astral-sh/uv:python3.14-bookworm-slim

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /code

# Copiar archivos de dependencias
COPY pyproject.toml uv.lock ./

# Instalar dependencias de producción (sin instalar el proyecto aún)
RUN uv sync --no-dev --no-install-project --frozen

# Copiar código
COPY . .

# Instalar el proyecto
RUN uv sync --no-dev --frozen

# Crear usuario sin privilegios
RUN useradd -m appuser && mkdir -p /code/uploads && chown -R appuser /code
USER appuser

ENV PATH="/code/.venv/bin:$PATH"

EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s \
  CMD python -c "import urllib.request as u; u.urlopen('http://localhost:8000/health')" || exit 1

# Migraciones, datos iniciales y arranque
CMD ["sh", "-c", "alembic upgrade head && python -m app.initial_data && uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers ${WEB_CONCURRENCY:-1}"]
