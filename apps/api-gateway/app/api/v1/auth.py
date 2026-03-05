from fastapi import APIRouter, Depends, HTTPException, status
import asyncpg
from app.deps.database import get_db_connection
from app.deps.auth import get_current_user
from app.schemas.auth import (
    UserRegister, UserLogin, TokenResponse, 
    UserResponse, RefreshTokenRequest, PasswordResetRequest
)
from app.services.auth import AuthService
from datetime import timedelta

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserRegister,
    conn: asyncpg.Connection = Depends(get_db_connection)
):
    """
    Register a new user
    """
    try:
        user = await AuthService.register_user(conn, user_data)
        return user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error registering user: {str(e)}"
        )

@router.post("/login", response_model=TokenResponse)
async def login(
    credentials: UserLogin,
    conn: asyncpg.Connection = Depends(get_db_connection)
):
    """
    Login user and return access + refresh tokens
    """
    user = await AuthService.authenticate_user(
        conn, credentials.email, credentials.password
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create tokens
    access_token_expires = timedelta(minutes=30)
    access_token = AuthService.create_access_token(
        data={"sub": str(user.id), "email": user.email},
        expires_delta=access_token_expires
    )
    
    refresh_token = AuthService.create_refresh_token(
        data={"sub": str(user.id), "email": user.email}
    )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    token_data: RefreshTokenRequest,
    conn: asyncpg.Connection = Depends(get_db_connection)
):
    """
    Refresh access token using refresh token
    """
    # Verify refresh token
    token_info = AuthService.verify_token(token_data.refresh_token, token_type="refresh")
    
    if not token_info:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user to ensure they still exist
    user = await AuthService.get_user_by_id(conn, token_info.user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create new access token
    access_token_expires = timedelta(minutes=30)
    access_token = AuthService.create_access_token(
        data={"sub": str(user.id), "email": user.email},
        expires_delta=access_token_expires
    )
    
    # Create new refresh token (rotate refresh token)
    refresh_token = AuthService.create_refresh_token(
        data={"sub": str(user.id), "email": user.email}
    )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Get current authenticated user information
    """
    return current_user

@router.post("/reset-password", status_code=status.HTTP_200_OK)
async def reset_password(
    data: PasswordResetRequest,
    conn: asyncpg.Connection = Depends(get_db_connection)
):
    """
    Reset user password. In a real app, this should involve sending a secure token to the user's email.
    """
    success = await AuthService.reset_password(conn, data.email, data.new_password)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
        
    return {"message": "Password updated successfully"}
 