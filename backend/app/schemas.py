from pydantic import BaseModel, ConfigDict, Field
from .models import TicketStatus


class MessageCreate(BaseModel):
    author: str = Field(min_length=2, max_length=120)
    text: str = Field(min_length=1, max_length=10000)
    internal: bool = False


class MessageRead(MessageCreate):
    id: int
    at: str
    model_config = ConfigDict(from_attributes=True)


class TicketCreate(BaseModel):
    title: str = Field(min_length=5, max_length=180)
    description: str = Field(min_length=10, max_length=10000)
    category: str = Field(min_length=2, max_length=80)
    setor: str = Field(min_length=2, max_length=120)
    attachment: str | None = Field(default=None, max_length=255)


class TicketUpdate(BaseModel):
    status: TicketStatus | None = None
    priority: str | None = Field(default=None, max_length=24)
    assignee: str | None = Field(default=None, max_length=120)
    resolution: str | None = Field(default=None, max_length=10000)


class TicketRead(TicketCreate):
    id: int
    protocolo: str
    status: TicketStatus
    priority: str
    assignee: str
    resolution: str | None
    created: str
    messages: list[MessageRead] = []
    model_config = ConfigDict(from_attributes=True)
