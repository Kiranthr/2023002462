# Stage 1

## Notification System API Design



http/api/notifications




### 1. Get All Notifications

httpGET /api/notifications


Response json
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


### 2. Get Notification By ID

http/GET /api/notifications/{id}


Response json
{
  "id": "uuid",
  "type": "Placement",
  "message": "Amazon Hiring",
  "isRead": false
}


### 3. Create Notification

http/POST /api/notifications


Request

json
{
  "type": "Placement",
  "message": "Amazon Hiring"
}


Response

json
{
  "id": "uuid",
  "message": "Notification Created"
}


### 4. Mark Notification As Read

http/PATCH /api/notifications/{id}/read


Response

json
{
  "message": "Notification marked as read"
}




### 5. Delete Notification

http/DELETE /api/notifications/{id}


Response

json
{
  "message": "Notification deleted"
}




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


## Database Schema

### Students Table

 Column     | Type      
 ---------- | --------- 
 student_id | UUID      
 name       | VARCHAR   
 email      | VARCHAR   
 created_at | TIMESTAMP 



### Notifications Table

 Column            | Type      
 ----------------- | --------- 
 id                | UUID      
 student_id        | UUID      
 notification_type | VARCHAR   
 message           | TEXT      
 is_read           | BOOLEAN   
 created_at        | TIMESTAMP 

# Stage 3

## Query Optimization

Given Query

sql
SELECT *
FROM notifications
WHERE studentID = 1042
AND isRead = false
ORDER BY createdAt ASC;



## Why This Query Becomes Slow

When the notifications table grows to millions of rows:

1. Full Table Scan

   * Database scans all rows.

2. Sorting Cost

   * ORDER BY createdAt requires sorting.

3. Large Dataset

   * More rows mean longer execution time.


## Recommended Index

sql
CREATE INDEX idx_notifications
ON notifications(studentID, isRead, createdAt);




## Why This Index Helps

The database can directly locate:

* studentID
* unread notifications
* createdAt ordering

without scanning the entire table.


## Time Complexity

Before Index:
text
O(N)

After Index:

text
O(log N)


## Why Not Index Every Column?

Problems:

1. Increased Storage
2. Slower INSERT operations
3. Slower UPDATE operations
4. Index maintenance overhead

Therefore indexes should be created only for frequently queried columns.



## Placement Notification Query


SELECT DISTINCT studentID
FROM notifications
WHERE notificationType = 'Placement'
AND createdAt >= NOW() - INTERVAL '7 days';
```

### Recommended Index


CREATE INDEX idx_placement_notifications
ON notifications(notificationType, createdAt);


This improves filtering and date-range queries.
