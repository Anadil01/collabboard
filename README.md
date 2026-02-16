# CollabBoard - Full Stack Engineer Assignment

Real-Time Task Collaboration Platform (Trello/Notion-style) built with a MERN stack.

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

## Tech Stack
- Frontend: React (Vite), Tailwind CSS, React Query, Zustand, Socket.io client.
- Backend: Node.js, Express, MongoDB (Mongoose), JWT, Socket.io.
- Deployment targets:
  - Frontend: Vercel
  - Backend: Render or Railway
  - Database: MongoDB Atlas

## Documentation Deliverables
- Frontend + backend architecture explanation: `docs/ARCHITECTURE.md`
- Database schema diagram: `docs/DB_SCHEMA.md`
- API contract: `docs/API_CONTRACT.md`
- Real-time sync strategy: `docs/REALTIME_SYNC.md`
- Scalability considerations: `docs/SCALABILITY.md`

## Local Setup

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

## Demo Credentials


Then login with:
(user-1)
- Email: `anadil@gmail.com`
- Password: `anadil123`

(user-2)
- Email: `adil@gmail.com`
- Password: `adil1234`

## API Base URL
- Local backend: `http://localhost:5001`
- Health check: `GET /health`

## Assumptions and Trade-offs
- Uses REST APIs for clarity and interview readability over GraphQL complexity.
- Socket events trigger query invalidation/refetch for consistency instead of deep client-side event patching.
- Current activity feed logs core task actions; advanced audit granularity can be expanded.
- Authorization is board-member based; role-level permissions (admin/editor/viewer) are out of current scope.
- Uses skip/limit pagination for simplicity; cursor pagination is noted in scalability docs for large datasets.

## Test and Quality Checks
- Frontend:
```bash
cd collabboard-frontend
npm run lint
npm run build
```
- Backend:
```bash
cd collabboard-backend
npm test -- --runInBand
```
