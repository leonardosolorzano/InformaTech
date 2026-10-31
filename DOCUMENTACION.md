# TechNews API — Documentación del proyecto

Backend REST para un sitio de **noticias tecnológicas** donde los usuarios registrados pueden **subir artículos**, que pasan por un flujo de moderación antes de publicarse.

- **Framework:** FastAPI · **ORM:** SQLAlchemy 2.x · **BD:** SQLite (dev) / PostgreSQL (prod)
- **Estado:** 23 endpoints, 19 tests automatizados pasando, migración inicial generada y servidor real verificado.

---

## 1. Inicio rápido

```bash
python3.14 -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
(cd web && pnpm install)
cp .env.example .env              # y edita SECRET_KEY
pytest                            # ejecuta los tests
./scripts/dev.sh                  # backend + frontend (migraciones y seed incluidos)
```

`./scripts/dev.sh` usa SQLite por defecto, así que **no hace falta Docker ni PostgreSQL** para desarrollo local. Arranca el backend en <http://localhost:8000/docs> y el frontend en <http://localhost:3000>.

Si el servidor presenta errores relacionados con archivos temporales o compilaciones antiguas, detén los servidores y ejecuta `./scripts/limpiar-cache.sh`. El script elimina cachés de Python, pytest y Next.js; no borra dependencias, configuración, base de datos ni archivos subidos.

**Con Docker (PostgreSQL incluido, requiere Docker instalado):** `docker compose up --build`

Usuario admin por defecto (cámbialo en `.env`): `admin@example.com` / `Admin12345`.
Documentación interactiva: `/docs` (Swagger) y `/redoc` (desactivadas si `ENVIRONMENT=production`).

---

## 2. Librerías utilizadas y para qué

| Librería | Uso |
|---|---|
| **fastapi** | Framework web, validación, inyección de dependencias, OpenAPI automático |
| **uvicorn[standard]** | Servidor ASGI |
| **sqlalchemy 2.x** | ORM (estilo moderno con `Mapped[]` / `mapped_column`) |
| **alembic** | Migraciones de base de datos versionadas |
| **pydantic v2** | Esquemas de entrada/salida y validaciones |
| **pydantic-settings** | Configuración desde variables de entorno / `.env` |
| **email-validator** | Validación real de emails (`EmailStr`) |
| **pyjwt** | Creación y verificación de tokens JWT |
| **bcrypt** | Hash seguro de contraseñas |
| **python-multipart** | Necesario para formularios OAuth2 y subida de archivos |
| **pillow** | Verificar que lo subido es realmente una imagen |
| **psycopg[binary] (v3)** | Driver de PostgreSQL |
| **pytest + httpx** | Tests (TestClient de FastAPI) |

---

## 3. Arquitectura (por capas)

```
Request → Endpoint (api/) → Service (services/) → Model (models/) → BD
              │                    │
         valida con Schema    lanza excepciones de dominio
         (schemas/)           (core/exceptions.py) → main.py las convierte en HTTP
```

```
app/
├── main.py                 # create_app(): middlewares, handlers, rutas, /media, /health
├── initial_data.py         # seed idempotente (admin + categorías)
├── core/                   # config, seguridad (JWT/hash), excepciones, logging, utils
├── db/                     # Base declarativa (con naming convention) y sesión
├── models/                 # User, Category, Tag, Article, Comment (+ mixins)
├── schemas/                # Modelos Pydantic de request/response
├── services/               # Lógica de negocio (sin dependencias de FastAPI)
└── api/
    ├── deps.py             # auth, roles, paginación, sesión de BD
    └── v1/
        ├── router.py
        └── endpoints/      # auth, users, categories, tags, articles, comments
alembic/                    # migraciones
tests/                      # pytest
```

**Por qué esta separación:** los endpoints son delgados (solo HTTP); la lógica vive en servicios, que se pueden testear y reutilizar (por ejemplo, el seed usa los mismos servicios que la API). La API está versionada bajo `/api/v1`.

---

## 4. Modelo de datos

```
users ──< articles >── categories
  │          │ ╲
  │          │  ╲── article_tags ──> tags      (N:M)
  └──< comments >──┘
```

