# Database Schema Diagram

```mermaid
erDiagram
    USER ||--o{ BOARD : member_of
    USER ||--o{ BOARD : created
    BOARD ||--o{ LIST : contains
    BOARD ||--o{ TASK : contains
    LIST ||--o{ TASK : contains
    USER ||--o{ TASK : assigned
    USER ||--o{ ACTIVITY : performs
    BOARD ||--o{ ACTIVITY : has
    TASK ||--o{ ACTIVITY : tracked_for

    USER {
      ObjectId _id
      string name
      string email
      string passwordHash
      string avatar
      datetime createdAt
      datetime updatedAt
    }

    BOARD {
      ObjectId _id
      string title
      string description
      ObjectId createdBy
      ObjectId[] members
      object memberRoles
      datetime createdAt
      datetime updatedAt
    }

    LIST {
      ObjectId _id
      ObjectId boardId
      string title
      number order
      datetime createdAt
      datetime updatedAt
    }

    TASK {
      ObjectId _id
      ObjectId boardId
      ObjectId listId
      string title
      string description
      string label
      string priority
      datetime dueDate
      ObjectId[] assignedTo
      number order
      ObjectId createdBy
      datetime createdAt
      datetime updatedAt
    }

    ACTIVITY {
      ObjectId _id
      ObjectId boardId
      ObjectId taskId
      ObjectId userId
      string action
      object meta
      datetime createdAt
      datetime updatedAt
    }
```

## Indexing Strategy
- `User.email` unique index for login lookups.
- `Board.members` index for fast board visibility filtering.
- `Board.title` text index for board search.
- `List.boardId` index for ordered list fetch.
- `Task.boardId`, `Task.listId` indexes for board/list task queries.
- `Task.boardId + Task.listId + Task.order` compound index for stable list ordering.
- `Task.title` text index for task search.
- `Task.boardId + Task.dueDate` index for due-date queries/filters.
- `Activity.boardId` index for activity feed pagination.
