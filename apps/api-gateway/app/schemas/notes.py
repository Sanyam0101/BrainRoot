from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid

class NoteCreate(BaseModel):
    content: str
    tags: List[str] = []

class NoteUpdate(BaseModel):
    content: Optional[str] = None
    tags: Optional[List[str]] = None

class NoteResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    content: str
    tags: List[str]
    created_at: datetime
    similarity_score: Optional[float] = None