| Modelo | Campos principales |
|---|---|
| **User** | email (único), username (único), hashed_password, full_name, bio, `role` (user/editor/admin), is_active |
| **Category** *(modelo aparte)* | name (único), slug (único), description |
| **Tag** | name, slug (únicos) — relación N:M con artículos |
| **Article** | title, slug (único), summary, content, cover_image_url, `status`, rejection_reason, views_count, published_at, author_id, category_id |
| **Comment** | content, article_id, author_id |

Todos (salvo Tag) incluyen `created_at` / `updated_at` mediante `TimestampMixin`.

**Decisiones de BD:** claves foráneas con `ondelete` explícito (`RESTRICT` para autor/categoría, `CASCADE` para comentarios y tags), índices en columnas de filtrado (slug, status, author_id, category_id y compuesto status+published_at), enums guardados como texto (`native_enum=False`) para facilitar migraciones en cualquier motor, y *naming convention* de constraints para migraciones reproducibles.

---

## 5. Roles y flujo de moderación

| Rol | Permisos |
|---|---|
| **user** | Escribir artículos, subir portada, comentar, editar/borrar lo propio |
| **editor** | Todo lo anterior + aprobar/rechazar artículos, editar/borrar cualquier artículo o comentario |
| **admin** | Todo lo anterior + CRUD de categorías + gestión de usuarios (rol / activar-desactivar) |

Los registros públicos siempre nacen como `user`; solo un admin puede promover.

**Estados del artículo:**

```
DRAFT ──submit──> PENDING ──approve──> PUBLISHED
  ▲                  │
  └──── submit ── REJECTED <──reject (con motivo obligatorio)
```

- Solo `PUBLISHED` es visible públicamente; los demás estados solo los ven el autor y los moderadores (el resto recibe 404, no 403, para no revelar su existencia).
- Si un **autor** edita un artículo publicado, vuelve a `PENDING` (los editores pueden editar sin perder la publicación).
- El **slug no cambia** al editar el título (se preservan las URLs/SEO). Si hay colisión se añade `-2`, `-3`…

---

## 6. Endpoints (prefijo `/api/v1`)

**Autenticación**
| Método | Ruta | Acceso |
|---|---|---|
| POST | `/auth/register` | Público |
| POST | `/auth/login` (email o username) | Público |
| POST | `/auth/refresh` | Público (refresh token) |

**Usuarios**
| GET `/users/me` · PATCH `/users/me` · POST `/users/me/change-password` | Autenticado |
|---|---|
| GET `/users/{username}` (perfil público) | Público |
| GET `/users` · PATCH `/users/{id}` | Admin |

**Categorías:** GET `/categories`, GET `/categories/{slug}` (público) · POST, PUT `/{id}`, DELETE `/{id}` (admin; no se puede borrar si tiene artículos → 409)

**Etiquetas:** GET `/tags` (populares con conteo)

**Artículos**
| Método | Ruta | Acceso |
|---|---|---|
| GET | `/articles` — filtros: `category`, `tag`, `author`, `q`, `sort` (newest/popular), `page`, `size` | Público |
| GET | `/articles/{slug}` (suma una vista) | Público / autor / moderador |
| POST | `/articles` (crea borrador) | Autenticado |
| GET | `/articles/me?status=` | Autenticado |
| PATCH / DELETE | `/articles/{id}` | Autor o moderador |
| POST | `/articles/{id}/submit` | Autor |
| POST | `/articles/{id}/cover` (multipart, imagen) | Autor o moderador |
| GET | `/articles/moderation/queue` | Editor / admin |
| POST | `/articles/{id}/review` `{action: approve\|reject, reason}` | Editor / admin |

**Comentarios:** GET/POST `/articles/{slug}/comments` · DELETE `/comments/{id}` (autor o moderador)

**Sistema:** GET `/health` (verifica conexión a BD) · archivos subidos en `/media/...`

Las listas devuelven `{items, total, page, size, pages}`.

---

## 7. Buenas prácticas aplicadas

