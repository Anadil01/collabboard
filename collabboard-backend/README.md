# CollabBoard Backend

Node.js + Express + MongoDB backend for a real-time task collaboration platform.

## Features
- JWT auth (`/auth/signup`, `/auth/login`)
- Boards, lists, tasks CRUD
- Drag-and-drop persistence (`POST /tasks/move`)
- Real-time events via Socket.io
- Activity history feed
- Pagination + search support
- Rate limiting + request validation + centralized error middleware

## Tech
- Express 5
- MongoDB + Mongoose
- JWT + bcrypt
- Socket.io
- Jest + Supertest

## Local Setup
1. Copy `.env.example` to `.env`
2. Fill variables
3. Install and run:

```bash
npm install
npm run dev
```

Seed demo user:
```bash
npm run seed:demo
```

## Environment
- `PORT` backend port (default `5001`)
- `MONGO_URI` MongoDB connection string
- `JWT_SECRET` auth secret
- `CLIENT_URL` frontend origin for CORS + socket
- `DEMO_USER_NAME` demo seed display name
- `DEMO_USER_EMAIL` demo seed email
- `DEMO_USER_PASSWORD` demo seed password

## API Summary
- `POST /auth/signup`
- `POST /auth/login`
- `GET /boards?page=1&limit=10&search=...`
- `POST /boards`
- `GET /boards/:id/full`
- `POST /lists`
- `PATCH /lists/:id`
- `DELETE /lists/:id`
- `GET /tasks?listId=...&page=1&limit=20&search=...`
- `GET /tasks/:id`
- `POST /tasks`
- `PATCH /tasks/:id`
- `DELETE /tasks/:id`
- `POST /tasks/move`
- `GET /activities?boardId=...&page=1&limit=20`

## Deployment
- Backend: Render or Railway
- DB: MongoDB Atlas
- Ensure `CLIENT_URL` points to deployed frontend

## Scaling Note (Optional)
For multi-instance real-time scaling, add Redis adapter for Socket.io.
