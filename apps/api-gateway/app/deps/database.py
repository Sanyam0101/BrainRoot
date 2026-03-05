import asyncpg
from neo4j import AsyncGraphDatabase
from app.core.config import settings

# Global pools
db_pool = None
neo4j_driver = None

async def get_db_connection():
    global db_pool
    if db_pool is None:
        db_pool = await asyncpg.create_pool(settings.db_url)
    
    async with db_pool.acquire() as conn:
        yield conn

async def get_neo4j_session():
    global neo4j_driver
    if neo4j_driver is None:
        neo4j_driver = AsyncGraphDatabase.driver(
            settings.neo4j_url,
            auth=(settings.neo4j_user, settings.neo4j_password)
        )
    
    async with neo4j_driver.session() as session:
        yield session
