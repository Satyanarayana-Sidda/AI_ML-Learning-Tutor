"""
Sample unit test — demonstrates the pattern for testing services in
isolation. Add pytest + pytest-asyncio to your dev workflow and grow this
directory as you add services (this is a real interview question: "how
did you test this?").
"""
from app.core.security import hash_password, verify_password, create_access_token, decode_token


def test_password_hash_roundtrip():
    hashed = hash_password("supersecret123")
    assert hashed != "supersecret123"
    assert verify_password("supersecret123", hashed) is True
    assert verify_password("wrongpassword", hashed) is False


def test_access_token_roundtrip():
    token = create_access_token(subject="user-123")
    payload = decode_token(token)
    assert payload is not None
    assert payload["sub"] == "user-123"
    assert payload["type"] == "access"


def test_decode_invalid_token_returns_none():
    assert decode_token("not.a.valid.token") is None
