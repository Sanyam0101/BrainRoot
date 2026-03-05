# Second Brain: AI-Powered Knowledge Management Platform

A complete knowledge management system with semantic search, graph visualization, and AI-powered analysis.

**Institution**: GL Bajaj Institute of Technology & Management  
**Team**: Sandeep Singh, Sanyam Garg, Tanya Bhati, Sapna Kanaajia  
**Supervisor**: Ms. Akanksha  
**Branch**: B.Tech. (AIML)/CSE (AIML)

---

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Node.js 20+ (for local development, optional)

### Start Everything

```bash
# Navigate to project directory
cd C:\Users\gargs\second-brain

# Start all services
docker-compose -f docker-compose.dev.yml up -d --build

# Check status
docker-compose -f docker-compose.dev.yml ps

# View logs
docker-compose -f docker-compose.dev.yml logs -f
```

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Neo4j Browser**: http://localhost:7474

### First Time Setup

1. Open http://localhost:3000 in your browser
2. Click "Sign up" to create an account
3. Login with your credentials
4. Click "New Note" to create your first note
5. Use the search bar for semantic search
6. View dashboard for analytics

---

## 📁 Project Structure

```
second-brain/
├── apps/
│   ├── api-gateway/          # FastAPI Backend
│   │   ├── app/
│   │   │   ├── api/v1/       # API Routes (auth, notes, graph, analytics)
│   │   │   ├── services/     # Business Logic
│   │   │   ├── schemas/      # Pydantic Models
│   │   │   ├── deps/         # Dependencies (auth, database)
│   │   │   ├── middleware/   # Security middleware
│   │   │   └── core/         # Configuration
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   └── frontend/             # React + TypeScript Frontend
│       ├── src/
│       │   ├── pages/        # Pages (Login, Register, Dashboard, Notes)
│       │   ├── components/   # Reusable Components
│       │   ├── services/     # API Service Clients
│       │   ├── contexts/     # React Contexts (Auth)
│       │   └── App.tsx       # Main App Component
│       ├── Dockerfile
│       ├── nginx.conf
│       └── package.json
├── infra/
│   ├── postgres/
│   │   ├── data/             # PostgreSQL data
│   │   └── init/             # Database migrations
│   │       ├── 001_setup.sql          # Notes table + pgvector
│   │       ├── 002_create_users_table.sql  # Users table
│   │       └── 003_update_notes_table.sql   # Indexes
│   └── neo4j/
│       ├── data/             # Neo4j data
│       └── logs/             # Neo4j logs
└── docker-compose.dev.yml    # Docker orchestration
```

---

## 🛠️ Features

### ✅ Implemented Features

1. **Authentication System**
   - User registration with email validation
   - JWT-based login with access & refresh tokens
   - Token refresh mechanism
   - Protected routes
   - Password hashing with bcrypt

2. **Notes Management**
   - Create, Read, Update, Delete notes
   - Tags support
   - Automatic embedding generation
   - User-specific notes (isolation)

3. **Semantic Search**
   - Vector-based search using Sentence Transformers (all-MiniLM-L6-v2)
   - pgvector extension for PostgreSQL
   - Cosine similarity search
   - HNSW index for fast queries

4. **Graph Database**
   - Neo4j integration
   - Create idea nodes
   - Link ideas together
   - Find neighbors and shortest paths
   - Tag-based connections

5. **Analytics Dashboard**
   - System statistics (notes, ideas, connections)
   - Activity metrics
   - Tag analytics
   - Database health monitoring

6. **Modern UI**
   - React + TypeScript
   - Tailwind CSS with dark mode
   - Responsive design
   - React Query for data fetching
   - Lucide icons

### 🚧 Planned Features

- Data Analyst Bot (AI analysis)
- Graph Visualization (React Flow)
- External Integrations (Google Drive, Notion)
- Monaco Editor (rich text editing)

---

## 📚 API Endpoints

### Authentication (`/api/v1/auth`)
- `POST /register` - Register new user
- `POST /login` - Login (returns tokens)
- `POST /refresh` - Refresh access token
- `GET /me` - Get current user info

### Notes (`/api/v1/notes`)
- `GET /` - Get all user's notes
- `GET /{id}` - Get note by ID
- `POST /` - Create note
- `PUT /{id}` - Update note
- `DELETE /{id}` - Delete note
- `GET /search?q=query` - Semantic search

### Analytics (`/api/v1/analytics`)
- `GET /overview` - Complete system overview
- `GET /stats` - Quick statistics

### Graph (`/api/v1/graph`)
- `POST /idea` - Create idea node
- `POST /tag` - Add tag to idea
- `POST /link` - Link two ideas
- `GET /neighbors` - Get connected nodes
- `GET /shortest_path` - Find path between ideas

---

## 🔧 Development

