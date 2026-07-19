<div align="center">

# MatchLens AI
### AI Volunteer Copilot — FIFA World Cup 2026

**GenAI-Powered Smart Stadium Operations Platform**

[![CI](https://github.com/your-username/matchlens-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/matchlens-ai/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green?logo=node.js)](https://nodejs.org/)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-1.5%20Flash-orange?logo=google)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-purple)](LICENSE)

*Built for GDG HackToSkill Hackathon · July 2026*

</div>

---

## What Is MatchLens AI?

MatchLens AI is a production-quality, AI-powered operations platform that gives FIFA World Cup 2026 stadium staff an intelligent copilot — reducing response time, breaking language barriers, automating incident handling, and supporting every operational decision in real time.

**The Problem:** During a match with 80,000+ fans, critical seconds are lost when volunteers search for procedures, security teams coordinate across language barriers, or medical staff navigate crowds to reach emergencies.

**The Solution:** One intelligent dashboard where AI analyzes every situation instantly — generating action protocols, multilingual announcements, crowd management plans, and accessibility routes — all powered by Google Gemini.

---

## Live Demo

| Role | Email | Password |
|------|-------|----------|
| 🔧 Admin | `admin@matchlens.ai` | `Admin@1234` |
| 📋 Organizer | `organizer@matchlens.ai` | `Organizer@1234` |
| 🛡️ Security | `security@matchlens.ai` | `Security@1234` |
| ⚕️ Medical | `medical@matchlens.ai` | `Medical@1234` |
| 🦺 Volunteer | `volunteer@matchlens.ai` | `Volunteer@1234` |

---

## AI Modules

| Module | Capability |
|--------|-----------|
| 👶 **Lost Child Assistant** | Extracts structured child info, generates official search protocol, recommends search radius, creates multilingual public announcements in 8 languages |
| 🏥 **Medical Emergency** | Identifies emergency type (cardiac, seizure, heat stroke etc.), generates first-aid protocol, locates nearest medical station, plans crowd diversion |
| 👥 **Crowd Management** | Analyzes congestion level, recommends volunteer deployment positions, suggests alternative routes, predicts future crowd flow |
| ♿ **Accessibility Guide** | Plans personalized routes for wheelchair users, elderly, visually/hearing impaired, and families with children |
| 🌍 **Translation Assistant** | Real-time translation across English, Spanish, French, Portuguese, Arabic, Hindi, Japanese, German with cultural context |
| 📋 **Incident Summarizer** | Converts conversation notes into structured official reports with timeline, people involved, actions taken, and recommendations |
| 📚 **Knowledge Assistant** | RAG-powered Q&A over stadium SOPs, emergency procedures, volunteer handbook, accessibility guide, and FIFA operational rules |

---

## Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| Next.js 15 (App Router) | React framework with SSR/SSG |
| TypeScript (strict) | Type safety throughout |
| Tailwind CSS v4 | Styling with dark mode support |
| Framer Motion | Animations |
| React Hook Form + Zod | Form validation |
| TanStack Query v5 | Server state management |
| Zustand | Client auth state |
| React Leaflet + OpenStreetMap | Interactive maps — free, no API key |
| Socket.io Client | Real-time updates |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Express | REST API server |
| TypeScript (strict) | Type safety |
| MongoDB Atlas + Mongoose | Database |
| Google Gemini 1.5 Flash | AI engine |
| Socket.IO | Real-time events |
| JWT + Refresh Tokens | Authentication |
| Redis | Caching (optional, in-memory fallback) |
| Winston | Structured logging |
| Zod | Input validation |
| Swagger/OpenAPI | API documentation |

### DevOps
| Technology | Purpose |
|-----------|---------|
| GitHub Actions | CI/CD pipeline |
| Vercel | Frontend deployment |
| Render | Backend deployment |
| MongoDB Atlas | Managed database |
| Vitest + Supertest | Backend testing |
| Playwright | E2E testing |

---

## Project Structure

```
MatchLens-AI/
│
├── .github/
│   └── workflows/ci.yml          # GitHub Actions CI pipeline
│
├── backend/                       # Express API
│   └── src/
│       ├── ai/                    # Gemini service wrapper
│       ├── config/                # Env validation, logger, Redis
│       ├── constants/             # All enums, roles, event names
│       ├── controllers/           # Thin HTTP handlers
│       ├── database/              # MongoDB connection
│       ├── helpers/               # Seed scripts, pagination utils
│       ├── interfaces/            # TypeScript interfaces
│       ├── middlewares/
│       │   ├── auth.middleware.ts         # JWT + RBAC
│       │   ├── error.middleware.ts        # Global error handler
│       │   ├── performance.middleware.ts  # Response timing
│       │   ├── rateLimit.middleware.ts    # 3-tier rate limiting
│       │   ├── security.middleware.ts     # NoSQL injection prevention
│       │   └── validate.middleware.ts     # Zod request validation
│       ├── models/                # 9 Mongoose schemas
│       ├── prompts/               # Standalone AI system prompts
│       ├── rag/                   # RAG retriever (semantic + text)
│       ├── repositories/          # Data access layer
│       ├── routes/                # Versioned REST API routes
│       ├── services/              # Business logic layer
│       ├── sockets/               # Socket.IO setup
│       ├── tests/
│       │   ├── unit/              # 37 unit tests (no DB needed)
│       │   └── integration/       # API integration tests
│       ├── types/                 # TypeScript type extensions
│       ├── validators/            # Zod request schemas
│       ├── app.ts                 # Express app setup
│       └── server.ts              # Server entry point
│
└── frontend/                      # Next.js 15 app
    ├── app/
    │   ├── (auth)/
    │   │   ├── login/             # Login page
    │   │   └── register/          # Registration page
    │   └── (dashboard)/
    │       ├── admin/             # Admin dashboard + user management
    │       ├── organizer/         # Operations + live map
    │       ├── security/          # Security monitoring
    │       ├── medical/           # Medical emergencies
    │       ├── volunteer/         # Volunteer dashboard + map
    │       ├── incidents/         # All incidents + filters
    │       │   ├── lost-child/    # Lost child AI workflow
    │       │   └── medical/       # Medical emergency AI workflow
    │       ├── ai-assistant/      # Multi-module AI chat
    │       └── notifications/     # Notification center
    ├── components/
    │   ├── dashboard/             # StatsCard, IncidentCard
    │   ├── layout/                # DashboardLayout, SkipLink, RoleGuard
    │   ├── map/                   # StadiumMap, IncidentMap (Leaflet)
    │   └── ui/                    # Badge, ErrorBoundary, LoadingSpinner, ThemeToggle
    ├── hooks/                     # useSocket, useAuth
    ├── lib/                       # API client, auth store, RBAC utils
    └── tests/
        ├── e2e/                   # Playwright E2E tests
        └── unit/                  # Frontend unit tests
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- MongoDB Atlas account (free tier works)
- Google Gemini API key — get free at [aistudio.google.com](https://aistudio.google.com)

### 1. Clone

```bash
git clone https://github.com/your-username/matchlens-ai.git
cd matchlens-ai
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/matchlens
JWT_SECRET=<any-random-string-min-32-characters>
JWT_REFRESH_SECRET=<another-random-string-min-32-characters>
GEMINI_API_KEY=<your-key-from-aistudio.google.com>
```

```bash
# Start backend
npm run dev
```

Backend runs at **http://localhost:5000**

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
```

`frontend/.env.local` is already configured for local development.

```bash
# Start frontend
npm run dev
```

Frontend runs at **http://localhost:3000**

### 4. Seed Data

```bash
# In backend directory

# Create demo users (run first)
npm run seed

# Add demo incidents for screenshots
npm run seed:demo
```

---

## API Reference

**Base URL:** `http://localhost:5000/api/v1`  
**Swagger UI:** `http://localhost:5000/api/docs`

### Auth Endpoints
| Method | Endpoint | Description |
|--------|---------|------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login — returns JWT pair |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Logout (invalidates token) |
| GET | `/auth/me` | Current user profile |
| PUT | `/auth/change-password` | Change password |

### Incident Endpoints
| Method | Endpoint | Description |
|--------|---------|------------|
| GET | `/incidents` | List with filter/search/sort/paginate |
| GET | `/incidents/stats` | Dashboard statistics |
| GET | `/incidents/:id` | Single incident detail |
| PUT | `/incidents/:id/status` | Update status |
| PUT | `/incidents/:id/assign` | Assign to staff |
| POST | `/incidents/lost-child` | Report lost child + AI analysis |
| GET | `/incidents/lost-child/active` | Active lost child cases |
| POST | `/incidents/lost-child/announcements` | Generate multilingual announcements |
| POST | `/incidents/medical` | Report medical emergency + AI protocol |
| GET | `/incidents/medical/active` | Active medical emergencies |

### AI Endpoints
| Method | Endpoint | Description |
|--------|---------|------------|
| POST | `/ai/lost-child/analyze` | AI analysis only (no DB write) |
| POST | `/ai/medical/analyze` | Medical emergency analysis |
| POST | `/ai/crowd/analyze` | Crowd management analysis |
| POST | `/ai/accessibility/assist` | Accessibility route planning |
| POST | `/ai/translate` | Quick single translation |
| POST | `/ai/translate/all` | All 8 languages at once |
| POST | `/ai/summarize` | Summarize incident conversation |
| POST | `/ai/knowledge` | RAG knowledge base Q&A |
| POST | `/ai/chat` | Multi-turn AI chat session |

### User Management (Admin only)
| Method | Endpoint | Description |
|--------|---------|------------|
| GET | `/users` | List all users (filter by role) |
| PUT | `/users/:id/role` | Change user role |
| PUT | `/users/:id/toggle-active` | Activate / deactivate user |
| GET | `/users/audit-logs` | System audit trail |

### Knowledge Base
| Method | Endpoint | Description |
|--------|---------|------------|
| GET | `/knowledge` | List documents (search/filter) |
| POST | `/knowledge` | Create document (admin/organizer) |
| PUT | `/knowledge/:id` | Update document |
| DELETE | `/knowledge/:id` | Soft delete (admin only) |

---

## Role-Based Access Control

Every route is protected — both frontend and backend.

| Feature | Volunteer | Security | Medical | Organizer | Admin |
|---------|:---------:|:--------:|:-------:|:---------:|:-----:|
| Own Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| All Incidents | ✅ | ✅ | ✅ | ✅ | ✅ |
| Report Lost Child | ✅ | ✅ | ✅ | ✅ | ✅ |
| Medical Active List | ❌ | ❌ | ✅ | ✅ | ✅ |
| Assign Incidents | ❌ | ✅ | ❌ | ✅ | ✅ |
| AI Assistant (all) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Summarize Incidents | ❌ | ✅ | ✅ | ✅ | ✅ |
| Knowledge Base (read) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Knowledge Base (write) | ❌ | ❌ | ❌ | ✅ | ✅ |
| User Management | ❌ | ❌ | ❌ | ❌ | ✅ |
| Audit Logs | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## Security Implementation

| Layer | Implementation |
|-------|---------------|
| Authentication | JWT access tokens (15 min) + refresh tokens (7 days) with rotation |
| Authorization | RBAC middleware — every API route protected |
| Injection Prevention | NoSQL operator sanitization (`$where`, dot notation blocked) |
| Rate Limiting | Global: 200/15min · Auth: 10/15min · AI: 20/min |
| Headers | Helmet.js with custom CSP policy |
| Password Storage | bcrypt with 12 salt rounds |
| Input Validation | Zod schemas on every endpoint |
| Audit Trail | All sensitive actions logged to MongoDB |
| Request Tracing | `X-Request-ID` on every request and response |
| Log Sanitization | Passwords, tokens, secrets redacted as `[REDACTED]` |
| XSS Detection | Pattern scanner logs suspicious request payloads |

---

## Testing

```bash
# Backend — unit tests (no DB needed)
cd backend
npm test

# With coverage report
npm run test:coverage

# Integration tests (requires running MongoDB)
npx vitest run src/tests/integration

# Frontend — E2E tests (requires running app)
cd frontend
npm run test:e2e
```

**Test coverage:**
- ✅ Auth service — JWT generation, verification, refresh
- ✅ Response utilities — all HTTP status helpers
- ✅ Constants — all enums, roles, language codes
- ✅ Security middleware — NoSQL injection blocking
- ✅ Validation middleware — Zod schema enforcement
- ✅ Integration — health check, auth API, security headers
- ✅ E2E — landing page, login/register, accessibility, responsive

---

## Accessibility

WCAG 2.2 AA compliant:

- Skip navigation link on every page (`Tab` to activate)
- All forms: `<label>` for every input, `aria-required`, `aria-invalid`
- All errors: `role="alert"` with `aria-live="polite"`
- All icons: `aria-hidden="true"` (decorative)
- All navigation: `aria-current="page"` for active items
- Keyboard navigation on every interactive element
- Dark mode — manual toggle + OS `prefers-color-scheme` detection
- Reduced motion — `@media (prefers-reduced-motion)` respected
- High contrast / forced-colors CSS support
- Minimum 44×44px touch targets on mobile
- Single `<h1>` per page, logical heading hierarchy

---

## Maps

Uses **OpenStreetMap + React Leaflet** — completely free, no API key, no billing.

- Live incident markers on Volunteer and Organizer dashboards
- Color-coded by incident type (red=medical, amber=lost child, blue=security)
- Critical incidents have pulsing animation
- Stadium boundary circle overlay
- Interactive popups with incident title and severity
- Automatic legend for active incident types
- Works on Vercel with zero configuration

---

## Deployment

### Frontend → Vercel
```bash
cd frontend
vercel --prod
```

Set in Vercel dashboard:
```
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api/v1
NEXT_PUBLIC_SOCKET_URL=https://your-backend.onrender.com
```

### Backend → Render
`backend/render.yaml` is pre-configured. Connect GitHub repo in Render and set:
```
MONGODB_URI=<your-atlas-uri>
JWT_SECRET=<min-32-chars>
JWT_REFRESH_SECRET=<min-32-chars>
GEMINI_API_KEY=<your-key>
CLIENT_URL=https://your-frontend.vercel.app
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    Browser / Mobile                  │
│  Next.js 15 (SSR + CSR)  ·  React Leaflet Maps     │
└──────────────┬──────────────────────────────────────┘
               │ HTTPS + WebSocket
┌──────────────▼──────────────────────────────────────┐
│              Express API  (Node.js)                  │
│  Auth · RBAC · Rate Limit · NoSQL Sanitize · Audit  │
└──────┬───────────┬───────────┬──────────────────────┘
       │           │           │
┌──────▼───┐ ┌─────▼────┐ ┌───▼────────────────────┐
│ MongoDB  │ │  Redis   │ │   Google Gemini AI     │
│  Atlas   │ │  Cache   │ │  (RAG + Chat + Embed)  │
└──────────┘ └──────────┘ └────────────────────────┘
```

**Clean Architecture layers:**
1. **Routes** — validate with Zod, delegate to controller
2. **Controllers** — thin, only handle HTTP request/response
3. **Services** — all business logic
4. **Repositories** — database queries only
5. **Models** — schema definitions with indexes
6. **Prompts** — separated from services for maintainability

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---------|---------|------------|
| `MONGODB_URI` | ✅ | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | Min 32 chars — signs access tokens |
| `JWT_REFRESH_SECRET` | ✅ | Min 32 chars — signs refresh tokens |
| `GEMINI_API_KEY` | ✅ | From [aistudio.google.com](https://aistudio.google.com) |
| `JWT_EXPIRES_IN` | — | Default: `15m` |
| `JWT_REFRESH_EXPIRES_IN` | — | Default: `7d` |
| `PORT` | — | Default: `5000` |
| `CLIENT_URL` | — | Default: `http://localhost:3000` |
| `REDIS_URL` | — | Optional — falls back to in-memory cache |
| `LOG_LEVEL` | — | Default: `info` |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|---------|------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.IO server URL |

---

## Hackathon Notes

This project was built for the **GDG HackToSkill Hackathon** (July 2026) against the following evaluation criteria:

| Criterion | Implementation Highlights |
|-----------|--------------------------|
| **Code Quality** | Clean Architecture, SOLID principles, TypeScript strict mode, ESLint + Prettier, separated prompts, repository pattern |
| **Security** | JWT rotation, RBAC, NoSQL injection prevention, rate limiting, bcrypt, CSP, audit logs, request tracing |
| **Efficiency** | Redis caching, MongoDB indexes, TanStack Query, static pre-rendering, connection pooling, pagination everywhere |
| **Testing** | 37 unit tests, integration tests, Playwright E2E, CI pipeline, coverage thresholds |
| **Accessibility** | WCAG 2.2 AA, skip links, ARIA throughout, keyboard nav, dark mode, reduced motion, screen reader support |

---

<div align="center">

**Built with Google Gemini AI · Next.js 15 · Node.js · MongoDB Atlas**

*FIFA World Cup 2026 — Smart Stadium Operations*

</div>
