import io

from PIL import Image

BASE = "/api/v1"


def _publish(client, payload, author_h, editor_h) -> dict:
    art = client.post(f"{BASE}/articles", json=payload, headers=author_h).json()
    assert client.post(f"{BASE}/articles/{art['id']}/submit", headers=author_h).status_code == 200
    r = client.post(f"{BASE}/articles/{art['id']}/review", json={"action": "approve"}, headers=editor_h)
    assert r.status_code == 200
    return r.json()


def test_full_lifecycle(client, user_headers, editor_headers, article_payload):
    # crear -> borrador, tags normalizados y sin duplicados
    r = client.post(f"{BASE}/articles", json=article_payload, headers=user_headers)
    assert r.status_code == 201
    art = r.json()
    assert art["status"] == "draft" and art["slug"] == "openai-lanza-un-nuevo-modelo"
    assert sorted(t["slug"] for t in art["tags"]) == ["ia", "openai"]
    assert art["author"]["username"] == "alice"

    # el borrador NO es público
    assert client.get(f"{BASE}/articles").json()["total"] == 0
    assert client.get(f"{BASE}/articles/{art['slug']}").status_code == 404
    # pero el autor sí lo ve
    assert client.get(f"{BASE}/articles/{art['slug']}", headers=user_headers).status_code == 200

    # enviar a revisión y aprobar
    assert client.post(f"{BASE}/articles/{art['id']}/submit", headers=user_headers).json()["status"] == "pending"
    queue = client.get(f"{BASE}/articles/moderation/queue", headers=editor_headers).json()
    assert queue["total"] == 1
    r = client.post(f"{BASE}/articles/{art['id']}/review", json={"action": "approve"}, headers=editor_headers)
    assert r.json()["status"] == "published" and r.json()["published_at"]

    # ahora es público y cuenta vistas
    assert client.get(f"{BASE}/articles").json()["total"] == 1
    assert client.get(f"{BASE}/articles/{art['slug']}").json()["views_count"] == 1
    assert client.get(f"{BASE}/articles/{art['slug']}").json()["views_count"] == 2


def test_reject_requires_reason_and_resubmit(client, user_headers, editor_headers, article_payload):
    art = client.post(f"{BASE}/articles", json=article_payload, headers=user_headers).json()
    client.post(f"{BASE}/articles/{art['id']}/submit", headers=user_headers)
    assert client.post(f"{BASE}/articles/{art['id']}/review", json={"action": "reject"},
                       headers=editor_headers).status_code == 400
    r = client.post(f"{BASE}/articles/{art['id']}/review",
                    json={"action": "reject", "reason": "Falta fuente"}, headers=editor_headers)
    assert r.json()["status"] == "rejected" and r.json()["rejection_reason"] == "Falta fuente"
    r = client.post(f"{BASE}/articles/{art['id']}/submit", headers=user_headers)
    assert r.json()["status"] == "pending" and r.json()["rejection_reason"] is None


def test_permissions(client, user_headers, other_headers, editor_headers, article_payload):
    art = client.post(f"{BASE}/articles", json=article_payload, headers=user_headers).json()
    assert client.post(f"{BASE}/articles", json=article_payload).status_code == 401
    # otro usuario no puede editar, borrar, enviar ni moderar
    assert client.patch(f"{BASE}/articles/{art['id']}", json={"title": "Hackeado!!"}, headers=other_headers).status_code == 403
    assert client.delete(f"{BASE}/articles/{art['id']}", headers=other_headers).status_code == 403
    assert client.post(f"{BASE}/articles/{art['id']}/submit", headers=other_headers).status_code == 403
    assert client.post(f"{BASE}/articles/{art['id']}/review", json={"action": "approve"}, headers=other_headers).status_code == 403
    assert client.get(f"{BASE}/articles/moderation/queue", headers=other_headers).status_code == 403
    # el editor sí puede editar
    assert client.patch(f"{BASE}/articles/{art['id']}", json={"title": "Titulo corregido"}, headers=editor_headers).status_code == 200


def test_invalid_category_and_validation(client, user_headers, article_payload):
    bad = {**article_payload, "category_id": 9999}
    assert client.post(f"{BASE}/articles", json=bad, headers=user_headers).status_code == 404
    short = {**article_payload, "title": "abc"}
    assert client.post(f"{BASE}/articles", json=short, headers=user_headers).status_code == 422


