# CollabBoard Frontend

React + Vite frontend for a Trello/Notion-style collaboration platform.

## Stack
- React 19
- Vite
- Tailwind CSS v4
- TanStack Query
- Zustand
- @hello-pangea/dnd
- Socket.io client

## Features
- JWT auth flow (login/signup/logout)
- Dashboard with board search + pagination
- Board details with lists/tasks
- Drag-and-drop task move
- Real-time board/activity updates via Socket.io
- Activity history sidebar

## Local Setup
1. Configure `.env`
2. Install deps and run:

```bash
npm install
npm run dev
```

## Environment
- `VITE_API_URL=http://localhost:5001`

## Deployment
- Deploy frontend to Vercel
- Set `VITE_API_URL` to your deployed backend URL

## Build
```bash
npm run build
```
