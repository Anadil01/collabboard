# API Contract (REST)

Base URL (local): `http://localhost:5001`

Auth: Bearer JWT token in `Authorization: Bearer <token>` for protected routes.

## Authentication

### `POST /auth/signup`
- Purpose: Register new user.
- Body:
```json
{
  "name": "Demo User",
  "email": "demo@collabboard.dev",
  "password": "Demo@12345"
}
```
- 200 Response:
```json
{
  "token": "jwt_token",
  "user": { "id": "user_id", "name": "Demo User", "email": "demo@collabboard.dev" }
}
```

### `POST /auth/login`
- Purpose: Login existing user.
- Body:
```json
{ "email": "demo@collabboard.dev", "password": "Demo@12345" }
```
- 200 Response: same as signup response.

## Boards

### `GET /boards?page=1&limit=10&search=roadmap`
- Purpose: Paginated board list with search.
- Auth: required
- 200 Response:
```json
{
  "boards": [],
  "total": 0,
  "page": 1,
  "limit": 10
}
```

### `POST /boards`
- Purpose: Create board.
- Auth: required
- Body:
```json
{ "title": "Product Roadmap", "description": "Quarterly planning board" }
```

### `GET /boards/:id/full`
- Purpose: Fetch board details with lists and tasks.
- Auth: required (must be board member)
- 200 Response:
```json
{
  "board": {},
  "lists": [],
  "tasks": []
}
```

### `POST /boards/:id/members`
- Purpose: Invite/add a member by email.
- Auth: required (owner/admin)
- Body:
```json
{ "email": "teammate@collabboard.dev" }
```
- 200 Response:
```json
{ "board": {} }
```

### `PATCH /boards/:id/members/:memberId/role`
- Purpose: Update a member role.
- Auth: required (owner only)
- Body:
```json
{ "role": "admin" }
```
- 200 Response:
```json
{ "board": {} }
```

### `DELETE /boards/:id/members/:memberId`
- Purpose: Remove a member.
- Auth: required (owner/admin)
- 200 Response:
```json
{ "board": {} }
```

### `POST /boards/:id/leave`
- Purpose: Leave a board (non-owner only).
- Auth: required
- 200 Response:
```json
{ "ok": true }
```

### `PATCH /boards/:id/owner`
- Purpose: Transfer ownership to another member.
- Auth: required (owner only)
- Body:
```json
{ "memberId": "user_id" }
```
- 200 Response:
```json
{ "board": {} }
```

### `DELETE /boards/:id`
- Purpose: Delete a board and its lists/tasks/activities.
- Auth: required (owner/admin)
- 200 Response:
```json
{ "ok": true }
```

## Lists

### `POST /lists`
- Purpose: Create list in board.
- Auth: required
- Body:
```json
{ "boardId": "board_id", "title": "To Do" }
```

### `PATCH /lists/:id`
- Purpose: Update list (title/order).
- Auth: required (board member)

### `PATCH /lists/reorder`
- Purpose: Reorder lists inside a board.
- Auth: required (board member)
- Body:
```json
{
  "boardId": "board_id",
  "orderedListIds": ["list_id_1", "list_id_2", "list_id_3"]
}
```
- 200 Response:
```json
{ "lists": [] }
```

### `DELETE /lists/:id`
- Purpose: Delete list.
- Auth: required (board member)

## Tasks

### `GET /tasks?listId=<id>&page=1&limit=20&search=auth`
- Purpose: Paginated tasks in one list with text search.
- Auth: required

### `GET /tasks/:id`
- Purpose: Get task details.
- Auth: required (board member)

### `POST /tasks`
- Purpose: Create task.
- Auth: required
- Body:
```json
{
  "boardId": "board_id",
  "listId": "list_id",
  "title": "Implement MFA",
  "description": "Optional details",
  "label": "feature",
  "priority": "high",
  "dueDate": "2026-02-20",
  "assignedTo": ["user_id"]
}
```
Notes:
- `label` enum: `feature | design | bug | system | task`
- `priority` enum: `low | medium | high | urgent`
- `dueDate` accepts ISO-8601 date strings or `null`.

### `PATCH /tasks/:id`
- Purpose: Update task fields (title, description, label, priority, dueDate, assignedTo, etc).
- Auth: required (board member)

### `DELETE /tasks/:id`
- Purpose: Delete task.
- Auth: required (board member)

### `POST /tasks/move`
- Purpose: Move/reorder task during drag-drop.
- Auth: required (board member)
- Body:
```json
{
  "taskId": "task_id",
  "toListId": "target_list_id",
  "toIndex": 0
}
```

## Activity

### `GET /activities?boardId=<id>&page=1&limit=20`
- Purpose: Activity history with pagination.
- Auth: required (board member)

### `DELETE /activities?boardId=<id>`
- Purpose: Clear activity history for a board.
- Auth: required (board member)
- 200 Response:
```json
{ "ok": true }
```

## Errors
- `400`: validation / malformed payload
- `401`: missing/invalid token
- `403`: authorized user but no access to board resource
- `404`: resource not found
- `500`: unexpected server error