def test_edit_published_goes_back_to_pending_and_slug_unique(client, user_headers, editor_headers, article_payload):
    art = _publish(client, article_payload, user_headers, editor_headers)
    r = client.patch(f"{BASE}/articles/{art['id']}", json={"title": "Titulo nuevo del articulo"}, headers=user_headers)
    assert r.json()["status"] == "pending" and r.json()["slug"] == art["slug"]  # slug estable
    dup = client.post(f"{BASE}/articles", json=article_payload, headers=user_headers).json()
    assert dup["slug"] == "openai-lanza-un-nuevo-modelo-2"


def test_filters_search_pagination(client, user_headers, other_headers, editor_headers, admin_headers, article_payload):
    cat2 = client.post(f"{BASE}/categories", json={"name": "Hardware"}, headers=admin_headers).json()
    _publish(client, article_payload, user_headers, editor_headers)
    p2 = {**article_payload, "title": "Nueva GPU de NVIDIA", "category_id": cat2["id"], "tags": ["gpu"]}
    _publish(client, p2, other_headers, editor_headers)

    assert client.get(f"{BASE}/articles", params={"category": "hardware"}).json()["total"] == 1
    assert client.get(f"{BASE}/articles", params={"tag": "gpu"}).json()["items"][0]["title"] == "Nueva GPU de NVIDIA"
    assert client.get(f"{BASE}/articles", params={"author": "alice"}).json()["total"] == 1
    assert client.get(f"{BASE}/articles", params={"q": "nvidia"}).json()["total"] == 1
    assert client.get(f"{BASE}/articles", params={"q": "100%"}).json()["total"] == 0  # % escapado
    page = client.get(f"{BASE}/articles", params={"size": 1, "page": 2}).json()
    assert page["total"] == 2 and page["pages"] == 2 and len(page["items"]) == 1
    assert client.get(f"{BASE}/articles", params={"size": 500}).status_code == 422
    tags = client.get(f"{BASE}/tags").json()
    assert {t["slug"] for t in tags} == {"ia", "openai", "gpu"}
    # "mis artículos"
    assert client.get(f"{BASE}/articles/me", headers=user_headers).json()["total"] == 1


def _png(size=(10, 10), fmt="PNG") -> bytes:
    buf = io.BytesIO()
    Image.new("RGB", size, "red").save(buf, fmt)
    return buf.getvalue()


def test_cover_upload(client, user_headers, other_headers, article_payload):
    art = client.post(f"{BASE}/articles", json=article_payload, headers=user_headers).json()
    url = f"{BASE}/articles/{art['id']}/cover"

    r = client.post(url, files={"file": ("cover.png", _png(), "image/png")}, headers=user_headers)
    assert r.status_code == 200
    cover = r.json()["cover_image_url"]
    assert cover.startswith("/media/covers/") and cover.endswith(".png")
    assert client.get(cover).status_code == 200  # servido estáticamente

    # extensión mentirosa: el contenido manda
    r = client.post(url, files={"file": ("x.png", b"esto no es una imagen", "image/png")}, headers=user_headers)
    assert r.status_code == 400
    # otro usuario no puede
    assert client.post(url, files={"file": ("c.png", _png(), "image/png")}, headers=other_headers).status_code == 403
    # formato no permitido (GIF)
    assert client.post(url, files={"file": ("c.gif", _png(fmt="GIF"), "image/gif")}, headers=user_headers).status_code == 400
    # al reemplazar, la anterior se borra
    r = client.post(url, files={"file": ("c.jpg", _png(fmt="JPEG"), "image/jpeg")}, headers=user_headers)
    assert r.json()["cover_image_url"] != cover
    assert client.get(cover).status_code == 404


def test_delete_article(client, user_headers, article_payload):
    art = client.post(f"{BASE}/articles", json=article_payload, headers=user_headers).json()
    assert client.delete(f"{BASE}/articles/{art['id']}", headers=user_headers).status_code == 204
    assert client.get(f"{BASE}/articles/me", headers=user_headers).json()["total"] == 0
