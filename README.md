# CollabBoard

CollabBoard is a full-stack project management app built for collaborative teams. It combines a modern React frontend with an Express and MongoDB backend to support shared boards, multi-user task workflows, and real-time updates across sessions.

## Recruiter Snapshot

This project demonstrates end-to-end product thinking across frontend, backend, data modeling, API design, real-time sync, and deployment.

- Built a Trello-style collaboration platform with authentication, boards, lists, tasks, and activity history
- Implemented real-time board updates with Socket.io so multiple users can work on the same board together
- Designed role-based collaboration flows including invite, leave, remove member, role update, and ownership transfer
- Added drag-and-drop task movement and list reordering with optimistic UI updates
- Shipped searchable, paginated dashboard and task/activity experiences
- Deployed the frontend on Vercel and the backend on Render

## Live Demo

- Frontend: `https://collabboard-iota.vercel.app/`
- Backend API: `https://collabboard-api.onrender.com/`
- Health check: `https://collabboard-api.onrender.com/health`

## Demo Accounts

- `anadil@gmail.com` / `anadil123`
- `adil@gmail.com` / `adil1234`

## What The App Does

- Secure signup and login with JWT-based authentication
- Create and manage boards with descriptions and default lists
- Invite teammates to boards and manage member roles
- Create, update, delete, and assign tasks inside lists
- Move tasks across lists with drag and drop
- Reorder lists within a board
- Filter tasks by label, priority, and due date
- Track board activity history
- Search and paginate boards, tasks, and activities
- Sync board changes in real time between users

## Tech Stack

### Frontend

- React 19
- Vite
- React Router
- TanStack Query
- Zustand
- Socket.io client
- `@hello-pangea/dnd`
- Tailwind CSS v4

### Backend

- Node.js
- Express 5
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Socket.io
- Jest and Supertest

## Architecture Highlights

- Frontend is organized around pages, reusable UI components, API service modules, custom hooks, and Zustand stores
- Backend follows a layered structure: `routes -> controllers -> services -> models`
- Real-time updates are scoped at the board level using Socket.io rooms
- The client writes through REST APIs, then refreshes canonical data through React Query after socket events
- Error handling, auth, validation, and rate limiting are centralized in backend middleware

## Why This Project Stands Out

- Covers the full stack rather than focusing on only UI or only APIs
- Includes collaboration features that require state consistency across users
- Shows practical product decisions like optimistic updates, cache invalidation, and permission-aware actions
- Uses production-style separation of concerns in both frontend and backend codebases
- Includes automated backend test coverage for core flows and authorization behavior

## Repository Structure

```text
.
├── collabboard-frontend
└── collabboard-backend
```

## Run Locally

### Backend

```bash
cd collabboard-backend
cp .env.example .env
npm install
npm run dev
```

### Frontend

```bash
cd collabboard-frontend
npm install
npm run dev
```

## Environment Variables

### Frontend

```bash
VITE_API_URL=http://localhost:5001
```

### Backend

```bash
PORT=5001
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_secure_secret
CLIENT_URL=http://localhost:5173
DEMO_USER_NAME=Anadil
DEMO_USER_EMAIL=anadil@gmail.com
DEMO_USER_PASSWORD=anadil123
```

## Quality Checks

### Frontend

```bash
cd collabboard-frontend
npm run lint
npm run build
```

### Backend

```bash
cd collabboard-backend
npm test -- --runInBand
```
