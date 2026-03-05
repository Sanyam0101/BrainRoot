from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class IntegrationConnect(BaseModel):
    platform: str
    access_token: str

class IntegrationResponse(BaseModel):
    id: str
    platform: str
    last_synced: Optional[datetime] = None
    connected: bool = True
