from pydantic import BaseModel

class IdeaCreate(BaseModel):
    id: str
    title: str

class TagAdd(BaseModel):
    idea_id: str
    tag: str

class LinkIdeas(BaseModel):
    src_id: str
    dst_id: str
