import asyncpg
from neo4j import AsyncSession
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any
from app.schemas.graphrag import GraphRAGRequest, GraphRAGResponse, VectorResult, GraphNode, GraphEdge

# Load embedding model
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

class GraphRAGService:
    @staticmethod
    async def hybrid_search(
        pg_conn: asyncpg.Connection,
        neo4j_session: AsyncSession, 
        request: GraphRAGRequest,
        user_id: str
    ) -> GraphRAGResponse:
        
        # Step 1: Vector search for relevant notes
        vector_results = await GraphRAGService._vector_search(
            pg_conn, request.query, user_id, request.top_k
        )
        
        # Step 2: Extract note IDs for graph expansion  
        note_ids = [result.id for result in vector_results]
        
        # Step 3: Graph expansion - find related Ideas
        graph_nodes, graph_edges = await GraphRAGService._graph_expansion(
            neo4j_session, note_ids, request.graph_depth
        )
        
        # Step 4: Compile response
        return GraphRAGResponse(
            query=request.query,
            vector_results=vector_results,
            graph_nodes=graph_nodes,
            graph_edges=graph_edges,
            total_context_items=len(vector_results) + len(graph_nodes),
            search_summary={
                "vector_matches": len(vector_results),
                "graph_nodes": len(graph_nodes),
                "graph_edges": len(graph_edges),
                "search_depth": request.graph_depth
            }
        )
    
    @staticmethod
    async def _vector_search(
        conn: asyncpg.Connection, query: str, user_id: str, top_k: int
    ) -> List[VectorResult]:
        # Generate query embedding
        query_embedding = embedding_model.encode(query)
        embedding_str = '[' + ','.join(map(str, query_embedding.tolist())) + ']'
        
        # Search with cosine distance
        search_query = '''
            SELECT id, user_id, content, tags, created_at,
                   1 - (embedding <=> $1) as similarity_score
            FROM notes 
            WHERE user_id = $2
            ORDER BY embedding <=> $1
            LIMIT $3
        '''
        rows = await conn.fetch(search_query, embedding_str, user_id, top_k)
        
        return [
            VectorResult(
                id=str(row['id']),
                user_id=str(row['user_id']),
                content=row['content'],
                tags=row['tags'],
                created_at=row['created_at'],
                similarity_score=float(row['similarity_score'])
            )
            for row in rows
        ]
    
    @staticmethod 
    async def _graph_expansion(
        session: AsyncSession, note_ids: List[str], depth: int
    ) -> tuple[List[GraphNode], List[GraphEdge]]:
        if not note_ids:
            return [], []
            
        # Use UNWIND to batch process note IDs efficiently
        expansion_query = f'''
        UNWIND $note_ids AS note_id
        OPTIONAL MATCH (idea:Idea {{id: note_id}})
        OPTIONAL MATCH (idea)-[rel*1..{depth}]-(connected)
        WITH collect(DISTINCT idea) + collect(DISTINCT connected) AS all_nodes,
             collect(DISTINCT rel) AS all_rels
        UNWIND all_nodes AS node
        WITH collect(DISTINCT {{
            id: coalesce(node.id, ''), 
            labels: labels(node), 
            properties: properties(node)
        }}) AS nodes, all_rels
        UNWIND all_rels AS rel_list
        UNWIND rel_list AS rel
        RETURN nodes, 
               collect(DISTINCT {{
                   source: startNode(rel).id,
                   target: endNode(rel).id, 
                   relationship: type(rel),
                   properties: properties(rel)
               }}) AS edges
        '''
        
        try:
            result = await session.run(expansion_query, note_ids=note_ids)
            record = await result.single()
            
            nodes = []
            edges = []
            
            if record and record['nodes']:
                for node_data in record['nodes']:
                    if node_data['id']:  # Skip empty nodes
                        nodes.append(GraphNode(
                            id=node_data['id'],
                            labels=node_data['labels'],
                            properties=node_data['properties']
                        ))
            
            if record and record['edges']:
                for edge_data in record['edges']:
                    if edge_data['source'] and edge_data['target']:  # Skip empty edges
                        edges.append(GraphEdge(
                            source=edge_data['source'],
                            target=edge_data['target'],
                            relationship=edge_data['relationship'],
                            properties=edge_data['properties']
                        ))
                        
            return nodes, edges
            
        except Exception as e:
            # Fallback: return empty results if graph expansion fails
            print(f"Graph expansion failed: {e}")
            return [], []
