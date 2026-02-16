# Real-Time Sync Strategy

## Transport
- Socket.io over WebSocket with fallback support.

## Room Strategy
- Board-level rooms keyed by `boardId`.
- On board page mount: client emits `joinBoard(boardId)`.
- All board events are emitted to the same board room only.

## Event Strategy
- Mutations happen through REST API first.
- After successful DB write, backend emits socket event:
  - `listCreated`
  - `listUpdated`
  - `listDeleted`
  - `listReordered`
  - `taskCreated`
  - `taskUpdated`
  - `taskDeleted`
  - `taskMoved`
  - `activityCreated`
  - `activityCleared`

## Client Consistency
- Frontend listens for events and invalidates React Query caches:
  - `["board", boardId]`
  - `["activity", boardId]`
- This avoids stale local ordering after concurrent edits.
- Drag/drop path uses optimistic update + rollback on mutation error.

## Conflict Handling
- Last successful server write wins.
- Event stream drives eventual consistency for all connected viewers.

## Future Hardening
- Add idempotency/event versioning for very high concurrency.
- Add reconnect/rejoin handling and missed-event replay support if required.
