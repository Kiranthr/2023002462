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
