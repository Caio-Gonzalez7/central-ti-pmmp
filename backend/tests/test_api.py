import os

os.environ["APP_ENV"] = "test"
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./test_central_ti.db"

from fastapi.testclient import TestClient
from app.main import app


def test_ticket_lifecycle() -> None:
    with TestClient(app) as client:
        health = client.get("/health")
        assert health.status_code == 200
        assert health.json()["status"] == "ok"

        created = client.post(
            "/api/v1/tickets",
            json={
                "title": "Impressora não imprime",
                "description": "A impressora da recepção aparece como offline.",
                "category": "Impressora",
                "setor": "Secretaria de Administração",
            },
        )
        assert created.status_code == 201, created.text
        ticket = created.json()
        assert ticket["protocolo"].startswith("TI-")
        assert ticket["status"] == "Aberto"

        updated = client.patch(
            f"/api/v1/tickets/{ticket['id']}",
            json={"assignee": "Mariana Costa", "status": "Em atendimento"},
        )
        assert updated.status_code == 200
        assert updated.json()["assignee"] == "Mariana Costa"

        message = client.post(
            f"/api/v1/tickets/{ticket['id']}/messages",
            json={
                "author": "Mariana Costa · TI",
                "text": "Atendimento iniciado.",
                "internal": False,
            },
        )
        assert message.status_code == 201

        resolved = client.patch(
            f"/api/v1/tickets/{ticket['id']}",
            json={
                "status": "Resolvido",
                "resolution": "Cabo reconectado e impressão validada.",
            },
        )
        assert resolved.status_code == 200
        assert resolved.json()["status"] == "Resolvido"
        assert resolved.json()["resolution"]
