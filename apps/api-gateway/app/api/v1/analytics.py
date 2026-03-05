from fastapi import APIRouter, Depends, HTTPException
from app.deps.database import get_db_connection, get_neo4j_session
from app.deps.auth import get_current_user
from app.schemas.auth import UserResponse
from app.services.analytics import AnalyticsService
from app.schemas.analytics import AnalyticsResponse

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/overview", response_model=AnalyticsResponse)
async def get_analytics_overview(
    current_user: UserResponse = Depends(get_current_user),
    pg_conn = Depends(get_db_connection),
    neo4j_session = Depends(get_neo4j_session)
):
    """
    Get comprehensive system analytics overview
    
    Returns:
    - System statistics (notes, ideas, connections counts)
    - Activity metrics (recent activity)
    - Tag analytics (most used tags) 
    - Database health status
    """
    try:
        return await AnalyticsService.get_system_overview(pg_conn, neo4j_session, current_user.id)
        
    except Exception as e:
        raise HTTPException(500, f"Analytics query failed: {e}")

@router.get("/stats")
async def get_quick_stats(
    current_user: UserResponse = Depends(get_current_user),
    pg_conn = Depends(get_db_connection),
    neo4j_session = Depends(get_neo4j_session)
):
    """Quick stats endpoint for lightweight monitoring"""
    try:
        notes_count = await pg_conn.fetchval("SELECT COUNT(*) FROM notes WHERE user_id = $1", current_user.id)
        
        ideas_result = await neo4j_session.run("MATCH (i:Idea {user_id: $uid}) RETURN count(i) as count", uid=str(current_user.id))
        ideas_record = await ideas_result.single()
        ideas_count = ideas_record['count'] if ideas_record else 0
        
        return {
            "status": "ok",
            "notes": notes_count or 0,
            "ideas": ideas_count,
            "timestamp": "2025-09-11T16:00:00Z"
        }
        
    except Exception as e:
        raise HTTPException(500, f"Stats query failed: {e}")

@router.get("/health")
async def analytics_health():
    """Analytics service health check"""
    return {
        "status": "ok",
        "service": "Analytics",
        "capabilities": ["system_stats", "activity_metrics", "tag_analytics", "database_health"]
    }
