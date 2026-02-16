# Scalability Considerations

## Current Baseline
- Stateless REST API with JWT auth.
- MongoDB with targeted indexes.
- Socket.io on a single backend instance.

## Horizontal Scale Plan
1. Deploy multiple backend instances behind a load balancer.
2. Use Redis adapter for Socket.io pub/sub so events fan out across instances.
3. Keep JWT stateless auth to avoid sticky sessions.

## Database Scale Plan
- Ensure indexes:
  - `boards.members`
  - `boards.title` (text)
  - `lists.boardId`
  - `tasks.boardId`, `tasks.listId`
  - `tasks.title` (text)
  - `activities.boardId`
- Add compound indexes if query patterns evolve (for example `boardId + createdAt`).

## API Scale Plan
- Cursor pagination for very large datasets (optional upgrade from skip/limit).
- Add request-level caching for read-heavy board metadata.
- Add queue/background workers for non-critical side effects (notifications/email).

## Observability
- Structured logging for API and socket events.
- Metrics for p95 latency, error rates, and active socket connections.
- Alerting on DB connection failures and socket disconnect spikes.
