from tests.conftest import PASSWORD

BASE = "/api/v1"


def test_register_and_login(client):
    r = client.post(f"{BASE}/auth/register", json={
        "email": "New@Test.com", "username": "newuser", "password": PASSWORD})
    assert r.status_code == 201
    body = r.json()
    assert body["email"] == "new@test.com" and body["role"] == "user"
    assert "hashed_password" not in body

    # login por username y por email
    for ident in ("newuser", "new@test.com"):
        r = client.post(f"{BASE}/auth/login", data={"username": ident, "password": PASSWORD})
        assert r.status_code == 200
        assert {"access_token", "refresh_token"} <= r.json().keys()


def test_register_duplicates_and_weak_password(client, user_headers):
    r = client.post(f"{BASE}/auth/register", json={
        "email": "alice@test.com", "username": "other", "password": PASSWORD})
    assert r.status_code == 409
    r = client.post(f"{BASE}/auth/register", json={
        "email": "x@test.com", "username": "xx_user", "password": "onlyletters"})
    assert r.status_code == 422


def test_wrong_password_and_unknown_user(client, user_headers):
    assert client.post(f"{BASE}/auth/login", data={"username": "alice", "password": "bad"}).status_code == 401
    assert client.post(f"{BASE}/auth/login", data={"username": "ghost", "password": PASSWORD}).status_code == 401


def test_me_requires_token_and_refresh_flow(client, user_headers):
    assert client.get(f"{BASE}/users/me").status_code == 401
    assert client.get(f"{BASE}/users/me", headers=user_headers).json()["username"] == "alice"

    tokens = client.post(f"{BASE}/auth/login", data={"username": "alice", "password": PASSWORD}).json()
    r = client.post(f"{BASE}/auth/refresh", json={"refresh_token": tokens["refresh_token"]})
    assert r.status_code == 200
    # un access token NO sirve como refresh
    r = client.post(f"{BASE}/auth/refresh", json={"refresh_token": tokens["access_token"]})
    assert r.status_code == 401
    # un refresh token NO sirve para acceder a recursos
    r = client.get(f"{BASE}/users/me", headers={"Authorization": f"Bearer {tokens['refresh_token']}"})
    assert r.status_code == 401


def test_change_password(client, user_headers):
    r = client.post(f"{BASE}/users/me/change-password", headers=user_headers,
                    json={"current_password": PASSWORD, "new_password": "NewPass456"})
    assert r.status_code == 200
    assert client.post(f"{BASE}/auth/login", data={"username": "alice", "password": "NewPass456"}).status_code == 200


def test_admin_user_management(client, user_headers, admin_headers):
    assert client.get(f"{BASE}/users", headers=user_headers).status_code == 403
    users = client.get(f"{BASE}/users", headers=admin_headers).json()
    alice = next(u for u in users["items"] if u["username"] == "alice")
    r = client.patch(f"{BASE}/users/{alice['id']}", headers=admin_headers, json={"role": "editor"})
    assert r.status_code == 200 and r.json()["role"] == "editor"
    # admin no puede degradarse a sí mismo
    root = next(u for u in users["items"] if u["username"] == "root")
    assert client.patch(f"{BASE}/users/{root['id']}", headers=admin_headers, json={"role": "user"}).status_code == 400
