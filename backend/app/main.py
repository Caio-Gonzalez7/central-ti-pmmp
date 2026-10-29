from contextlib import asynccontextmanager
from datetime import datetime, timezone
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from .config import get_settings
from .database import engine, get_session
from .models import Base, Message, Ticket
from .schemas import MessageCreate, MessageRead, TicketCreate, TicketRead, TicketUpdate

settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI):
    if settings.app_env in {"development", "test"}:
        async with engine.begin() as connection:
            await connection.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(
    title="Central de TI — PMMP API",
    description="API do piloto local. Não utilizar com dados sensíveis antes da homologação.",
    version="0.2.0",
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def find_ticket(ticket_id: int, session: AsyncSession) -> Ticket:
    ticket = await session.scalar(
        select(Ticket)
        .options(selectinload(Ticket.messages))
        .where(Ticket.id == ticket_id)
    )
    if not ticket:
        raise HTTPException(status_code=404, detail="Chamado não encontrado")
    return ticket


@app.get("/health", tags=["system"])
async def health() -> dict[str, str]:
    return {"status": "ok", "environment": settings.app_env, "version": app.version}


@app.get("/api/v1/tickets", response_model=list[TicketRead], tags=["tickets"])
async def list_tickets(session: AsyncSession = Depends(get_session)) -> list[Ticket]:
    result = await session.scalars(select(Ticket).order_by(Ticket.created_at.desc()))
    return list(result.unique())


@app.post("/api/v1/tickets", response_model=TicketRead, status_code=status.HTTP_201_CREATED, tags=["tickets"])
async def create_ticket(payload: TicketCreate, session: AsyncSession = Depends(get_session)) -> Ticket:
    data = payload.model_dump()
    ticket = Ticket(protocol="pending", sector=data.pop("setor"), **data)
    session.add(ticket)
    await session.flush()
    year = datetime.now(timezone.utc).year
    ticket.protocol = f"TI-{year}-{ticket.id:06d}"
    await session.commit()
    return await find_ticket(ticket.id, session)


@app.patch("/api/v1/tickets/{ticket_id}", response_model=TicketRead, tags=["tickets"])
async def update_ticket(ticket_id: int, payload: TicketUpdate, session: AsyncSession = Depends(get_session)) -> Ticket:
    ticket = await find_ticket(ticket_id, session)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(ticket, field, value)
    await session.commit()
    await session.refresh(ticket)
    return ticket


@app.post(
    "/api/v1/tickets/{ticket_id}/messages",
    response_model=MessageRead,
    status_code=status.HTTP_201_CREATED,
    tags=["tickets"],
)
async def add_message(
    ticket_id: int, payload: MessageCreate, session: AsyncSession = Depends(get_session)
) -> Message:
    ticket = await find_ticket(ticket_id, session)
    message = Message(ticket=ticket, **payload.model_dump())
    session.add(message)
    await session.commit()
    await session.refresh(message)
    return message
