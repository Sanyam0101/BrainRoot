from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

class SystemStats(BaseModel):
    total_notes: int
    total_ideas: int
    total_connections: int
    total_tags: int
    unique_users: int
    
class ActivityMetrics(BaseModel):
    recent_notes: int
    recent_ideas: int
    recent_searches: int
    last_activity: Optional[datetime]

class TagAnalytics(BaseModel):
    tag: str
    count: int
    percentage: float

class DatabaseHealth(BaseModel):
    postgres_status: str
    neo4j_status: str
    postgres_size: str
    neo4j_size: str
    
class AnalyticsResponse(BaseModel):
    timestamp: datetime
    system_stats: SystemStats
    activity_metrics: ActivityMetrics
    top_tags: List[TagAnalytics]
    database_health: DatabaseHealth
    
class SearchAnalytics(BaseModel):
    total_searches: int
    avg_results_returned: float
    popular_queries: List[Dict[str, Any]]
