import asyncio
import asyncpg
from neo4j import AsyncGraphDatabase
import os

async def backfill():
    db_url = os.getenv('DB_URL', 'postgresql://sb:sbpass@127.0.0.1:5432/sbdb')
    neo4j_url = os.getenv('NEO4J_URL', 'bolt://127.0.0.1:7687')
    neo4j_user = os.getenv('NEO4J_USER', 'neo4j')
    neo4j_pass = os.getenv('NEO4J_PASSWORD', 'sbneo4jpass')

    print("Connecting to pg...")
    conn = await asyncpg.connect(db_url)
    
    print("Connecting to neo4j...")
    driver = AsyncGraphDatabase.driver(neo4j_url, auth=(neo4j_user, neo4j_pass))
    
    notes = await conn.fetch("SELECT id, user_id FROM notes")
    print(f"Found {len(notes)} notes in Postgres.")
    
    updates = 0
    async with driver.session() as session:
        for note in notes:
            note_id = str(note['id'])
            user_id = str(note['user_id'])
            res = await session.run("MATCH (i:Idea {id: $id}) SET i.user_id = $uid RETURN i.id", id=note_id, uid=user_id)
            if await res.single():
                updates += 1
                
    await conn.close()
    await driver.close()
    print(f"Backfill complete! Updated {updates} Neo4j nodes.")

if __name__ == '__main__':
    asyncio.run(backfill())
