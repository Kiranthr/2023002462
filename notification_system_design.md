# Stage 1

## Notification System API Design

### Base URL

```http
/api/notifications
```

---

### 1. Get All Notifications

```http
GET /api/notifications
```

Response

```json
{
  "notifications": [
    {
      "id": "uuid",
      "type": "Placement",
      "message": "Amazon Hiring",
      "isRead": false,
      "createdAt": "2026-04-22T10:00:00Z"
    }
  ]
}
```

---

### 2. Get Notification By ID

```http
GET /api/notifications/{id}
```

Response

```json
{
  "id": "uuid",
  "type": "Placement",
  "message": "Amazon Hiring",
  "isRead": false
}
```

---

### 3. Create Notification

```http
POST /api/notifications
```

Request

```json
{
  "type": "Placement",
  "message": "Amazon Hiring"
}
```

Response

```json
{
  "id": "uuid",
  "message": "Notification Created"
}
```

---

### 4. Mark Notification As Read

```http
PATCH /api/notifications/{id}/read
```

Response

```json
{
  "message": "Notification marked as read"
}
```

---

### 5. Delete Notification

```http
DELETE /api/notifications/{id}
```

Response

```json
{
  "message": "Notification deleted"
}
```

---

## Real-Time Notification Mechanism

Technology Used: WebSocket

Flow:

1. User logs in
2. Client establishes WebSocket connection
3. Server generates notification
4. Notification pushed instantly
5. Client receives without page refresh

Benefits:

* Real-time updates
* Reduced polling
* Better user experience
* Scalable communication

# Stage 2

## Database Choice

I recommend PostgreSQL as the persistent storage database.

### Reasons

* ACID compliant
* Reliable and consistent
* Supports indexing
* Supports large datasets efficiently
* Easy integration with Node.js and MERN applications

---

## Database Schema

### Students Table

| Column     | Type      |
| ---------- | --------- |
| student_id | UUID      |
| name       | VARCHAR   |
| email      | VARCHAR   |
| created_at | TIMESTAMP |

---

### Notifications Table

| Column            | Type      |
| ----------------- | --------- |
| id                | UUID      |
| student_id        | UUID      |
| notification_type | VARCHAR   |
| message           | TEXT      |
| is_read           | BOOLEAN   |
| created_at        | TIMESTAMP |

---

## Example Queries

### Get Notifications of a Student

```sql
SELECT *
FROM notifications
WHERE student_id = '1042';
```

### Get Unread Notifications

```sql
SELECT *
FROM notifications
WHERE student_id = '1042'
AND is_read = false;
```

### Mark Notification Read

```sql
UPDATE notifications
SET is_read = true
WHERE id = 'notification_id';
```

### Create Notification

```sql
INSERT INTO notifications
(id, student_id, notification_type, message, is_read, created_at)
VALUES
(uuid_generate_v4(),
'1042',
'Placement',
'Amazon Hiring',
false,
NOW());
```

---

## Problems When Data Grows

As notification volume increases:

* Queries become slower
* Database size increases
* Sorting operations become expensive
* High read traffic affects performance

---

## Solutions

### Indexing

Create indexes on:

* student_id
* is_read
* created_at

### Partitioning

Partition notifications by date.

### Caching

Use Redis for frequently accessed notifications.

### Read Replicas

Use replicas to distribute read traffic.
