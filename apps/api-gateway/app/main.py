from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.auth import router as auth_router
from app.api.v1.notes import router as notes_router
from app.api.v1.graph import router as graph_router
from app.api.v1.graphrag import router as graphrag_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.integrations import router as integrations_router
from app.api.v1.analyst import router as analyst_router
from app.middleware.security import SecurityMiddleware

app = FastAPI(title="Second Brain API", version="1.0.0")

# Security middleware (rate limiting, security headers)
app.add_middleware(SecurityMiddleware)

# CORS middleware — allow all origins so Vercel frontend can connect.
# For production hardening, set FRONTEND_URL env var and restrict this.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api/v1")
app.include_router(notes_router, prefix="/api/v1")
app.include_router(graph_router, prefix="/api/v1") 
app.include_router(graphrag_router, prefix="/api/v1")
app.include_router(analytics_router, prefix="/api/v1")
app.include_router(integrations_router, prefix="/api/v1")
app.include_router(analyst_router, prefix="/api/v1")

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/")
async def root():
    return {"message": "Second Brain API with GraphRAG and Analytics is running"}
