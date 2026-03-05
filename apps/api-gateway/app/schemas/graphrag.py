from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class GraphRAGRequest(BaseModel):
    query: str
    top_k: int = 5
    graph_depth: int = 2
    include_similarity: bool = True

class VectorResult(BaseModel):
    id: str
    user_id: str
    content: str
    tags: List[str]
    created_at: datetime
    similarity_score: Optional[float] = None

class GraphNode(BaseModel):
    id: str
    labels: List[str]
    properties: Dict[str, Any]

class GraphEdge(BaseModel):
    source: str
    target: str
    relationship: str
    properties: Dict[str, Any] = {}

class GraphRAGResponse(BaseModel):
    query: str
    vector_results: List[VectorResult]
    graph_nodes: List[GraphNode]  
    graph_edges: List[GraphEdge]
    total_context_items: int
    search_summary: Dict[str, Any]
