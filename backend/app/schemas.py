from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from .models import TicketStatus


class TicketCreate(BaseModel):
    title: str = Field(min_length=5, max_length=180)
    description: str = Field(min_length=10, max_length=10000)
    category: str = Field(min_length=2, max_length=80)
    sector: str = Field(min_length=2, max_length=120)


class TicketRead(TicketCreate):
    id: int
    protocol: str
    status: TicketStatus
    priority: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
