# Architecture

## Frontend Architecture (React SPA)
- `React + Vite` for a fast SPA build/runtime.
- `React Router` for route-level separation (`Landing`, `Auth`, `Dashboard`, `Board`).
- `TanStack Query` for API state (caching, invalidation, async mutations).
- `Zustand` for app/global UI state (auth/session/socket flags/modal state).
- `@hello-pangea/dnd` for Trello-style drag/drop interactions.
- `Socket.io client` for real-time board/activity updates.

### Frontend Module Boundaries
- `src/pages/*`: route-level pages.
- `src/components/*`: reusable visual + domain components.
- `src/services/*`: HTTP API wrappers.
- `src/hooks/*`: cross-cutting hooks (auth/socket/board behavior).
- `src/store/*`: global state slices.
- `src/app/*`: router, query client, socket bootstrap.

## Backend Architecture (Express API)
- `Express` for REST API.
- `Mongoose` models for MongoDB.
- Layering:
  - `routes/*`: API endpoints and middleware composition.
  - `controllers/*`: request orchestration + authz checks.
  - `services/*`: domain logic and DB operations.
  - `middleware/*`: auth, validation, errors, rate limiting.
  - `sockets/*`: room join/event handling.
  - `utils/*`: jwt/hash/pagination/logger.

### Request Lifecycle
1. Route receives request.
2. Auth middleware verifies JWT and injects `req.userId`.
3. Validator middleware checks payload shape.
4. Controller enforces board/list/task authorization and board roles (owner/admin/member).
5. Service performs DB operations.
6. Socket service broadcasts relevant board events.
7. Activity service writes immutable activity records.

## Real-Time Model
- Clients join board rooms via socket event `joinBoard(boardId)`.
- Mutating actions (create/update/delete/move task) emit board-scoped events:
  - `listCreated`, `listUpdated`, `listDeleted`, `listReordered`
  - `taskCreated`, `taskUpdated`, `taskDeleted`, `taskMoved`
  - `activityCleared`
- Clients invalidate board/activity queries and refetch consistent server state.

## Why This Architecture
- Keeps UI concerns, API concerns, and domain logic clearly separated.
- Scales to additional entities (comments/files/labels) with minimal restructuring.
- Makes interview discussion easier: clear data flow and responsibility boundaries.