**Seguridad**
- Contraseñas con **bcrypt** + pre-hash SHA-256 (evita el truncado de 72 bytes). Política mínima: 8+ caracteres con letra y número.
- **JWT** de acceso (30 min) y refresh (7 días) con claim `type`: un refresh no sirve como access y viceversa.
- Login con **mensaje genérico** y hash señuelo para igualar tiempos (no revela qué usuarios existen).
- La app **se niega a arrancar en producción** con `SECRET_KEY` por defecto o menor a 32 caracteres.
- Uploads: límite de tamaño, verificación del **contenido real** con Pillow (no se confía en extensión ni `Content-Type`), solo JPEG/PNG/WEBP, límite de píxeles (anti *decompression bomb*), nombre generado con UUID (anti path traversal), borrado de la portada anterior al reemplazar.
- Búsqueda con `LIKE` escapando `%` y `_`; consultas siempre parametrizadas por el ORM.
- Respuestas nunca exponen `hashed_password` ni emails en perfiles públicos (esquemas separados `UserPublic` / `UserRead`).
- Documentación `/docs` desactivada en producción; CORS configurable; contenedor Docker con usuario sin privilegios.

**Diseño y mantenibilidad**
- Capas (endpoint / servicio / modelo), excepciones de dominio, configuración por entorno (12-factor).
- Inyección de dependencias para sesión, usuario actual, roles y paginación (`Annotated[...]`).
- Esquemas distintos para crear / actualizar / leer; `PATCH` con `exclude_unset`.
- Migraciones con **Alembic** (no `create_all` en producción).
- Código con *type hints* de principio a fin.

**Rendimiento**
- Carga ansiosa (`joinedload` / `selectinload`) para evitar el problema **N+1** en listados.
- Paginación obligatoria con tope (`size ≤ 100`), índices en columnas de filtro, GZip para respuestas grandes.
- Contador de vistas con `UPDATE ... SET views = views + 1` atómico (sin condiciones de carrera).
- `pool_pre_ping` en el motor de BD.

**Operación**
- Middleware que registra cada request y devuelve `X-Process-Time-Ms`.
- Handler global de errores 500 (loguea el detalle, no lo expone al cliente).
- `Dockerfile` con healthcheck y `docker-compose` con PostgreSQL + volúmenes persistentes.

---

## 8. Tests

19 tests con **pytest** sobre SQLite en memoria (cada test usa una BD limpia, sobrescribiendo la dependencia `get_db`):

- `test_auth.py`: registro, login (email/username), duplicados, contraseña débil, refresh vs access, cambio de contraseña, gestión admin.
- `test_categories.py`: permisos CRUD, slugs, conflicto al borrar con artículos.
- `test_articles.py`: ciclo completo borrador→revisión→publicado, rechazo con motivo, permisos, validaciones, slug único, filtros/búsqueda/paginación, subida de portada (imagen falsa, formato no permitido, reemplazo), borrado.
- `test_comments.py`: flujo de comentarios, permisos, health check.

Ejecutar: `pytest` (tarda ~20 s por el coste intencional de bcrypt).

---

## 9. Problemas encontrados y cómo se resolvieron

1. **Contador de vistas duplicado:** el `UPDATE` ORM ya sincronizaba el objeto en memoria y yo lo incrementaba de nuevo → ahora se hace `db.refresh()` tras el commit.
2. **Email del admin rechazado:** `email-validator` no acepta dominios reservados como `.local` → el valor por defecto pasó a `admin@example.com`.

---

## 10. Limitaciones y siguientes pasos recomendados

- **Rate limiting** (p. ej. `slowapi` o en el proxy/API gateway) para login y registro.
- **Revocación de tokens** (lista negra en Redis) y verificación de email / recuperación de contraseña.
- **Almacenamiento de imágenes** en S3/GCS + CDN (hoy es disco local; `storage_service.py` es el único punto a cambiar). Con varios workers/servidores, el disco debe compartirse.
- **Búsqueda full-text** (PostgreSQL `tsvector` o Meilisearch/Elasticsearch) en lugar de `ILIKE`.
- **Versión async** (SQLAlchemy async + asyncpg) si se espera mucha concurrencia.
- Métricas/observabilidad (Prometheus, Sentry), CI (GitHub Actions: lint + tests) y linters (ruff, mypy).
- Regla opcional: impedir que un editor apruebe sus propios artículos.
