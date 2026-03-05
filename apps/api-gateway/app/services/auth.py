import asyncpg
import uuid
from datetime import datetime, timedelta
from typing import Optional
import bcrypt
from jose import JWTError, jwt
from app.core.config import settings
from app.schemas.auth import UserRegister, UserResponse, TokenData

# JWT settings
SECRET_KEY = settings.secret_key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

class AuthService:
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        try:
            return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
        except ValueError:
            return False
    
    @staticmethod
    def get_password_hash(password: str) -> str:
        """Hash a password"""
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire, "type": "access"})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def create_refresh_token(data: dict) -> str:
        """Create JWT refresh token"""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        to_encode.update({"exp": expire, "type": "refresh"})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def verify_token(token: str, token_type: str = "access") -> Optional[TokenData]:
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            
            # Check token type
            if payload.get("type") != token_type:
                return None
            
            user_id: uuid.UUID = uuid.UUID(payload.get("sub"))
            email: str = payload.get("email")
            
            if user_id is None or email is None:
                return None
            
            return TokenData(user_id=user_id, email=email)
        except JWTError:
            return None
    
    @staticmethod
    async def register_user(conn: asyncpg.Connection, user_data: UserRegister) -> UserResponse:
        """Register a new user"""
        # Check if user already exists
        existing = await conn.fetchrow(
            "SELECT id FROM users WHERE email = $1", user_data.email
        )
        
        if existing:
            raise ValueError("User with this email already exists")
        
        # Hash password
        hashed_password = AuthService.get_password_hash(user_data.password)
        
        # Create user
        user_id = uuid.uuid4()
        query = '''
            INSERT INTO users (id, email, hashed_password, full_name, created_at)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, email, full_name, created_at
        '''
        
        row = await conn.fetchrow(
            query,
            user_id,
            user_data.email,
            hashed_password,
            user_data.full_name,
            datetime.utcnow()
        )
        
        return UserResponse(
            id=row['id'],
            email=row['email'],
            full_name=row['full_name'],
            created_at=row['created_at']
        )
    
    @staticmethod
    async def authenticate_user(conn: asyncpg.Connection, email: str, password: str) -> Optional[UserResponse]:
        """Authenticate user and return user data"""
        # Get user from database
        row = await conn.fetchrow(
            "SELECT id, email, hashed_password, full_name, created_at FROM users WHERE email = $1",
            email
        )
        
        if not row:
            return None
        
        # Verify password
        if not AuthService.verify_password(password, row['hashed_password']):
            return None
        
        return UserResponse(
            id=row['id'],
            email=row['email'],
            full_name=row['full_name'],
            created_at=row['created_at']
        )
    
    @staticmethod
    async def get_user_by_id(conn: asyncpg.Connection, user_id: uuid.UUID) -> Optional[UserResponse]:
        """Get user by ID"""
        row = await conn.fetchrow(
            "SELECT id, email, full_name, created_at FROM users WHERE id = $1",
            user_id
        )
        
        if not row:
            return None
        
        return UserResponse(
            id=row['id'],
            email=row['email'],
            full_name=row['full_name'],
            created_at=row['created_at']
        )
    
    @staticmethod
    async def reset_password(conn: asyncpg.Connection, email: str, new_password: str) -> bool:
        """Reset user password"""
        # Check if user exists
        row = await conn.fetchrow(
            "SELECT id FROM users WHERE email = $1", email
        )
        
        if not row:
            return False
            
        hashed_password = AuthService.get_password_hash(new_password)
        
        # Update password
        await conn.execute(
            "UPDATE users SET hashed_password = $1, updated_at = $2 WHERE email = $3",
            hashed_password, datetime.utcnow(), email
        )
        
        return True
