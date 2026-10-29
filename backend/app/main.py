from contextlib import asynccontextmanager
from datetime import datetime, timezone
from fastapi import Depends, FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from .config import get_settings
from .database import engine, get_session
from .models import Base, Ticket
from .schemas import TicketCreate, TicketRead

settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI):
    if settings.app_env == "development":
        async with engine.begin() as connection:
            await connection.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(title="Central de TI — PMMP API", version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["system"])
async def health() -> dict[str, str]:
    return {"status": "ok", "environment": settings.app_env}


@app.get("/api/v1/tickets", response_model=list[TicketRead], tags=["tickets"])
async def list_tickets(session: AsyncSession = Depends(get_session)) -> list[Ticket]:
    result = await session.scalars(select(Ticket).order_by(Ticket.created_at.desc()))
    return list(result)


@app.post("/api/v1/tickets", response_model=TicketRead, status_code=status.HTTP_201_CREATED, tags=["tickets"])
async def create_ticket(payload: TicketCreate, session: AsyncSession = Depends(get_session)) -> Ticket:
    ticket = Ticket(protocol="pending", **payload.model_dump())
    session.add(ticket)
    await session.flush()
    year = datetime.now(timezone.utc).year
    ticket.protocol = f"TI-{year}-{ticket.id:06d}"
    await session.commit()
    await session.refresh(ticket)
    return ticket
