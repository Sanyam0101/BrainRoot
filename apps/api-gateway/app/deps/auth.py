from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import asyncpg
import uuid
from app.deps.database import get_db_connection
from app.services.auth import AuthService
from app.schemas.auth import UserResponse, TokenData

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    conn: asyncpg.Connection = Depends(get_db_connection)
) -> UserResponse:
    """
    Dependency to get current authenticated user from JWT token
    """
    token = credentials.credentials
    
    # Verify token
    token_data = AuthService.verify_token(token, token_type="access")
    
    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user from database
    user = await AuthService.get_user_by_id(conn, token_data.user_id)
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user

async def get_optional_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    conn: asyncpg.Connection = Depends(get_db_connection)
) -> UserResponse | None:
    """
    Optional authentication - returns None if no valid token
    """
    try:
        return await get_current_user(credentials, conn)
    except HTTPException:
        return None

