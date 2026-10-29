import enum
from datetime import datetime
from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class TicketStatus(str, enum.Enum):
    OPEN = "Aberto"
    IN_PROGRESS = "Em atendimento"
    WAITING_USER = "Aguardando usuário"
    RESOLVED = "Resolvido"
    CLOSED = "Fechado"


class Ticket(Base):
    __tablename__ = "tickets"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    protocol: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(180))
    description: Mapped[str] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(80))
    sector: Mapped[str] = mapped_column(String(120))
    status: Mapped[TicketStatus] = mapped_column(Enum(TicketStatus), default=TicketStatus.OPEN)
    priority: Mapped[str] = mapped_column(String(24), default="Normal")
    assignee: Mapped[str] = mapped_column(String(120), default="Não atribuído")
    attachment: Mapped[str | None] = mapped_column(String(255), nullable=True)
    resolution: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    messages: Mapped[list["Message"]] = relationship(
        back_populates="ticket", cascade="all, delete-orphan", lazy="selectin", order_by="Message.created_at"
    )

    @property
    def protocolo(self) -> str:
        return self.protocol

    @property
    def setor(self) -> str:
        return self.sector

    @property
    def created(self) -> str:
        return self.created_at.astimezone().strftime("%d/%m/%Y %H:%M") if self.created_at else "Agora"


class Message(Base):
    __tablename__ = "messages"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ticket_id: Mapped[int] = mapped_column(ForeignKey("tickets.id", ondelete="CASCADE"), index=True)
    author: Mapped[str] = mapped_column(String(120))
    text: Mapped[str] = mapped_column(Text)
    internal: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    ticket: Mapped[Ticket] = relationship(back_populates="messages")

    @property
    def at(self) -> str:
        return self.created_at.astimezone().strftime("%d/%m %H:%M") if self.created_at else "Agora"
