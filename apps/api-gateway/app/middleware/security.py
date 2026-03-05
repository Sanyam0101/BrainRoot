from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import time
from collections import defaultdict
from typing import Dict, Tuple

# Simple in-memory rate limiter (for production, use Redis)
class RateLimiter:
    def __init__(self, max_requests: int = 100, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: Dict[str, list] = defaultdict(list)
    
    def is_allowed(self, key: str) -> bool:
        """Check if request is allowed based on rate limit"""
        now = time.time()
        
        # Clean old requests outside the window
        self.requests[key] = [
            req_time for req_time in self.requests[key]
            if now - req_time < self.window_seconds
        ]
        
        # Check if limit exceeded
        if len(self.requests[key]) >= self.max_requests:
            return False
        
        # Add current request
        self.requests[key].append(now)
        return True
    
    def get_remaining(self, key: str) -> int:
        """Get remaining requests in current window"""
        now = time.time()
        self.requests[key] = [
            req_time for req_time in self.requests[key]
            if now - req_time < self.window_seconds
        ]
        return max(0, self.max_requests - len(self.requests[key]))

# Global rate limiter instance
rate_limiter = RateLimiter(max_requests=100, window_seconds=60)

class SecurityMiddleware(BaseHTTPMiddleware):
    """Security middleware for rate limiting and security headers"""
    
    async def dispatch(self, request: Request, call_next):
        # Get client IP for rate limiting
        client_ip = request.client.host if request.client else "unknown"
        
        # Apply rate limiting (skip for health checks)
        if request.url.path not in ["/health", "/", "/docs", "/openapi.json"]:
            if not rate_limiter.is_allowed(client_ip):
                remaining = rate_limiter.get_remaining(client_ip)
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Rate limit exceeded. Try again later. Remaining: {remaining}",
                    headers={
                        "X-RateLimit-Limit": "100",
                        "X-RateLimit-Remaining": str(remaining),
                        "Retry-After": "60"
                    }
                )
        
        # Process request
        response = await call_next(request)
        
        # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        # Add rate limit headers
        if request.url.path not in ["/health", "/", "/docs", "/openapi.json"]:
            remaining = rate_limiter.get_remaining(client_ip)
            response.headers["X-RateLimit-Limit"] = "100"
            response.headers["X-RateLimit-Remaining"] = str(remaining)
        
        return response

