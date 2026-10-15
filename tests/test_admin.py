BASE = "/api/v1"


def _admin_article_payload(category_id: int, title: str = "Nota publicada por el admin"):
    return {
        "title": title,
        "summary": "Resumen de la nota creada desde el panel de administración.",
        "content": "Contenido extenso de la nota del panel. " * 5,
        "category_id": category_id,
        "tags": ["panel", "admin"],
        "status": "published",
    }


def test_admin_stats_requires_admin(client, user_headers, admin_headers, category):
    assert client.get(f"{BASE}/admin/stats").status_code == 401
    assert client.get(f"{BASE}/admin/stats", headers=user_headers).status_code == 403
    r = client.get(f"{BASE}/admin/stats", headers=admin_headers)
    assert r.status_code == 200
    body = r.json()
    assert body["users"] == 2
    assert body["articles_total"] == 0
    assert body["categories"] == 1


def test_admin_creates_published_article(client, admin_headers, category):
    payload = _admin_article_payload(category.id)
    r = client.post(f"{BASE}/admin/articles", json=payload, headers=admin_headers)
    assert r.status_code == 201, r.text
    body = r.json()
    assert body["status"] == "published"
    assert body["published_at"] is not None
    assert body["author"]["username"] == "root"

    # Aparece en el listado público porque ya está publicado.
    public = client.get(f"{BASE}/articles").json()
    assert public["total"] == 1


def test_admin_create_requires_admin(client, user_headers, category):
    payload = _admin_article_payload(category.id)
    assert client.post(f"{BASE}/admin/articles", json=payload, headers=user_headers).status_code == 403


def test_admin_lists_all_states(client, user_headers, editor_headers, admin_headers, article_payload):
    # Un usuario crea un borrador.
    client.post(f"{BASE}/articles", json=article_payload, headers=user_headers)
    listing = client.get(f"{BASE}/admin/articles", headers=admin_headers).json()
    assert listing["total"] == 1
    assert listing["items"][0]["status"] == "draft"

    drafts = client.get(f"{BASE}/admin/articles?status=draft", headers=admin_headers).json()
    assert drafts["total"] == 1
    published = client.get(f"{BASE}/admin/articles?status=published", headers=admin_headers).json()
    assert published["total"] == 0


def test_admin_updates_any_article_and_status(client, user_headers, admin_headers, article_payload):
    created = client.post(f"{BASE}/articles", json=article_payload, headers=user_headers).json()
    aid = created["id"]

    r = client.patch(
        f"{BASE}/admin/articles/{aid}",
        json={"title": "Título corregido por admin", "status": "published"},
        headers=admin_headers,
    )
    assert r.status_code == 200, r.text
    assert r.json()["title"] == "Título corregido por admin"
    assert r.json()["status"] == "published"
    assert r.json()["published_at"] is not None


def test_admin_deletes_any_article(client, user_headers, admin_headers, article_payload):
    created = client.post(f"{BASE}/articles", json=article_payload, headers=user_headers).json()
    aid = created["id"]
    assert (
        client.delete(f"{BASE}/admin/articles/{aid}", headers=admin_headers).status_code == 204
    )
    assert client.get(f"{BASE}/admin/articles", headers=admin_headers).json()["total"] == 0
