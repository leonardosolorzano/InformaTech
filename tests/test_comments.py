from tests.test_articles import _publish

BASE = "/api/v1"


def test_comments_flow(client, user_headers, other_headers, editor_headers, article_payload):
    art = _publish(client, article_payload, user_headers, editor_headers)
    url = f"{BASE}/articles/{art['slug']}/comments"

    assert client.post(url, json={"content": "hola"}).status_code == 401
    r = client.post(url, json={"content": "Gran artículo"}, headers=other_headers)
    assert r.status_code == 201 and r.json()["author"]["username"] == "bob"
    assert client.post(url, json={"content": ""}, headers=other_headers).status_code == 422

    listing = client.get(url).json()
    assert listing["total"] == 1
    cid = listing["items"][0]["id"]

    assert client.delete(f"{BASE}/comments/{cid}", headers=user_headers).status_code == 403  # no es su comentario
    assert client.delete(f"{BASE}/comments/{cid}", headers=editor_headers).status_code == 204  # moderador sí
    assert client.get(url).json()["total"] == 0


def test_cannot_comment_on_unpublished(client, user_headers, other_headers, article_payload):
    art = client.post(f"{BASE}/articles", json=article_payload, headers=user_headers).json()
    r = client.post(f"{BASE}/articles/{art['slug']}/comments", json={"content": "hola"}, headers=other_headers)
    assert r.status_code == 404


def test_health(client):
    assert client.get("/health").json()["status"] == "ok"