### Backend Development

```bash
cd apps/api-gateway

# Install dependencies
pip install -r requirements.txt

# Run locally (requires databases running)
uvicorn app.main:app --reload --port 8000
```

### Frontend Development

```bash
cd apps/frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

### Database Migrations

Migrations run automatically when PostgreSQL starts. Files in `infra/postgres/init/`:
- `001_setup.sql` - Creates notes table with pgvector
- `002_create_users_table.sql` - Creates users table
- `003_update_notes_table.sql` - Adds indexes

---

## 🔐 Environment Variables

### Backend (`apps/api-gateway/.env`)
```env
DB_URL=postgresql://sb:sbpass@db:5432/sbdb
NEO4J_URL=bolt://neo4j:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=sbneo4jpass
SECRET_KEY=your-secret-key-change-in-production
```

### Frontend (`apps/frontend/.env`)
```env
VITE_API_URL=http://localhost:8000/api/v1
```

**Note**: In Docker, these are set in `docker-compose.dev.yml`

---

## 🧪 Testing

### Test Backend

```bash
# Health check
curl http://localhost:8000/health

# Register user
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test123", "full_name": "Test User"}'

# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test123"}'
```

### Test Frontend

1. Open http://localhost:3000
2. Register an account
3. Create notes
4. Test semantic search
5. View dashboard analytics

---

## 📊 Database Information

### PostgreSQL
- **Database**: `sbdb`
- **User**: `sb`
- **Password**: `sbpass`
- **Port**: `5432`
- **Extensions**: pgvector (for semantic search)

### Neo4j
- **User**: `neo4j`
- **Password**: `sbneo4jpass`
- **HTTP Port**: `7474` (Browser UI)
- **Bolt Port**: `7687` (API)

---

## 🐛 Troubleshooting

### Services Won't Start

```bash
# Check service status
docker-compose -f docker-compose.dev.yml ps

# View logs for specific service
docker-compose -f docker-compose.dev.yml logs frontend
docker-compose -f docker-compose.dev.yml logs api
docker-compose -f docker-compose.dev.yml logs db

# Restart services
docker-compose -f docker-compose.dev.yml restart
```

### Build Errors

```bash
# Clean rebuild
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d --build
```

### Database Connection Errors

- Ensure databases are healthy: `docker-compose -f docker-compose.dev.yml ps`
- Check database logs: `docker-compose -f docker-compose.dev.yml logs db`
- Verify ports aren't in use: Check if ports 5432, 7474, 7687, 8000, 3000 are available

### Frontend Can't Connect to Backend

- Verify backend is running: `curl http://localhost:8000/health`
- Check CORS settings in `apps/api-gateway/app/main.py`
- Verify API URL in browser console
- Check nginx proxy configuration in `apps/frontend/nginx.conf`

### Port Already in Use

- Stop conflicting services
- Or change ports in `docker-compose.dev.yml`

---

## 🛡️ Security Features

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting (100 requests/minute per IP)
- Security headers (X-Content-Type-Options, X-Frame-Options, etc.)
- CORS configuration
- Input validation with Pydantic
- SQL injection prevention (parameterized queries)

---

## 📦 Technology Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL with pgvector
- **Graph DB**: Neo4j
- **AI/ML**: Sentence Transformers (all-MiniLM-L6-v2)
- **Auth**: JWT (python-jose), bcrypt (passlib)
- **Deployment**: Docker

### Frontend
- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Query (@tanstack/react-query)
- **Routing**: React Router
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Deployment**: Docker + Nginx

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx (frontend)
- **Database**: PostgreSQL 16 + Neo4j 5

---

## 📝 Common Commands

```bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# Stop all services
docker-compose -f docker-compose.dev.yml down

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Rebuild after code changes
docker-compose -f docker-compose.dev.yml up -d --build

# Restart specific service
docker-compose -f docker-compose.dev.yml restart [service-name]

# Clean restart (removes volumes)
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
```

---

## 🎯 Project Goals

This project aims to:
- Solve information overload and fragmented knowledge
- Enable semantic search beyond keyword matching
- Visualize knowledge connections through graphs
- Provide AI-powered analysis capabilities
- Support collaborative knowledge management
- Help CDC and colleges capture institutional knowledge

---

## 📈 Project Status

**Current Status**: ✅ **Fully Functional**

- ✅ Backend API complete
- ✅ Frontend UI complete
- ✅ Authentication working
- ✅ Notes CRUD working
- ✅ Semantic search working
- ✅ Analytics dashboard working
- ✅ Docker deployment ready

**Ready for**: Development, Testing, Demonstration

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review API documentation at http://localhost:8000/docs
3. Check Docker logs for errors
4. Verify all services are running: `docker-compose ps`

---

**Last Updated**: Project Complete - Ready to Use! 🚀
