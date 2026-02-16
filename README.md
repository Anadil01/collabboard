# CollabBoard - Full Stack Engineer Assignment

Real-time task collaboration platform (Trello/Notion style) built with a MERN stack.

## Live Deployment
- Frontend URL (Vercel): `https://collabboard-iota.vercel.app/`
- Backend URL (Render): `https://collabboard-api.onrender.com/`
- Backend health check: `https://collabboard-api.onrender.com/health`

## Demo Credentials
- User 1
- Email: `anadil@gmail.com`
- Password: `anadil123`
- User 2
- Email: `adil@gmail.com`
- Password: `adil1234`

## Setup Steps

### 1) Backend
```bash
cd collabboard-backend
cp .env.example .env
npm install
npm start
```

### 2) Frontend
```bash
cd collabboard-frontend
npm install
npm run dev
```

### 3) Environment Variables
- Frontend (`collabboard-frontend/.env`)
```bash
VITE_API_URL=http://localhost:5001
```
- Backend (`collabboard-backend/.env`)
```bash
PORT=5001
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_secure_secret
CLIENT_URL=http://localhost:5173
DEMO_USER_NAME=Anadil
DEMO_USER_EMAIL=anadil@gmail.com
DEMO_USER_PASSWORD=anadil123
```

## Architecture
- Frontend: React (Vite) SPA, React Router, React Query, Zustand, Socket.io client.
- Backend: Express REST API, Mongoose models, service-layer architecture, Socket.io event broadcasting.
- Layering:
- `routes` -> `controllers` -> `services` -> `models`, plus middleware for auth/validation/errors.
- Detailed architecture doc: `docs/ARCHITECTURE.md`
- API contract: `docs/API_CONTRACT.md`
- Database schema: `docs/DB_SCHEMA.md`

## Realtime Strategy
- Transport: Socket.io (WebSocket with fallback).
- Scope: board-level rooms keyed by `boardId`.
- Flow: write via REST first, then emit board-scoped socket events.
- Client consistency: event listeners invalidate React Query caches and refetch canonical server state.
- Detailed realtime doc: `docs/REALTIME_SYNC.md`

## Tradeoffs and Scaling Notes
- REST-first design chosen for clarity and predictable request/response behavior.
- Event-driven cache invalidation chosen over complex client-side patching to reduce inconsistency risk.
- Current pagination uses skip/limit for simplicity; cursor pagination is the next step for very large datasets.
- Horizontal scale path: multi-instance API + Redis Socket.io adapter + stateless JWT auth.
- Database scale path: targeted/compound indexes by query patterns.
- Detailed scalability doc: `docs/SCALABILITY.md`

## Assignment Coverage
- User authentication (signup/login): implemented with JWT + bcrypt.
- Boards with multiple lists: implemented.
- Board descriptions + default lists on create: implemented.
- Board member management with roles (owner/admin/member): implemented.
- Tasks CRUD in lists: implemented.
- Drag and drop tasks across lists: implemented with `@hello-pangea/dnd`.
- List reordering within a board: implemented.
- Assign users to tasks: supported through `assignedTo` on tasks and task update APIs.
- Task metadata (label, priority, due date) + filters: implemented.
- Real-time updates across users: implemented with Socket.io board rooms.
- Activity history tracking: implemented with `activities` collection + API.
- Activity clear for a board: implemented.
- Pagination and search: implemented on boards/tasks/activities.

## Test and Quality Checks
- Frontend
```bash
cd collabboard-frontend
npm run lint
npm run build
```
- Backend
```bash
cd collabboard-backend
npm test -- --runInBand
```
