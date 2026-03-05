from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    db_url: str = "postgresql://sb:sbpass@localhost:5432/sbdb"
    neo4j_url: str = "bolt://localhost:7687"
    neo4j_user: str = "neo4j"
    neo4j_password: str = "sbneo4jpass"
    secret_key: str = "your-secret-key-change-in-production-use-env-var"
    
    class Config:
        env_file = ".env"

settings = Settings()
