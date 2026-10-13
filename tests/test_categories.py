BASE = "/api/v1"


def test_category_crud_permissions(client, user_headers, admin_headers):
    payload = {"name": "Ciberseguridad", "description": "Seguridad informática"}
    assert client.post(f"{BASE}/categories", json=payload).status_code == 401
    assert client.post(f"{BASE}/categories", json=payload, headers=user_headers).status_code == 403

    r = client.post(f"{BASE}/categories", json=payload, headers=admin_headers)
    assert r.status_code == 201 and r.json()["slug"] == "ciberseguridad"
    cid = r.json()["id"]

    assert client.post(f"{BASE}/categories", json=payload, headers=admin_headers).status_code == 409
    assert [c["slug"] for c in client.get(f"{BASE}/categories").json()] == ["ciberseguridad"]
    assert client.get(f"{BASE}/categories/ciberseguridad").status_code == 200

    r = client.put(f"{BASE}/categories/{cid}", json={"name": "Seguridad"}, headers=admin_headers)
    assert r.json()["slug"] == "seguridad"
    assert client.delete(f"{BASE}/categories/{cid}", headers=admin_headers).status_code == 204
    assert client.get(f"{BASE}/categories/seguridad").status_code == 404


def test_cannot_delete_category_with_articles(client, user_headers, admin_headers, article_payload):
    client.post(f"{BASE}/articles", json=article_payload, headers=user_headers)
    r = client.delete(f"{BASE}/categories/{article_payload['category_id']}", headers=admin_headers)
    assert r.status_code == 409
